import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Paper,
  Grid,
  Dialog,
  TextField,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CheckCircle as MuiCheckCircle } from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import { apiUrl } from '../../config/api';
import BeautifulPollCreator from '../../components/polls/BeautifulPollCreator.jsx';
import { DeleteConfirmNotification } from '../../components/notifications/DeleteNotification.jsx';
import { ActionConfirmDialog } from '../../components/dialogs/ActionConfirmDialog.jsx';
import AICorrectionButton from '../../components/ai/AICorrectionButton.jsx';

function normalizePoll(poll, userId) {
  const uid = userId ? String(userId) : '';
  const rawOpts = poll.options || [];
  const withCounts = rawOpts.map((opt) => {
    const votes = Array.isArray(opt.votes) ? opt.votes.map(String) : [];
    const voteCount = votes.length;
    return {
      ...opt,
      text: opt.text,
      votes,
      voteCount,
      userSelected: Boolean(uid && votes.includes(uid)),
    };
  });
  const totalVotes =
    typeof poll.totalVotes === 'number'
      ? poll.totalVotes
      : withCounts.reduce((s, o) => s + o.voteCount, 0);
  const options = withCounts.map((o) => ({
    ...o,
    percentage: totalVotes ? Math.round((o.voteCount / totalVotes) * 100) : 0,
  }));
  const hasVoted = options.some((o) => o.userSelected);
  const authorRef = poll.author;
  const authorId =
    authorRef && typeof authorRef === 'object' ? String(authorRef._id || authorRef.id || '') : String(authorRef || '');
  const accepting = poll.isActive !== false && !poll.isEnded && !poll.isDeleted;
  return {
    ...poll,
    options,
    totalVotes,
    hasVoted,
    authorId,
    accepting,
  };
}

const Polls = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const currentUser = {
    id: userId,
    name: user?.name || user?.username || 'User',
    avatar: (user?.username || user?.name || 'U').charAt(0).toUpperCase(),
  };

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState(0);
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [pendingPoll, setPendingPoll] = useState(null);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/polls?limit=50'));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load polls');
      const list = Array.isArray(data.polls) ? data.polls : [];
      setPolls(list.map((p) => normalizePoll(p, userId)));
    } catch (e) {
      setSnack({ open: true, message: e.message || 'Could not load polls', severity: 'error' });
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const filtered = useMemo(() => {
    let list = polls;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.subject && p.subject.toLowerCase().includes(q))
      );
    }
    if (filterTab === 1) {
      list = list.filter((p) => p.accepting);
    }
    return list;
  }, [polls, search, filterTab]);

  const handleCreatePoll = async (pollDataFromCreator) => {
    if (!userId) {
      setSnack({ open: true, message: 'Sign in to create a poll', severity: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const body = {
        title: pollDataFromCreator.title.trim(),
        description: (pollDataFromCreator.description || '').trim(),
        options: pollDataFromCreator.options.filter((o) => String(o).trim()),
        subject: pollDataFromCreator.subject,
        year: Number(pollDataFromCreator.year) || 1,
        semester: Number(pollDataFromCreator.semester) || 1,
        isMultipleChoice: Boolean(pollDataFromCreator.isMultipleChoice),
        author: pollDataFromCreator.author || userId,
      };
      const res = await fetch(apiUrl('/api/polls'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create failed');
      setPolls((prev) => [normalizePoll(data, userId), ...prev]);
      setOpenDialog(false);
      setSnack({ open: true, message: 'Poll created', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const vote = async (pollId, optionIndex) => {
    if (!userId) {
      setSnack({ open: true, message: 'Sign in to vote', severity: 'warning' });
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/polls/${pollId}/vote`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, optionIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Vote failed');
      setPolls((prev) => prev.map((p) => (p._id === pollId ? normalizePoll(data, userId) : p)));
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!pendingPoll || !userId) return;
    try {
      const res = await fetch(apiUrl(`/api/polls/${pendingPoll._id}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setPolls((prev) => prev.filter((p) => p._id !== pendingPoll._id));
      setSnack({ open: true, message: 'Poll deleted', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    } finally {
      setDeleteOpen(false);
      setPendingPoll(null);
    }
  };

  const confirmEnd = async () => {
    if (!pendingPoll || !userId) return;
    try {
      const res = await fetch(apiUrl(`/api/polls/${pendingPoll._id}/end`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not end poll');
      setPolls((prev) => prev.map((p) => (p._id === pendingPoll._id ? normalizePoll(data, userId) : p)));
      setSnack({ open: true, message: 'Poll ended', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: 'error' });
    } finally {
      setEndOpen(false);
      setPendingPoll(null);
    }
  };

  const isAuthor = (poll) => userId && poll.authorId === String(userId);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Academic Polls
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create polls, vote, and view results — connected to your backend.
          </Typography>
        </motion.div>

        <Paper
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.25)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search polls…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Tabs value={filterTab} onChange={(_, v) => setFilterTab(v)} textColor="inherit" TabIndicatorProps={{ sx: { bgcolor: '#9333ea' } }}>
                <Tab label="All" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: '#fff' } }} />
                <Tab label="Active" sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: '#fff' } }} />
              </Tabs>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              '&:hover': { background: 'linear-gradient(45deg, #7c3aed, #db2777)' },
            }}
          >
            Create poll
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#9333ea' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', ...{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' } }}>
            <Typography color="text.secondary">No polls match your filters.</Typography>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setOpenDialog(true)}>
              Create the first poll
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((poll) => (
              <Grid key={poll._id} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(147, 51, 234, 0.25)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {poll.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={poll.accepting ? 'Active' : 'Ended'}
                        sx={{
                          bgcolor: poll.accepting ? 'rgba(16,185,129,0.25)' : 'rgba(107,114,128,0.35)',
                          color: '#fff',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 2 }}>
                      {poll.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={poll.subject} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#fbbf24' }} />
                      <Chip label={`Year ${poll.year} · Sem ${poll.semester}`} size="small" variant="outlined" sx={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} />
                      <Chip label={`${poll.totalVotes || 0} votes`} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {poll.options.map((opt, index) => (
                        <Box key={opt._id || index}>
                          <Paper
                            onClick={() => poll.accepting && vote(poll._id, index)}
                            sx={{
                              p: 1.5,
                              cursor: poll.accepting ? 'pointer' : 'default',
                              bgcolor: opt.userSelected ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255,255,255,0.04)',
                              border: opt.userSelected ? '1px solid rgba(147,51,234,0.5)' : '1px solid rgba(255,255,255,0.08)',
                              '&:hover': poll.accepting ? { bgcolor: 'rgba(147, 51, 234, 0.12)' } : {},
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: '#fff', fontWeight: opt.userSelected ? 600 : 400 }}>{opt.text}</Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {opt.voteCount} ({opt.percentage}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={opt.percentage}
                              sx={{
                                mt: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: opt.userSelected ? 'linear-gradient(90deg,#9333ea,#ec4899)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                                },
                              }}
                            />
                          </Paper>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 2 }}>
                    {isAuthor(poll) && poll.accepting && (
                      <Tooltip title="End poll">
                        <IconButton size="small" onClick={() => { setPendingPoll(poll); setEndOpen(true); }} sx={{ color: '#fb923c' }}>
                          <CheckCircle size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAuthor(poll) && (
                      <Tooltip title="Delete poll">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setPendingPoll(poll);
                            setDeleteOpen(true);
                          }}
                          sx={{ color: '#f87171' }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <AICorrectionButton
                      poll={poll}
                      disabled={!poll.accepting}
                      onCorrectionReceived={(correction) => {
                        if (correction.correctAnswer >= 0 && correction.correctAnswer < poll.options.length && !poll.hasVoted) {
                          vote(poll._id, correction.correctAnswer);
                        }
                      }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            maxHeight: '92vh',
          },
        }}
      >
        <BeautifulPollCreator
          currentUser={currentUser}
          onCreatePoll={handleCreatePoll}
          isSubmitting={isSubmitting}
          onCancel={() => setOpenDialog(false)}
        />
      </Dialog>

      <DeleteConfirmNotification
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setPendingPoll(null); }}
        itemName={pendingPoll?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteOpen(false); setPendingPoll(null); }}
      />

      <ActionConfirmDialog
        open={endOpen}
        onClose={() => { setEndOpen(false); setPendingPoll(null); }}
        title="End poll"
        message="Are you sure you want to end"
        itemName={pendingPoll?.title || 'this poll'}
        confirmText="End poll"
        cancelText="Cancel"
        onConfirm={confirmEnd}
        onCancel={() => { setEndOpen(false); setPendingPoll(null); }}
        severity="end"
        icon={<MuiCheckCircle sx={{ fontSize: 56, color: '#fb923c' }} />}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Polls;
