const calculatePriorityScore = (note) => {
    const now = new Date();
    const createdAt = new Date(note.createdAt);
    const pendingDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return note.reportsCount * 5 + pendingDays * 3;
};

const sortByPriority = (notes) => {
    return notes
        .map((note) => ({
            ...note.toObject(),
            priorityScore: calculatePriorityScore(note),
        }))
        .sort((a, b) => b.priorityScore - a.priorityScore);
};

module.exports = { calculatePriorityScore, sortByPriority };
