import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, X, File } from 'lucide-react';
import { createNoteApi } from '../../api/notesApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SUBJECTS, SEMESTERS, YEARS, PRIORITY_LEVELS } from '../../utils/constants';

const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
];
const MAX_SIZE_MB = 10;

const validate = (values, file) => {
    const errors = {};
    if (!values.title || values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    if (!values.subject) errors.subject = 'Please select a subject';
    if (!values.semester) errors.semester = 'Please select a semester';
    if (!values.year) errors.year = 'Please select a year';
    if (!values.priorityLevel) errors.priorityLevel = 'Please select a priority level';
    if (file) {
        if (!ALLOWED_TYPES.includes(file.type)) errors.file = 'Only PDF, DOCX, PNG, JPEG files are allowed';
        else if (file.size > MAX_SIZE_MB * 1024 * 1024) errors.file = `File must be under ${MAX_SIZE_MB} MB`;
    }
    return errors;
};

const UploadNote = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    const [values, setValues] = useState({ title: '', subject: '', semester: '', year: '', description: '', priorityLevel: '' });
    const [touched, setTouched] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState(null);

    const errors = validate(values, selectedFile);
    const hasSubmitError = Object.keys(errors).length > 0;

    const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

    const handleFile = (file) => {
        if (!file) return;
        setSelectedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all fields touched to show errors
        setTouched({ title: true, subject: true, semester: true, year: true, priorityLevel: true });
        if (hasSubmitError) return;

        setLoading(true);
        setServerError(null);
        try {
            // Grab latest rich-text HTML before submitting.
            const el = editorRef.current;
            const descriptionHtml = el ? el.innerHTML : values.description;

            const formData = new FormData();
            formData.append('title', values.title.trim());
            formData.append('subject', values.subject);
            formData.append('semester', values.semester);
            formData.append('year', values.year);
            formData.append('description', descriptionHtml);
            formData.append('priorityLevel', values.priorityLevel);
            if (selectedFile) formData.append('file', selectedFile);

            await createNoteApi(formData);
            setSuccess(true);
            setTimeout(() => navigate('/student/notes'), 2500);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to upload note. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const syncDescriptionFromEditor = () => {
        const el = editorRef.current;
        if (!el) return;
        setValues((prev) => ({ ...prev, description: el.innerHTML }));
    };

    const applyEditorCommand = (command, value) => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        document.execCommand(command, false, value);
        syncDescriptionFromEditor();
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

    return (
        <div
            className="page-container"
            style={{
                maxWidth: 720,
                // Center the upload form vertically within the available viewport area
                // (accounts for main navbar padding + this page's own padding).
                minHeight: 'calc(100vh - var(--navbar-height) - 4rem)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div className="page-header">
                <h1>Upload Note</h1>
                <p>Share your academic notes with the KnowVerse community</p>
            </div>

            {success && (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                    <CheckCircle size={18} />
                    Note submitted successfully! Redirecting to notes list...
                </div>
            )}

            {serverError && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} />
                    {serverError}
                </div>
            )}

            <div style={{ marginTop: 'auto', marginBottom: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="card" style={{ width: '100%' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Title */}
                    <Input
                        label="Note Title *"
                        name="title"
                        placeholder="e.g., Data Structures - Lecture 5 Notes"
                        icon={FileText}
                        value={values.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.title && errors.title}
                    />

                    {/* Subject + Semester */}
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <select name="subject" style={selectStyle('subject')} value={values.subject} onChange={handleChange} onBlur={handleBlur}>
                                <option value="">Select subject...</option>
                                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {touched.subject && errors.subject && <span className="form-error">{errors.subject}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Semester *</label>
                            <select name="semester" style={selectStyle('semester')} value={values.semester} onChange={handleChange} onBlur={handleBlur}>
                                <option value="">Select semester...</option>
                                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                            {touched.semester && errors.semester && <span className="form-error">{errors.semester}</span>}
                        </div>
                    </div>

                    {/* Year */}
                    <div className="form-group" style={{ maxWidth: 220 }}>
                        <label className="form-label">Year *</label>
                        <select name="year" style={selectStyle('year')} value={values.year} onChange={handleChange} onBlur={handleBlur}>
                            <option value="">Select year...</option>
                            {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                        {touched.year && errors.year && <span className="form-error">{errors.year}</span>}
                    </div>

                    {/* Priority Level */}
                    <div className="form-group" style={{ maxWidth: 220 }}>
                        <label className="form-label">Priority Level *</label>
                        <select name="priorityLevel" style={selectStyle('priorityLevel')} value={values.priorityLevel} onChange={handleChange} onBlur={handleBlur}>
                            <option value="">Select priority...</option>
                            {PRIORITY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {touched.priorityLevel && errors.priorityLevel && <span className="form-error">{errors.priorityLevel}</span>}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        {/* Rich text toolbar */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <select
                                disabled={loading}
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

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={loading}
                                onClick={() => applyEditorCommand('bold')}
                            >
                                Bold
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={loading}
                                onClick={() => applyEditorCommand('italic')}
                            >
                                Italic
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={loading}
                                onClick={() => applyEditorCommand('underline')}
                            >
                                Underline
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={loading}
                                onClick={() => applyEditorCommand('hiliteColor', 'yellow')}
                            >
                                Highlight
                            </Button>
                        </div>

                        {/* Rich text editor */}
                        <div
                            ref={editorRef}
                            contentEditable
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

                    {/* File drop zone */}
                    <div className="form-group">
                        <label className="form-label">Attach File (Optional)</label>

                        {/* Hidden real file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${dragOver ? 'var(--primary)' : errors.file ? 'var(--danger)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius)',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragOver ? 'rgba(108,99,255,0.06)' : 'transparent',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {selectedFile ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                    <File size={28} color="var(--primary)" />
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                                            {selectedFile.name}
                                        </p>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 'auto' }}
                                        title="Remove file"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.45, display: 'block' }} />
                                    <p style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                                        Drag &amp; drop a file here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>click to browse</span>
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, DOCX, PNG, JPEG — Max 10 MB</p>
                                </>
                            )}
                        </div>
                        {errors.file && <span className="form-error" style={{ marginTop: '0.4rem', display: 'block' }}>{errors.file}</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.25rem' }}>
                        <Button type="submit" variant="primary" loading={loading}>
                            <Upload size={16} /> Submit Note
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => navigate('/student/notes')}>
                            Cancel
                        </Button>
                    </div>
                    </form>
                </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                <AlertCircle size={16} />
                <span>Notes are reviewed by admins before becoming publicly visible. This usually takes 1–2 business days.</span>
            </div>
        </div>
    );
};

export default UploadNote;
