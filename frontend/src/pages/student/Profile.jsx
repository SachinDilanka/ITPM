import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Avatar,
    Button as MuiButton,
    Grid,
    Chip,
    Tabs,
    Tab,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Snackbar,
    Alert,
    Stack,
    Menu,
    MenuItem,
    LinearProgress,
} from '@mui/material';
import {
    Share as ShareMuiIcon,
    Edit,
    CameraAlt,
    DeleteForever,
    School,
    CalendarToday,
    Article,
    ThumbUp,
    Poll,
    QuestionAnswer,
    MoreVert,
    Logout,
    Shield,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { getMyNotesApi } from '../../api/notesApi';
import { uploadAvatarApi, updateProfileApi, getProfileSummaryApi, deleteAccountApi } from '../../api/authApi';
import { apiUrl } from '../../config/api';
import { getMediaUrl, formatDate, capitalizeFirst, getInitials, truncateText, getUserMongoId } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const noteStatusLabel = (status) => {
    const s = status?.toLowerCase?.();
    if (s === 'pending') return 'Pending Approval';
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return status || 'Unknown';
};

const darkPaper = {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(147, 51, 234, 0.25)',
    color: 'rgba(255,255,255,0.92)',
};

const Profile = () => {
    const { user, patchUser, logout, loadUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [settingsAnchor, setSettingsAnchor] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [followDemo, setFollowDemo] = useState(false);
    const [sharedQuestions, setSharedQuestions] = useState([]);
    const [sharedLoading, setSharedLoading] = useState(false);
    const [unsharingId, setUnsharingId] = useState(null);

    const [editForm, setEditForm] = useState({
        name: '',
        username: '',
        bio: '',
        semester: '',
        branch: '',
    });

    const {
        data: myNotesData,
        loading: notesLoading,
        error: notesError,
    } = useFetch(getMyNotesApi);

    const notes = myNotesData?.notes || [];

    const loadSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const res = await getProfileSummaryApi();
            setSummary(res.data?.data ?? null);
        } catch {
            setSummary(null);
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const loadSharedQuestions = useCallback(async () => {
        const uid = getUserMongoId(user);
        if (!uid) {
            setSharedQuestions([]);
            setSharedLoading(false);
            return;
        }
        setSharedLoading(true);
        try {
            const res = await fetch(apiUrl(`/api/users/${uid}/shared`));
            const data = await res.json().catch(() => []);
            if (!res.ok || !Array.isArray(data)) {
                setSharedQuestions([]);
                return;
            }
            setSharedQuestions(data);
        } catch {
            setSharedQuestions([]);
        } finally {
            setSharedLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSharedQuestions();
    }, [loadSharedQuestions]);

    useEffect(() => {
        if (!user) return;
        setEditForm({
            name: user.name || '',
            username: user.username || '',
            bio: user.bio || '',
            semester: user.semester != null ? String(user.semester) : '',
            branch: user.branch || '',
        });
    }, [user]);

    const avatarSrc = getMediaUrl(user?.avatarUrl);
    const displayHandle = user?.username?.trim() || user?.email?.split('@')[0] || 'user';
    const joinDate = user?.createdAt
        ? formatDate(user.createdAt)
        : '—';

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const openNote = (note) => {
        if (!note) return;
        if (note.status === 'pending') {
            navigate(`/student/notes/${note._id}/edit`);
            return;
        }
        navigate(`/student/notes/${note._id}`);
    };

    const handleAvatarPick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setAvatarError(null);
        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await uploadAvatarApi(formData);
            const payload = res.data?.data ?? res.data;
            const pic = payload?.profilePicture || payload?.avatarUrl || '';
            const nextUser = payload?.user;
            if (nextUser) {
                patchUser({
                    profilePicture: nextUser.profilePicture,
                    avatarUrl: nextUser.avatarUrl || pic,
                    ...nextUser,
                });
            } else {
                patchUser({ profilePicture: pic || null, avatarUrl: pic });
            }
            await loadUser();
            showSnackbar('Profile photo updated');
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not upload photo.';
            setAvatarError(msg);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleShareProfile = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            showSnackbar('Profile link copied to clipboard');
        } catch {
            showSnackbar('Copy this URL from the address bar', 'info');
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const body = {
                name: editForm.name.trim(),
                username: editForm.username.trim() || undefined,
                bio: editForm.bio,
                branch: editForm.branch,
                semester: editForm.semester === '' ? null : Number(editForm.semester),
            };
            const res = await updateProfileApi(body);
            const u = res.data?.data;
            if (u) patchUser(u);
            await loadUser();
            setEditOpen(false);
            showSnackbar('Profile saved');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Could not save profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUnshareQuestion = async (questionId) => {
        const uid = getUserMongoId(user);
        if (!questionId || !uid) return;
        if (!window.confirm('Remove this question from your profile? It will stay on the Q&A board.')) return;
        setUnsharingId(questionId);
        try {
            const res = await fetch(apiUrl(`/api/questions/${questionId}/unshare`), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: String(uid) }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.message || 'Could not remove');
            setSharedQuestions((prev) => prev.filter((q) => String(q._id) !== String(questionId)));
            showSnackbar('Removed from your profile');
        } catch (err) {
            showSnackbar(err.message || 'Could not remove question', 'error');
        } finally {
            setUnsharingId(null);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            showSnackbar('Enter your password', 'error');
            return;
        }
        setDeleteLoading(true);
        try {
            await deleteAccountApi(deletePassword);
            logout();
            navigate('/login', { replace: true });
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Could not delete account', 'error');
        } finally {
            setDeleteLoading(false);
            setDeletePassword('');
            setDeleteOpen(false);
        }
    };

    const stats = summary?.stats || {
        notesUploaded: 0,
        approvedNotes: 0,
        questionsAsked: 0,
        pollsCreated: 0,
        totalLikes: 0,
        totalRatingStars: 0,
        commentsPosted: 0,
    };

    const recentActivity = summary?.recentActivity || [];

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
            />

            <Paper elevation={0} sx={{ p: 3, mb: 3, ...darkPaper, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        <MoreVert />
                    </IconButton>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={avatarSrc || undefined}
                            sx={{
                                width: 100,
                                height: 100,
                                fontSize: '2rem',
                                bgcolor: '#6d28d9',
                                border: '3px solid rgba(147, 51, 234, 0.5)',
                            }}
                        >
                            {!avatarSrc && getInitials(user?.name || user?.email || '?')}
                        </Avatar>
                        <Tooltip title={avatarLoading ? 'Uploading…' : 'Change photo'}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleAvatarPick}
                                    disabled={avatarLoading}
                                    sx={{
                                        position: 'absolute',
                                        bottom: -4,
                                        right: -4,
                                        bgcolor: '#9333ea',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#7c3aed' },
                                    }}
                                >
                                    <CameraAlt fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>

                    <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                            {user?.name || 'Student'}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 1 }}>@{displayHandle}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mb: 2, maxWidth: 560 }}>
                            {user?.bio?.trim() || 'Add a short bio so classmates know you better.'}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            {user?.semester != null && (
                                <Chip icon={<School sx={{ color: '#c4b5fd !important' }} />} label={`Semester ${user.semester}`} size="small" sx={{ bgcolor: 'rgba(147,51,234,0.2)', color: '#e9d5ff' }} />
                            )}
                            {user?.branch && (
                                <Chip label={user.branch} size="small" sx={{ bgcolor: 'rgba(236,72,153,0.15)', color: '#fbcfe8' }} />
                            )}
                            <Chip icon={<CalendarToday sx={{ color: '#86efac !important' }} />} label={`Joined ${joinDate}`} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#bbf7d0' }} />
                            <Chip label={capitalizeFirst(user?.role)} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#bfdbfe' }} />
                            {user?.isApproved ? (
                                <Chip label="Approved" size="small" color="success" variant="outlined" />
                            ) : (
                                <Chip label="Pending approval" size="small" color="warning" variant="outlined" />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            <Tooltip title="Demo toggle — social follow ships later">
                                <span>
                                    <MuiButton
                                        variant={followDemo ? 'outlined' : 'contained'}
                                        size="small"
                                        onClick={() => setFollowDemo(!followDemo)}
                                        sx={{
                                            textTransform: 'none',
                                            borderColor: 'rgba(147,51,234,0.5)',
                                            color: followDemo ? '#c4b5fd' : '#fff',
                                            background: followDemo ? 'transparent' : 'linear-gradient(45deg,#9333ea,#ec4899)',
                                        }}
                                    >
                                        {followDemo ? 'Following' : 'Follow'}
                                    </MuiButton>
                                </span>
                            </Tooltip>
                            <MuiButton variant="outlined" size="small" startIcon={<ShareMuiIcon />} onClick={handleShareProfile} sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.35)', color: '#e5e7eb' }}>
                                Share
                            </MuiButton>
                            <MuiButton variant="outlined" size="small" startIcon={<Edit />} onClick={() => setEditOpen(true)} sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.35)', color: '#e5e7eb' }}>
                                Edit profile
                            </MuiButton>
                            <MuiButton variant="outlined" size="small" color="error" startIcon={<DeleteForever />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none' }}>
                                Delete account
                            </MuiButton>
                        </Stack>

                        {avatarError && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                {avatarError}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Stack direction="row" spacing={4} sx={{ mt: 3, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    {[
                        { label: 'Followers', value: user?.followersCount ?? 0 },
                        { label: 'Following', value: user?.followingCount ?? 0 },
                        { label: 'Reputation', value: user?.reputation ?? 0 },
                    ].map((x) => (
                        <Box key={x.label} sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                {x.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                {x.label}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Paper>

            {summaryLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { icon: <Article sx={{ fontSize: 36, color: '#a78bfa' }} />, label: 'Notes uploaded', value: stats.notesUploaded },
                    { icon: <ThumbUp sx={{ fontSize: 36, color: '#4ade80' }} />, label: 'Star ratings (count)', value: stats.totalLikes },
                    { icon: <Poll sx={{ fontSize: 36, color: '#fb923c' }} />, label: 'Polls created', value: stats.pollsCreated },
                    { icon: <QuestionAnswer sx={{ fontSize: 36, color: '#f472b6' }} />, label: 'Questions asked', value: stats.questionsAsked },
                ].map((card) => (
                    <Grid key={card.label} size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', ...darkPaper }}>
                            <Box sx={{ mb: 1 }}>{card.icon}</Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
                                {summaryLoading ? '…' : card.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                                {card.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper elevation={0} sx={{ ...darkPaper, overflow: 'hidden' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    sx={{
                        borderBottom: '1px solid rgba(147,51,234,0.25)',
                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.65)', textTransform: 'none' },
                        '& .Mui-selected': { color: '#c4b5fd !important', fontWeight: 700 },
                        '& .MuiTabs-indicator': { bgcolor: '#9333ea' },
                    }}
                >
                    <Tab label="Activity" />
                    <Tab label="My notes" />
                    <Tab label="Community" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {activeTab === 0 && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#fff' }}>
                                Recent activity
                            </Typography>
                            {!recentActivity.length && !summaryLoading && (
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Upload a note to see activity here.</Typography>
                            )}
                            <Stack spacing={1}>
                                {recentActivity.map((a) => (
                                    <Paper key={String(a.id)} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(147,51,234,0.15)' }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{a.title}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                                            {a.meta ? `${a.meta} · ` : ''}
                                            {a.timestamp ? formatDate(a.timestamp) : ''}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.45)' }}>
                                Comments on PDFs: {stats.commentsPosted} · Approved notes: {stats.approvedNotes} · Total stars given to your notes: {stats.totalRatingStars}
                            </Typography>
                        </Box>
                    )}

                    {activeTab === 1 && (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                                    My notes ({notes.length})
                                </Typography>
                                <Button type="button" variant="primary" size="sm" onClick={() => navigate('/student/upload')}>
                                    Upload note
                                </Button>
                            </Stack>
                            {notesLoading && <Spinner message="Loading your notes…" />}
                            {!notesLoading && notesError && <Alert severity="error">{notesError}</Alert>}
                            {!notesLoading && !notesError && notes.length === 0 && (
                                <Alert severity="info" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#e0e7ff' }}>
                                    No notes yet.{' '}
                                    <Link to="/student/upload" style={{ color: '#c4b5fd' }}>
                                        Upload your first note
                                    </Link>
                                </Alert>
                            )}
                            <Stack spacing={1.5}>
                                {!notesLoading &&
                                    !notesError &&
                                    notes.map((note) => (
                                        <Paper
                                            key={note._id}
                                            onClick={() => openNote(note)}
                                            sx={{
                                                p: 2,
                                                cursor: note?._id ? 'pointer' : 'default',
                                                bgcolor: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(147,51,234,0.15)',
                                                '&:hover': { borderColor: 'rgba(147,51,234,0.4)' },
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                                <Box>
                                                    <Typography sx={{ color: '#fff', fontWeight: 700 }}>{note.title}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                                                        {[note.subject, note.semester && `Sem ${note.semester}`, note.year && `Yr ${note.year}`].filter(Boolean).join(' · ')}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    size="small"
                                                    label={noteStatusLabel(note.status)}
                                                    color={
                                                        note.status === 'approved'
                                                            ? 'success'
                                                            : note.status === 'rejected'
                                                              ? 'error'
                                                              : 'warning'
                                                    }
                                                    variant="outlined"
                                                />
                                            </Stack>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/student/notes/${note._id}/edit`);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    ))}
                            </Stack>
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                                        Shared questions
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.5 }}>
                                        Questions you’ve added to your profile from Q&amp;A ({sharedQuestions.length})
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <MuiButton
                                        variant="contained"
                                        size="small"
                                        onClick={() => navigate('/student/questions')}
                                        sx={{ textTransform: 'none', background: 'linear-gradient(45deg,#9333ea,#ec4899)' }}
                                    >
                                        Go to Questions
                                    </MuiButton>
                                    <MuiButton
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate('/student/notes')}
                                        sx={{ textTransform: 'none', color: '#e5e7eb', borderColor: 'rgba(255,255,255,0.3)' }}
                                    >
                                        Browse notes
                                    </MuiButton>
                                </Stack>
                            </Stack>

                            {sharedLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                            {!sharedLoading && sharedQuestions.length === 0 && (
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                                    Nothing shared yet. Open{' '}
                                    <Box component="span" onClick={() => navigate('/student/questions')} sx={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 600 }}>
                                        Questions
                                    </Box>{' '}
                                    and use Share on a post to show it here.
                                </Typography>
                            )}

                            <Stack spacing={1.5}>
                                {!sharedLoading &&
                                    sharedQuestions.map((q) => {
                                        const author = q.author;
                                        const authorName = author?.name || author?.username || 'Student';
                                        return (
                                            <Paper
                                                key={q._id}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(147,51,234,0.2)',
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Avatar
                                                        src={getMediaUrl(author?.avatarUrl || author?.profilePicture) || undefined}
                                                        sx={{ width: 40, height: 40, bgcolor: '#6d28d9', fontSize: '0.9rem' }}
                                                    >
                                                        {!author?.avatarUrl && !author?.profilePicture && getInitials(authorName)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>{q.title}</Typography>
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 1, lineHeight: 1.5 }}>
                                                            {truncateText(q.description || '', 220)}
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                                            {q.subject && (
                                                                <Chip size="small" label={q.subject} sx={{ bgcolor: 'rgba(147,51,234,0.2)', color: '#e9d5ff' }} />
                                                            )}
                                                            {q.academicYear && (
                                                                <Chip size="small" label={q.academicYear} sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#bfdbfe' }} />
                                                            )}
                                                            {q.semester != null && (
                                                                <Chip size="small" label={`Sem ${q.semester}`} sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#bbf7d0' }} />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                                                            By {authorName}
                                                            {q.createdAt ? ` · ${formatDate(q.createdAt)}` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'flex-end' }}>
                                                    <MuiButton
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={unsharingId === q._id}
                                                        onClick={() => handleUnshareQuestion(q._id)}
                                                        sx={{ textTransform: 'none', color: '#fca5a5', borderColor: 'rgba(248,113,113,0.4)' }}
                                                    >
                                                        {unsharingId === q._id ? 'Removing…' : 'Remove from profile'}
                                                    </MuiButton>
                                                    <MuiButton
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => navigate('/student/questions')}
                                                        sx={{ textTransform: 'none', background: 'linear-gradient(45deg,#9333ea,#7c3aed)' }}
                                                    >
                                                        Open Q&amp;A
                                                    </MuiButton>
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Menu anchorEl={settingsAnchor} open={Boolean(settingsAnchor)} onClose={() => setSettingsAnchor(null)} PaperProps={{ sx: { bgcolor: '#1e1b2e', color: '#fff' } }}>
                <MenuItem
                    onClick={() => {
                        setSettingsAnchor(null);
                        loadUser();
                        loadSummary();
                        loadSharedQuestions();
                    }}
                >
                    Refresh profile
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setSettingsAnchor(null);
                        logout();
                        navigate('/login');
                    }}
                >
                    <Logout fontSize="small" sx={{ mr: 1 }} /> Log out
                </MenuItem>
            </Menu>

            <Dialog open={editOpen} onClose={() => !savingProfile && setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: '#1a1a2e', color: '#fff' } }}>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Full name" fullWidth value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' } }} />
                        <TextField label="Username" fullWidth value={editForm.username} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} helperText="Optional public handle" InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' } }} />
                        <TextField label="Email" fullWidth value={user?.email || ''} disabled InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} sx={{ input: { color: 'rgba(255,255,255,0.5)' } }} />
                        <TextField label="Bio" fullWidth multiline minRows={3} value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' } }} />
                        <TextField label="Semester (1–8)" fullWidth value={editForm.semester} onChange={(e) => setEditForm((p) => ({ ...p, semester: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' } }} />
                        <TextField label="Branch / programme" fullWidth value={editForm.branch} onChange={(e) => setEditForm((p) => ({ ...p, branch: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }} sx={{ input: { color: '#fff' } }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditOpen(false)} disabled={savingProfile} sx={{ color: '#9ca3af' }}>
                        Cancel
                    </MuiButton>
                    <MuiButton variant="contained" onClick={handleSaveProfile} disabled={savingProfile} sx={{ background: 'linear-gradient(45deg,#9333ea,#ec4899)' }}>
                        {savingProfile ? 'Saving…' : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => !deleteLoading && setDeleteOpen(false)} PaperProps={{ sx: { bgcolor: '#1a1a2e', color: '#fff' } }}>
                <DialogTitle>Delete account permanently?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 2 }}>
                        This removes your notes, ratings, and comments tied to this account. This cannot be undone.
                    </Typography>
                    <TextField
                        type="password"
                        fullWidth
                        label="Confirm password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                        sx={{ input: { color: '#fff' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setDeleteOpen(false)} disabled={deleteLoading} sx={{ color: '#9ca3af' }}>
                        Cancel
                    </MuiButton>
                    <MuiButton color="error" variant="contained" onClick={handleDeleteAccount} disabled={deleteLoading}>
                        {deleteLoading ? 'Deleting…' : 'Delete forever'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {!user?.isApproved && (
                <Alert icon={<Shield />} severity="warning" sx={{ mt: 3 }}>
                    Your account is awaiting admin approval. You can still manage your profile and uploads.
                </Alert>
            )}
        </Container>
    );
};

export default Profile;
