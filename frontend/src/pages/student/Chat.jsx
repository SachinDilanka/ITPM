import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AttachFile,
    Close,
    Download,
    Image as ImageIcon,
    InsertDriveFile,
    Mic,
    Search,
    Send,
    Stop,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import {
    getChatConversationsApi,
    getChatStudentsApi,
    getConversationApi,
    sendConversationMessageApi,
} from '../../api/chatApi';
import { formatDate, getInitials, getMediaUrl, getUserMongoId } from '../../utils/helpers';

const panelSx = {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(147, 51, 234, 0.24)',
    color: 'rgba(255,255,255,0.92)',
};

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;
const VOICE_MAX_BYTES = 10 * 1024 * 1024;
const VOICE_MAX_SECONDS = 5 * 60;

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';
const DOCUMENT_ACCEPT =
    '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv';

const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i += 1;
    }
    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatSeconds = (seconds) => {
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
};

const pickRecorderMime = () => {
    if (typeof window === 'undefined' || !window.MediaRecorder?.isTypeSupported) return '';
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
    ];
    for (const mime of candidates) {
        try {
            if (window.MediaRecorder.isTypeSupported(mime)) return mime;
        } catch {
            /* ignore */
        }
    }
    return '';
};

const extensionForMime = (mime) => {
    if (!mime) return 'webm';
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('ogg')) return 'ogg';
    if (mime.includes('wav')) return 'wav';
    return 'webm';
};

export default function Chat() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedUserId = searchParams.get('user') || '';
    const [conversations, setConversations] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentsQuery, setStudentsQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [threadLoading, setThreadLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const [pendingFile, setPendingFile] = useState(null); // { file, kind, previewUrl }
    const [pendingVoice, setPendingVoice] = useState(null); // { blob, url, durationSec, mime }
    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);

    const imageInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recorderStreamRef = useRef(null);
    const recorderChunksRef = useRef([]);
    const recordTimerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const loadSidebar = useCallback(async (studentQuery = '') => {
        const [conversationsRes, studentsRes] = await Promise.all([
            getChatConversationsApi(),
            getChatStudentsApi(studentQuery ? { q: studentQuery } : {}),
        ]);

        setConversations(
            Array.isArray(conversationsRes.data?.conversations)
                ? conversationsRes.data.conversations
                : []
        );
        setStudents(
            Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []
        );
    }, []);

    const loadThread = useCallback(async (otherUserId) => {
        if (!otherUserId) {
            setSelectedUser(null);
            setMessages([]);
            return;
        }

        setThreadLoading(true);
        try {
            const res = await getConversationApi(otherUserId);
            setSelectedUser(res.data?.otherUser || null);
            setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load chat.');
        } finally {
            setThreadLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        async function init() {
            setLoading(true);
            setError('');
            try {
                await loadSidebar();
                if (selectedUserId) {
                    await loadThread(selectedUserId);
                }
            } catch (err) {
                if (!active) return;
                setError(err.response?.data?.message || 'Could not load chat.');
            } finally {
                if (active) setLoading(false);
            }
        }

        init();
        return () => {
            active = false;
        };
    }, [loadSidebar, loadThread, selectedUserId]);

    useEffect(() => {
        if (!selectedUserId) return undefined;

        const timer = window.setInterval(() => {
            loadSidebar(studentsQuery).catch(() => {});
            loadThread(selectedUserId).catch(() => {});
        }, 5000);

        return () => window.clearInterval(timer);
    }, [loadSidebar, loadThread, selectedUserId, studentsQuery]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadSidebar(studentsQuery).catch(() => {});
        }, 250);
        return () => window.clearTimeout(timer);
    }, [studentsQuery, loadSidebar]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, selectedUserId]);

    useEffect(
        () => () => {
            if (recordTimerRef.current) {
                clearInterval(recordTimerRef.current);
                recordTimerRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try {
                    mediaRecorderRef.current.stop();
                } catch {
                    /* ignore */
                }
            }
            if (recorderStreamRef.current) {
                recorderStreamRef.current.getTracks().forEach((t) => t.stop());
                recorderStreamRef.current = null;
            }
        },
        []
    );

    useEffect(
        () => () => {
            if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
        },
        [pendingFile]
    );

    useEffect(
        () => () => {
            if (pendingVoice?.url) URL.revokeObjectURL(pendingVoice.url);
        },
        [pendingVoice]
    );

    const conversationMap = useMemo(
        () =>
            new Map(
                conversations.map((conversation) => [
                    String(getUserMongoId(conversation.otherUser)),
                    conversation,
                ])
            ),
        [conversations]
    );

    const sidebarStudents = useMemo(() => {
        const seen = new Set();
        const ordered = [];

        conversations.forEach((conversation) => {
            const person = conversation.otherUser;
            const personId = String(getUserMongoId(person) || '');
            if (!personId || seen.has(personId)) return;
            seen.add(personId);
            ordered.push(person);
        });

        students.forEach((student) => {
            const studentId = String(getUserMongoId(student) || '');
            if (!studentId || seen.has(studentId)) return;
            seen.add(studentId);
            ordered.push(student);
        });

        return ordered;
    }, [conversations, students]);

    const handleSelectUser = async (person) => {
        const personId = getUserMongoId(person);
        if (!personId) return;
        setSearchParams({ user: personId });
        setSelectedUser(person);
        clearPendingAttachments();
        await loadThread(personId);
    };

    const clearPendingAttachments = () => {
        setPendingFile((prev) => {
            if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
            return null;
        });
        setPendingVoice((prev) => {
            if (prev?.url) URL.revokeObjectURL(prev.url);
            return null;
        });
    };

    const handlePickImage = () => imageInputRef.current?.click();
    const handlePickDocument = () => documentInputRef.current?.click();

    const onImagePicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        if (file.size > IMAGE_MAX_BYTES) {
            setError(`Images must be ${Math.round(IMAGE_MAX_BYTES / 1024 / 1024)} MB or smaller.`);
            return;
        }
        if (pendingVoice) clearPendingAttachments();
        setPendingFile({
            file,
            kind: 'image',
            previewUrl: URL.createObjectURL(file),
        });
    };

    const onDocumentPicked = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > DOCUMENT_MAX_BYTES) {
            setError(`Documents must be ${Math.round(DOCUMENT_MAX_BYTES / 1024 / 1024)} MB or smaller.`);
            return;
        }
        if (pendingVoice) clearPendingAttachments();
        setPendingFile({ file, kind: 'document', previewUrl: '' });
    };

    const stopRecording = () => {
        if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
        }
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            try {
                recorder.stop();
            } catch {
                /* ignore */
            }
        }
    };

    const startRecording = async () => {
        if (isRecording) {
            stopRecording();
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
            setError('Voice recording is not supported in this browser.');
            return;
        }
        clearPendingAttachments();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mime = pickRecorderMime();
            const recorder = new window.MediaRecorder(
                stream,
                mime ? { mimeType: mime } : undefined
            );
            recorderStreamRef.current = stream;
            mediaRecorderRef.current = recorder;
            recorderChunksRef.current = [];

            const startedAt = Date.now();
            setRecordSeconds(0);
            setIsRecording(true);

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recorderChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const finalMime = recorder.mimeType || mime || 'audio/webm';
                const blob = new Blob(recorderChunksRef.current, { type: finalMime });
                recorderChunksRef.current = [];
                const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
                if (recorderStreamRef.current) {
                    recorderStreamRef.current.getTracks().forEach((t) => t.stop());
                    recorderStreamRef.current = null;
                }
                mediaRecorderRef.current = null;
                setIsRecording(false);
                setRecordSeconds(0);
                if (blob.size === 0) return;
                if (blob.size > VOICE_MAX_BYTES) {
                    setError('Voice note is too long. Please keep it under 10 MB.');
                    return;
                }
                const url = URL.createObjectURL(blob);
                setPendingVoice({ blob, url, durationSec, mime: finalMime });
            };

            recorder.start(250);

            recordTimerRef.current = window.setInterval(() => {
                const secs = Math.floor((Date.now() - startedAt) / 1000);
                setRecordSeconds(secs);
                if (secs >= VOICE_MAX_SECONDS) stopRecording();
            }, 250);
        } catch (err) {
            setError(err?.message || 'Could not start recording. Check microphone permissions.');
            setIsRecording(false);
            if (recorderStreamRef.current) {
                recorderStreamRef.current.getTracks().forEach((t) => t.stop());
                recorderStreamRef.current = null;
            }
        }
    };

    const hasPendingAttachment = Boolean(pendingFile || pendingVoice);
    const canSend = !sending && !isRecording && (draft.trim().length > 0 || hasPendingAttachment);

    const handleSend = async () => {
        const text = draft.trim();
        if (!selectedUserId || (!text && !hasPendingAttachment)) return;
        if (isRecording) return;

        setSending(true);
        try {
            if (hasPendingAttachment) {
                const formData = new FormData();
                if (text) formData.append('text', text);
                if (pendingFile) {
                    formData.append('file', pendingFile.file, pendingFile.file.name);
                } else if (pendingVoice) {
                    const ext = extensionForMime(pendingVoice.mime);
                    const voiceFile = new File(
                        [pendingVoice.blob],
                        `voice-${Date.now()}.${ext}`,
                        { type: pendingVoice.blob.type || pendingVoice.mime || 'audio/webm' }
                    );
                    formData.append('file', voiceFile, voiceFile.name);
                    formData.append('durationSec', String(pendingVoice.durationSec || 0));
                }
                await sendConversationMessageApi(selectedUserId, formData);
            } else {
                await sendConversationMessageApi(selectedUserId, { text });
            }
            setDraft('');
            clearPendingAttachments();
            await Promise.all([loadSidebar(studentsQuery), loadThread(selectedUserId)]);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not send message.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Stack alignItems="center" sx={{ color: '#fff' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading chats...</Typography>
                </Stack>
            </Container>
        );
    }

    const renderAttachment = (attachment, mine) => {
        if (!attachment || !attachment.url) return null;
        const href = getMediaUrl(attachment.url);
        if (attachment.kind === 'image') {
            return (
                <Box sx={{ mt: 1 }}>
                    <a href={href} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                        <Box
                            component="img"
                            src={href}
                            alt={attachment.originalName || 'Shared image'}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: 260,
                                borderRadius: 2,
                                display: 'block',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        />
                    </a>
                </Box>
            );
        }
        if (attachment.kind === 'document') {
            return (
                <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{
                        mt: 1,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: mine ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(147,51,234,0.18)',
                    }}
                >
                    <InsertDriveFile sx={{ color: 'rgba(255,255,255,0.85)' }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                color: '#fff',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={attachment.originalName || 'Document'}
                        >
                            {attachment.originalName || 'Document'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                            {formatBytes(attachment.size)}
                        </Typography>
                    </Box>
                    <Button
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        startIcon={<Download />}
                        sx={{ color: '#fff' }}
                    >
                        Open
                    </Button>
                </Stack>
            );
        }
        if (attachment.kind === 'voice') {
            return (
                <Box sx={{ mt: 1 }}>
                    <Box
                        component="audio"
                        controls
                        src={href}
                        sx={{ width: '100%', maxWidth: 320, display: 'block' }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                        Voice note{attachment.durationSec ? ` · ${formatSeconds(attachment.durationSec)}` : ''}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const renderPendingPreview = () => {
        if (pendingFile?.kind === 'image') {
            return (
                <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(147,51,234,0.2)',
                    }}
                >
                    <Box
                        component="img"
                        src={pendingFile.previewUrl}
                        alt="Preview"
                        sx={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pendingFile.file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                            Image · {formatBytes(pendingFile.file.size)}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={clearPendingAttachments} sx={{ color: '#fff' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            );
        }
        if (pendingFile?.kind === 'document') {
            return (
                <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(147,51,234,0.2)',
                    }}
                >
                    <InsertDriveFile sx={{ color: 'rgba(255,255,255,0.85)' }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pendingFile.file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                            Document · {formatBytes(pendingFile.file.size)}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={clearPendingAttachments} sx={{ color: '#fff' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            );
        }
        if (pendingVoice) {
            return (
                <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(147,51,234,0.2)',
                    }}
                >
                    <Mic sx={{ color: 'rgba(255,255,255,0.85)' }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                            Voice note · {formatSeconds(pendingVoice.durationSec)}
                        </Typography>
                        <Box
                            component="audio"
                            controls
                            src={pendingVoice.url}
                            sx={{ width: '100%', maxWidth: 260, mt: 0.5, display: 'block' }}
                        />
                    </Box>
                    <IconButton size="small" onClick={clearPendingAttachments} sx={{ color: '#fff' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                    Student Chat
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>
                    Private messages between approved student accounts.
                </Typography>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            ) : null}

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
                <Paper elevation={0} sx={{ ...panelSx, width: { xs: '100%', lg: 360 }, overflow: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search students..."
                            value={studentsQuery}
                            onChange={(e) => setStudentsQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} />,
                            }}
                            sx={{
                                '& .MuiInputBase-input': { color: '#fff' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147,51,234,0.3)' },
                            }}
                        />
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(147,51,234,0.2)' }} />
                    <List sx={{ maxHeight: 640, overflowY: 'auto', p: 1 }}>
                        {sidebarStudents.length ? sidebarStudents.map((person) => {
                            const personId = String(getUserMongoId(person) || '');
                            const avatar = getMediaUrl(person?.avatarUrl || person?.profilePicture || '');
                            const convo = conversationMap.get(personId);
                            return (
                                <ListItemButton
                                    key={personId}
                                    selected={personId === selectedUserId}
                                    onClick={() => handleSelectUser(person)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.75,
                                        alignItems: 'flex-start',
                                        '&.Mui-selected': {
                                            backgroundColor: 'rgba(147,51,234,0.18)',
                                        },
                                    }}
                                >
                                    <Avatar src={avatar || undefined} sx={{ mr: 1.5, bgcolor: '#6d28d9' }}>
                                        {!avatar && getInitials(person?.name || person?.username || 'S')}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                                <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                                                    {person?.name || person?.username || 'Student'}
                                                </Typography>
                                                {convo?.unreadCount ? (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#fff',
                                                            bgcolor: '#9333ea',
                                                            px: 0.75,
                                                            borderRadius: 10,
                                                        }}
                                                    >
                                                        {convo.unreadCount}
                                                    </Typography>
                                                ) : null}
                                            </Stack>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {person?.username ? `@${person.username}` : person?.branch || 'Student'}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.48)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {convo?.lastMessageText || 'Start a conversation'}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItemButton>
                            );
                        }) : (
                            <Box sx={{ px: 2, py: 3 }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)' }}>
                                    No students found.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>

                <Paper elevation={0} sx={{ ...panelSx, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 640 }}>
                    {selectedUser ? (
                        <>
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(147,51,234,0.2)' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar
                                        src={getMediaUrl(selectedUser?.avatarUrl || selectedUser?.profilePicture || '') || undefined}
                                        sx={{ bgcolor: '#6d28d9' }}
                                    >
                                        {getInitials(selectedUser?.name || selectedUser?.username || 'S')}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                                            {selectedUser?.name || selectedUser?.username || 'Student'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                                            {selectedUser?.username ? `@${selectedUser.username}` : selectedUser?.branch || 'Student'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                                {threadLoading ? (
                                    <Stack alignItems="center" sx={{ py: 4, color: '#fff' }}>
                                        <CircularProgress size={28} />
                                    </Stack>
                                ) : messages.length ? (
                                    <Stack spacing={1.5}>
                                        {messages.map((message) => {
                                            const mine = String(message.sender) === String(getUserMongoId(user));
                                            return (
                                                <Box
                                                    key={message._id}
                                                    sx={{
                                                        alignSelf: mine ? 'flex-end' : 'flex-start',
                                                        maxWidth: '78%',
                                                    }}
                                                >
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: mine ? 'rgba(147,51,234,0.24)' : 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(147,51,234,0.16)',
                                                        }}
                                                    >
                                                        {message.text ? (
                                                            <Typography sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
                                                                {message.text}
                                                            </Typography>
                                                        ) : null}
                                                        {renderAttachment(message.attachment, mine)}
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', mt: 0.75 }}
                                                        >
                                                            {formatDate(message.createdAt)}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </Stack>
                                ) : (
                                    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.55)' }}>
                                            No messages yet. Say hello.
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(147,51,234,0.2)' }} />
                            <Box sx={{ p: 2 }}>
                                {renderPendingPreview()}

                                {isRecording ? (
                                    <Stack
                                        direction="row"
                                        spacing={1.25}
                                        alignItems="center"
                                        sx={{
                                            p: 1.25,
                                            mb: 1,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(239,68,68,0.16)',
                                            border: '1px solid rgba(239,68,68,0.45)',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: '#ef4444',
                                                animation: 'chatrec 1s infinite',
                                                '@keyframes chatrec': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0.3 },
                                                },
                                            }}
                                        />
                                        <Typography sx={{ color: '#fff', fontWeight: 600, flex: 1 }}>
                                            Recording… {formatSeconds(recordSeconds)}
                                        </Typography>
                                        <Button
                                            onClick={stopRecording}
                                            startIcon={<Stop />}
                                            variant="contained"
                                            color="error"
                                            size="small"
                                        >
                                            Stop
                                        </Button>
                                    </Stack>
                                ) : null}

                                <Stack direction="row" spacing={1} alignItems="flex-end">
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Send image (max 10 MB)">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={handlePickImage}
                                                    disabled={sending || isRecording}
                                                    sx={{ color: 'rgba(255,255,255,0.85)' }}
                                                >
                                                    <ImageIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Send document (max 20 MB)">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={handlePickDocument}
                                                    disabled={sending || isRecording}
                                                    sx={{ color: 'rgba(255,255,255,0.85)' }}
                                                >
                                                    <AttachFile />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={isRecording ? 'Stop recording' : 'Record voice note'}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={startRecording}
                                                    disabled={sending}
                                                    sx={{
                                                        color: isRecording ? '#ef4444' : 'rgba(255,255,255,0.85)',
                                                    }}
                                                >
                                                    {isRecording ? <Stop /> : <Mic />}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>

                                    <TextField
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        placeholder="Type a message..."
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (canSend) handleSend();
                                            }
                                        }}
                                        disabled={sending}
                                        sx={{
                                            '& .MuiInputBase-input': { color: '#fff' },
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147,51,234,0.3)' },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={!canSend}
                                        onClick={handleSend}
                                        sx={{
                                            minWidth: 120,
                                            background: 'linear-gradient(45deg,#9333ea,#ec4899)',
                                        }}
                                        startIcon={<Send />}
                                    >
                                        {sending ? 'Sending...' : 'Send'}
                                    </Button>
                                </Stack>

                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept={IMAGE_ACCEPT}
                                    onChange={onImagePicked}
                                    style={{ display: 'none' }}
                                />
                                <input
                                    ref={documentInputRef}
                                    type="file"
                                    accept={DOCUMENT_ACCEPT}
                                    onChange={onDocumentPicked}
                                    style={{ display: 'none' }}
                                />
                            </Box>
                        </>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, px: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                                Select a student
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', maxWidth: 420 }}>
                                Choose a student from the left to start a private conversation.
                            </Typography>
                        </Stack>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
