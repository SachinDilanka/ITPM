import express from 'express';
import mongoose from 'mongoose';
import Poll from '../models/Poll.js';

const router = express.Router();

function pollWithPercentages(pollDoc) {
    const poll = pollDoc.toObject ? pollDoc.toObject() : pollDoc;
    const totalVotes = (poll.options || []).reduce((sum, option) => sum + (option.votes?.length || 0), 0);
    return {
        ...poll,
        options: (poll.options || []).map((option) => {
            const o = option.toObject ? option.toObject() : option;
            const v = o.votes?.length || 0;
            return {
                ...o,
                percentage: totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0,
            };
        }),
        totalVotes,
    };
}

router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const { subject, semester } = req.query;

        const query = { isDeleted: false };
        if (subject) query.subject = subject;
        if (semester !== undefined && semester !== '') query.semester = parseInt(semester, 10);

        const polls = await Poll.find(query)
            .populate('author', 'name username profilePicture avatarUrl reputation')
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Poll.countDocuments(query);

        res.json({
            polls,
            totalPages: Math.ceil(total / limit) || 1,
            currentPage: page,
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid poll id' });
        }

        const poll = await Poll.findById(req.params.id)
            .populate('author', 'name username profilePicture avatarUrl reputation')
            .select('-__v');

        if (!poll || poll.isDeleted) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        res.json(pollWithPercentages(poll));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, options, subject, year, semester, author, isMultipleChoice } = req.body;

        if (!title || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'Title and at least two options are required' });
        }
        if (!author || !mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: 'Valid author id is required' });
        }
        if (!subject || !String(subject).trim()) {
            return res.status(400).json({ message: 'subject is required' });
        }

        const y = year != null ? Number(year) : 1;
        const s = semester != null ? Number(semester) : 1;
        if (y < 1 || y > 4 || s < 1 || s > 2) {
            return res.status(400).json({ message: 'year must be 1–4 and semester 1–2' });
        }

        const poll = new Poll({
            title,
            description: description || '',
            options: options.map((option) => ({
                text: typeof option === 'string' ? option : option.text,
                votes: [],
            })),
            subject: String(subject).trim(),
            year: y,
            semester: s,
            author,
            isMultipleChoice: Boolean(isMultipleChoice),
        });

        const saved = await poll.save();
        await saved.populate('author', 'name username profilePicture avatarUrl reputation');
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/vote', async (req, res) => {
    try {
        const { userId, optionIndex } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Valid userId is required' });
        }
        if (typeof optionIndex !== 'number' || optionIndex < 0) {
            return res.status(400).json({ message: 'Valid optionIndex is required' });
        }

        const poll = await Poll.findById(req.params.id);
        if (!poll || poll.isDeleted) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (!poll.isActive || poll.isEnded) {
            return res.status(400).json({ message: 'Poll is not accepting votes' });
        }
        if (!poll.options[optionIndex]) {
            return res.status(400).json({ message: 'Invalid option index' });
        }

        const uid = String(userId);
        poll.options.forEach((option) => {
            const i = option.votes.findIndex((id) => String(id) === uid);
            if (i !== -1) option.votes.splice(i, 1);
        });

        poll.options[optionIndex].votes.push(uid);
        await poll.save();

        const fresh = await Poll.findById(poll._id).populate(
            'author',
            'name username profilePicture avatarUrl reputation'
        );
        res.json(pollWithPercentages(fresh));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/deactivate', async (req, res) => {
    try {
        const { userId } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll || poll.isDeleted) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (!userId || poll.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only deactivate your own polls' });
        }
        poll.isActive = false;
        await poll.save();
        const fresh = await Poll.findById(poll._id).populate(
            'author',
            'name username profilePicture avatarUrl reputation'
        );
        res.json(pollWithPercentages(fresh));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/end', async (req, res) => {
    try {
        const { userId } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll || poll.isDeleted) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (!userId || poll.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only end your own polls' });
        }
        poll.isEnded = true;
        poll.isActive = false;
        await poll.save();
        const fresh = await Poll.findById(poll._id).populate(
            'author',
            'name username profilePicture avatarUrl reputation'
        );
        res.json(pollWithPercentages(fresh));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll || poll.isDeleted) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        if (!userId || poll.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own polls' });
        }
        poll.isDeleted = true;
        await poll.save();
        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
