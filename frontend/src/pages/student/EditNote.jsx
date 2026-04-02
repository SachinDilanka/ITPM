import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Save, FileText, Upload, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SUBJECTS, SEMESTERS, YEARS, PRIORITY_LEVELS } from '../../utils/constants';
import { getMediaUrl, formatDate } from '../../utils/helpers';
import { getMyNoteByIdApi, updateMyNoteApi } from '../../api/notesApi';

const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
];

const MAX_SIZE_MB = 10;

const EditNote = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    useAuth(); // ensures we remain under student auth context if needed

    const fileInputRef = useRef(null);
    const editorRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [touched, setTouched] = useState({});
    const [values, setValues] = useState({
        title: '',
        subject: '',
        semester: '',
        year: '',
        description: '',
        priorityLevel: '',
    });

    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [success, setSuccess] = useState(false);

    const validate = (v, file) => {
        const errors = {};
        if (!v.title || v.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
        if (!v.subject) errors.subject = 'Please select a subject';
        if (!v.semester) errors.semester = 'Please select a semester';
        if (!v.year) errors.year = 'Please select a year';
        if (!v.priorityLevel) errors.priorityLevel = 'Please select a priority level';
        if (file) {
            if (!ALLOWED_TYPES.includes(file.type)) errors.file = 'Only PDF, DOCX, PNG, JPEG files are allowed';
            else if (file.size > MAX_SIZE_MB * 1024 * 1024) errors.file = `File must be under ${MAX_SIZE_MB} MB`;
        }
        return errors;
    };

    const fetchFn = useCallback(() => getMyNoteByIdApi(id), [id]);
    const { data, loading: notesLoading, error: notesError } = useFetch(fetchFn);

    const note = data?.note || null;
    const errors = validate(values, selectedFile);
    const hasSubmitError = Object.keys(errors).length > 0;

    useEffect(() => {
        if (!note) return;
        setValues({
            title: note.title || '',
            subject: note.subject || '',
            semester: note.semester != null ? String(note.semester) : '',
            year: note.year != null ? String(note.year) : '',
            description: note.description || '',
            priorityLevel: note.priorityLevel || 'Medium',
        });

        // Initialize rich-text editor with either saved HTML or plain text.
        // (ExecCommand will save formatting as HTML tags.)
        const el = editorRef.current;
        if (el) {
            const desc = note.description || '';
            const hasTags = /<\/?[a-z][\s\S]*>/i.test(desc);
            if (hasTags) el.innerHTML = desc;
            else el.textContent = desc;
        }
    }, [note]);

    const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

    const handleFile = (file) => {
        if (!file) return;
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ title: true, subject: true, semester: true, year: true, priorityLevel: true });
        if (hasSubmitError) return;

        if (!note?._id) return;

        if (!['pending', 'approved'].includes(note.status)) {
            setSubmitError('Only pending or approved notes can be edited.');
            return;
        }

        setSubmitLoading(true);
        setSubmitError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('title', values.title.trim());
            formData.append('subject', values.subject);
            formData.append('semester', values.semester);
            formData.append('year', values.year);
            formData.append('description', values.description);
            formData.append('priorityLevel', values.priorityLevel);
            if (selectedFile) formData.append('file', selectedFile);

            await updateMyNoteApi(note._id, formData);
            setSuccess(true);
            setTimeout(() => navigate('/student/profile'), 1200);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to update note. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const selectStyle = (name) => ({
        width: '100%',
        padding: '0.65rem 0.875rem',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${touched[name] && errors[name] ? 'var(--danger)' : 'var(--border)'}`,
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        outline: 'none',
    });

    if (notesLoading) {
        return <div className="page-container" style={{ maxWidth: 720 }}>Loading...</div>;
    }

    if (notesError) {
        return (
            <div className="page-container" style={{ maxWidth: 720 }}>
                <div className="alert alert-error">{notesError}</div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="page-container" style={{ maxWidth: 720 }}>
                <div className="alert alert-error">Note not found</div>
            </div>
        );
    }

    const canEdit = note.status === 'pending' || note.status === 'approved';

    const syncDescriptionFromEditor = () => {
        const el = editorRef.current;
        if (!el) return;
        setValues((prev) => ({ ...prev, description: el.innerHTML }));
    };

    const applyEditorCommand = (command, value) => {
        if (!canEdit) return;
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        document.execCommand(command, false, value);
        syncDescriptionFromEditor();
    };

    return (
        <div className="page-container" style={{ maxWidth: 720 }}>
            <div className="page-header">
                <h1>Edit Note</h1>
                <p>Update your note. After saving, it will be sent back for admin approval.</p>
            </div>

            {success && (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                    <CheckCircle size={18} />
                    Note updated successfully!
                </div>
            )}

            {submitError && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} />
                    {submitError}
                </div>
            )}

            {!canEdit && (
                <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} />
                    This note is currently <strong>{note.status}</strong> and cannot be edited.
                </div>
            )}

            <div className="card">
                <div
                    style={{
                        marginBottom: '1.25rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <div>Created: {note.createdAt ? formatDate(note.createdAt) : 'N/A'}</div>
                    {note.lastEditedAt && (
                        <div style={{ marginTop: '0.25rem' }}>Last edited: {formatDate(note.lastEditedAt)}</div>
                    )}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Input
                        label="Note Title *"
                        name="title"
                        placeholder="e.g., Data Structures - Lecture 5 Notes"
                        icon={FileText}
                        value={values.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.title && errors.title}
                        disabled={!canEdit}
                    />

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <select
                                name="subject"
                                style={selectStyle('subject')}
                                value={values.subject}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!canEdit}
                            >
                                <option value="">Select subject...</option>
                                {SUBJECTS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            {touched.subject && errors.subject && <span className="form-error">{errors.subject}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Semester *</label>
                            <select
                                name="semester"
                                style={selectStyle('semester')}
                                value={values.semester}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!canEdit}
                            >
                                <option value="">Select semester...</option>
                                {SEMESTERS.map((s) => (
                                    <option key={s} value={s}>
                                        Semester {s}
                                    </option>
                                ))}
                            </select>
                            {touched.semester && errors.semester && <span className="form-error">{errors.semester}</span>}
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Year *</label>
                            <select
                                name="year"
                                style={selectStyle('year')}
                                value={values.year}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!canEdit}
                            >
                                <option value="">Select year...</option>
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        Year {y}
                                    </option>
                                ))}
                            </select>
                            {touched.year && errors.year && <span className="form-error">{errors.year}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority Level *</label>
                            <select
                                name="priorityLevel"
                                style={selectStyle('priorityLevel')}
                                value={values.priorityLevel}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!canEdit}
                            >
                                <option value="">Select priority...</option>
                                {PRIORITY_LEVELS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                            {touched.priorityLevel && errors.priorityLevel && (
                                <span className="form-error">{errors.priorityLevel}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        {/* Rich text toolbar */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <select
                                disabled={!canEdit}
                                defaultValue="Arial"
                                onChange={(e) => applyEditorCommand('fontName', e.target.value)}
                                style={{
                                    padding: '0.55rem 0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                            </select>

                            <Button type="button" variant="ghost" size="sm" disabled={!canEdit} onClick={() => applyEditorCommand('bold')}>
                                Bold
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={!canEdit} onClick={() => applyEditorCommand('italic')}>
                                Italic
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={!canEdit} onClick={() => applyEditorCommand('underline')}>
                                Underline
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={!canEdit} onClick={() => applyEditorCommand('hiliteColor', 'yellow')}>
                                Highlight
                            </Button>
                        </div>

                        {/* Rich text editor */}
                        <div
                            ref={editorRef}
                            contentEditable={canEdit}
                            suppressContentEditableWarning
                            onInput={syncDescriptionFromEditor}
                            style={{
                                minHeight: 120,
                                padding: '0.8rem 0.875rem',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid var(--border)`,
                                background: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Replace file (Optional)</label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            style={{ width: '100%' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                            disabled={!canEdit}
                        />

                        {note.fileUrl && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Upload size={16} />
                                <a
                                    href={getMediaUrl(note.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--primary-light)', fontWeight: 700 }}
                                >
                                    View current attachment
                                </a>
                            </div>
                        )}

                        {selectedFile && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <FileText size={16} />
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                    title="Remove selected file"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
                        <Button type="submit" variant="primary" loading={submitLoading} disabled={!canEdit}>
                            <Save size={16} /> Save Changes
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => navigate('/student/profile')}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNote;

