const calculatePriorityScore = (note) => {
    const now = new Date();
    const createdAt = new Date(note.createdAt);
    const pendingDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const reports = note.reportsCount || 0;
    return reports * 5 + pendingDays * 3;
};

/** Student-selected upload priority: High reviewed before Medium before Low */
const PRIORITY_LEVEL_RANK = { High: 3, Medium: 2, Low: 1 };

const levelRank = (level) => PRIORITY_LEVEL_RANK[level] ?? PRIORITY_LEVEL_RANK.Medium;

const sortByPriority = (notes) => {
    return notes
        .map((note) => ({
            ...note.toObject(),
            priorityScore: calculatePriorityScore(note),
        }))
        .sort((a, b) => {
            const byLevel = levelRank(b.priorityLevel) - levelRank(a.priorityLevel);
            if (byLevel !== 0) return byLevel;
            if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
};

module.exports = { calculatePriorityScore, sortByPriority };
