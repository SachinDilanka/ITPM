import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Paper,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Collapse,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  ThumbUp,
  Comment,
  Share,
  Delete,
  Edit,
  Send,
  Close,
  ExpandMore,
  School,
  CalendarToday,
  Book,
  FilterList,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import { apiUrl } from '../../config/api';
import { getInitials } from '../../utils/helpers';

const subjects = [
  'Introduction to Programming',
  'Network Design and Management',
  'Database Systems',
  'Programming Applications and Frameworks',
];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const semesters = [
  { label: '1st Semester', value: 1 },
  { label: '2nd Semester', value: 2 },
];

function semesterLabel(n) {
  if (n === 1) return '1st Semester';
  if (n === 2) return '2nd Semester';
  return `Semester ${n}`;
}

const Questions = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [shareAnchor, setShareAnchor] = useState(null);
  const [shareQuestion, setShareQuestion] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    academicYear: '2nd Year',
    semester: 1,
    subject: '',
    module: 'General',
  });

  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  const mapComment = (c) => ({
    id: c._id,
    content: c.content,
    author: c.author,
    createdAt: c.createdAt,
    likes: c.likes || [],
  });

  const loadComments = async (questionId) => {
    const res = await fetch(apiUrl(`/api/qna/comments/question/${questionId}`));
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapComment) : [];
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', page: '1' });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (filterSubject) params.set('subject', filterSubject);
      if (filterYear) params.set('academicYear', filterYear);
      if (filterSemester) params.set('semester', String(filterSemester));

      const res = await fetch(apiUrl(`/api/questions?${params}`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load questions');

      const list = data.questions || [];
      const withComments = await Promise.all(
        list.map(async (q) => {
          const comments = await loadComments(q._id);
          return { ...q, comments };
        })
      );
      setQuestions(withComments);
    } catch (e) {
      showSnack(e.message || 'Failed to load', 'error');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterSubject, filterYear, filterSemester]);

  useEffect(() => {
    const t = setTimeout(() => fetchQuestions(), 300);
    return () => clearTimeout(t);
  }, [fetchQuestions]);

  const filteredLocal = useMemo(() => {
    return questions;
  }, [questions]);

  const isAuthor = (q) => userId && String(q.author?._id || q.author) === String(userId);
  const likedByMe = (q) => Array.isArray(q.likes) && q.likes.some((id) => String(id) === String(userId));

  const handleLike = async (q) => {
    if (!userId) {
      showSnack('Sign in to like', 'warning');
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/questions/${q._id}/like`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Like failed');
      const updated = data.question || data;
      setQuestions((prev) =>
        prev.map((x) =>
          x._id === q._id
            ? { ...x, likes: updated.likes || x.likes }
            : x
        )
      );
    } catch (e) {
      showSnack(e.message, 'error');
    }
  };

  const submitComment = async (q) => {
    const text = (commentDrafts[q._id] || '').trim();
    if (!text || !userId) return;
    try {
      const res = await fetch(apiUrl('/api/qna/comments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, author: userId, question: q._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Comment failed');
      const nc = mapComment(data);
      setQuestions((prev) =>
        prev.map((x) => (x._id === q._id ? { ...x, comments: [...(x.comments || []), nc] } : x))
      );
      setCommentDrafts((d) => ({ ...d, [q._id]: '' }));
      showSnack('Comment posted');
    } catch (e) {
      showSnack(e.message, 'error');
    }
  };

  const shareToProfile = async (q) => {
    if (!userId) return;
    try {
      const res = await fetch(apiUrl(`/api/questions/${q._id}/share`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Share failed');
      setQuestions((prev) => prev.map((x) => (x._id === q._id ? { ...x, shares: data.shares ?? x.shares } : x)));
      setShareAnchor(null);
      showSnack('Shared to your profile');
      window.dispatchEvent(new CustomEvent('questionShared', { detail: { ...q, shares: data.shares } }));
    } catch (e) {
      showSnack(e.message, 'error');
    }
  };

  const deleteQuestion = async (q) => {
    if (!userId || !isAuthor(q)) return;
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      const res = await fetch(apiUrl(`/api/questions/${q._id}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setQuestions((prev) => prev.filter((x) => x._id !== q._id));
      showSnack('Question deleted');
    } catch (e) {
      showSnack(e.message, 'error');
    }
  };

  const deleteComment = async (questionId, commentId) => {
    if (!userId) return;
    try {
      const res = await fetch(apiUrl(`/api/qna/comments/${commentId}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setQuestions((prev) =>
        prev.map((x) =>
          x._id === questionId ? { ...x, comments: (x.comments || []).filter((c) => c.id !== commentId) } : x
        )
      );
      showSnack('Comment removed');
    } catch (e) {
      showSnack(e.message, 'error');
    }
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!userId) {
      showSnack('Sign in to post', 'warning');
      return;
    }
    if (!form.title.trim() || !form.description.trim() || !form.subject || !form.module.trim()) {
      showSnack('Title, description, subject, and module are required', 'error');
      return;
    }
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tags,
      semester: form.semester,
      academicYear: form.academicYear,
      subject: form.subject,
      module: form.module.trim(),
      author: userId,
    };
    try {
      if (editing) {
        const res = await fetch(apiUrl(`/api/questions/${editing._id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, author: userId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Update failed');
        const comments = questions.find((x) => x._id === editing._id)?.comments || [];
        setQuestions((prev) => prev.map((x) => (x._id === editing._id ? { ...data, comments } : x)));
        showSnack('Question updated');
      } else {
        const res = await fetch(apiUrl('/api/questions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Post failed');
        setQuestions((prev) => [{ ...data, comments: [] }, ...prev]);
        showSnack('Question posted');
      }
      setOpenDialog(false);
      setEditing(null);
      setForm({
        title: '',
        description: '',
        tags: '',
        academicYear: '2nd Year',
        semester: 1,
        subject: '',
        module: 'General',
      });
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      title: q.title,
      description: q.description,
      tags: Array.isArray(q.tags) ? q.tags.join(', ') : '',
      academicYear: q.academicYear || '2nd Year',
      semester: q.semester || 1,
      subject: q.subject || '',
      module: q.module || 'General',
    });
    setOpenDialog(true);
  };

  const cardPaper = {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(147, 51, 234, 0.25)',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #9333ea, #ec4899)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Questions &amp; Answers
      </Typography>
      <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
        Ask course questions, comment, and share to your profile.
      </Typography>

      <Paper sx={{ p: 3, mb: 3, ...cardPaper }}>
        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </InputAdornment>
                ),
                sx: { color: '#fff' },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Subject</InputLabel>
              <Select
                value={filterSubject}
                label="Subject"
                onChange={(e) => setFilterSubject(e.target.value)}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="">All</MenuItem>
                {subjects.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Year</InputLabel>
              <Select value={filterYear} label="Year" onChange={(e) => setFilterYear(e.target.value)} sx={{ color: '#fff' }}>
                <MenuItem value="">All</MenuItem>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Semester</InputLabel>
              <Select
                value={filterSemester}
                label="Semester"
                onChange={(e) => setFilterSemester(e.target.value)}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="">All</MenuItem>
                {semesters.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : filteredLocal.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', ...cardPaper }}>
          <Typography color="text.secondary">No questions yet. Be the first to ask.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredLocal.map((q) => (
            <Card key={q._id} sx={{ ...cardPaper }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      {q.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 1 }}>{q.description}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      <Chip icon={<School />} size="small" label={q.academicYear} sx={{ color: '#fff' }} />
                      <Chip icon={<CalendarToday />} size="small" label={semesterLabel(q.semester)} sx={{ color: '#fff' }} />
                      <Chip icon={<Book />} size="small" label={q.subject} sx={{ color: '#fff' }} />
                      {q.module && <Chip size="small" label={q.module} variant="outlined" sx={{ color: 'rgba(255,255,255,0.85)' }} />}
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: '#6366f1' }}>{getInitials(q.author?.name || q.author?.username || 'U')}</Avatar>
                </Box>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(147,51,234,0.2)' }} />
              <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                <IconButton size="small" onClick={() => handleLike(q)} sx={{ color: likedByMe(q) ? '#c084fc' : 'rgba(255,255,255,0.5)' }}>
                  <ThumbUp fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {q.likes?.length || 0}
                </Typography>
                <IconButton size="small" onClick={() => setExpanded((e) => ({ ...e, [q._id]: !e[q._id] }))} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Comment fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {q.comments?.length || 0}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(ev) => {
                    setShareQuestion(q);
                    setShareAnchor(ev.currentTarget);
                  }}
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <Share fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {q.shares || 0}
                </Typography>
                {isAuthor(q) && (
                  <>
                    <Button size="small" startIcon={<Edit />} onClick={() => openEdit(q)} sx={{ color: '#e9d5ff' }}>
                      Edit
                    </Button>
                    <IconButton size="small" onClick={() => deleteQuestion(q)} sx={{ color: '#f87171' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                )}
                <Button
                  size="small"
                  endIcon={<ExpandMore sx={{ transform: expanded[q._id] ? 'rotate(180deg)' : 'none' }} />}
                  onClick={() => setExpanded((e) => ({ ...e, [q._id]: !e[q._id] }))}
                  sx={{ color: 'rgba(255,255,255,0.8)', ml: 'auto' }}
                >
                  Comments
                </Button>
              </CardActions>
              <Collapse in={expanded[q._id]}>
                <Box sx={{ px: 2, pb: 2, pt: 0, borderTop: '1px solid rgba(147,51,234,0.15)' }}>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Write a comment…"
                      value={commentDrafts[q._id] || ''}
                      onChange={(e) => setCommentDrafts((d) => ({ ...d, [q._id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitComment(q);
                        }
                      }}
                      InputProps={{ sx: { color: '#fff' } }}
                    />
                    <IconButton onClick={() => submitComment(q)} sx={{ color: '#c084fc' }}>
                      <Send />
                    </IconButton>
                  </Box>
                  {(q.comments || []).map((c) => {
                    const aid = c.author?._id || c.author;
                    const canDelete =
                      userId &&
                      (String(aid) === String(userId) || isAuthor(q));
                    return (
                      <Paper key={c.id} sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#fff' }}>
                              {c.author?.name || c.author?.username || 'User'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                              {c.content}
                            </Typography>
                          </Box>
                          {canDelete && (
                            <IconButton size="small" onClick={() => deleteComment(q._id, c.id)} sx={{ color: '#f87171' }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Collapse>
            </Card>
          ))}
        </Box>
      )}

      <Menu anchorEl={shareAnchor} open={Boolean(shareAnchor)} onClose={() => setShareAnchor(null)}>
        <MenuItem
          onClick={() => {
            if (shareQuestion) shareToProfile(shareQuestion);
          }}
        >
          Share to profile
        </MenuItem>
      </Menu>

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #9333ea, #ec4899)',
          '&:hover': { background: 'linear-gradient(45deg, #7c3aed, #db2777)' },
        }}
        onClick={() => {
          setEditing(null);
          setForm({
            title: '',
            description: '',
            tags: '',
            academicYear: '2nd Year',
            semester: 1,
            subject: '',
            module: 'General',
          });
          setOpenDialog(true);
        }}
      >
        Ask
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { ...cardPaper } }}>
        <DialogTitle sx={{ color: '#fff' }}>
          {editing ? 'Edit question' : 'Ask a question'}
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={saveQuestion}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              InputProps={{ sx: { color: '#fff' } }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              InputProps={{ sx: { color: '#fff' } }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Academic year</InputLabel>
                  <Select
                    label="Academic year"
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    sx={{ color: '#fff' }}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Semester</InputLabel>
                  <Select
                    label="Semester"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    sx={{ color: '#fff' }}
                  >
                    {semesters.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Subject</InputLabel>
                  <Select
                    label="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    sx={{ color: '#fff' }}
                  >
                    {subjects.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Module"
                  value={form.module}
                  onChange={(e) => setForm({ ...form, module: e.target.value })}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                  InputProps={{ sx: { color: '#fff' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                  InputProps={{ sx: { color: '#fff' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(45deg, #9333ea, #ec4899)' }}>
              {editing ? 'Save' : 'Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Questions;
