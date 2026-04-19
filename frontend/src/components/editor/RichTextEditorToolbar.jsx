import { Bold, Italic, Underline, Highlighter } from 'lucide-react';
import Button from '../ui/Button';

/** Preset text colors (hex) for contentEditable foreColor */
const TEXT_COLOR_PRESETS = [
    '#f8fafc',
    '#94a3b8',
    '#64748b',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
];

const toolbarBtnStyle = {
    minWidth: '2.25rem',
    padding: '0.45rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};

/**
 * @param {object} props
 * @param {boolean} props.disabled
 * @param {(command: string, value?: string) => void} props.applyFormatting document.execCommand wrapper
 */
const RichTextEditorToolbar = ({ disabled, applyFormatting }) => (
    <div
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            marginBottom: '0.75rem',
        }}
    >
        <select
            disabled={disabled}
            defaultValue="Arial"
            onChange={(e) => applyFormatting('fontName', e.target.value)}
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

        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexWrap: 'wrap',
                padding: '0.15rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated, var(--bg-surface))',
            }}
            title="Text color"
        >
            {TEXT_COLOR_PRESETS.map((hex) => (
                <button
                    key={hex}
                    type="button"
                    disabled={disabled}
                    onClick={() => applyFormatting('foreColor', hex)}
                    aria-label={`Text color ${hex}`}
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        background: hex,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        padding: 0,
                    }}
                />
            ))}
            <label
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginLeft: 2,
                    cursor: disabled ? 'default' : 'pointer',
                }}
            >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>Custom</span>
                <input
                    type="color"
                    disabled={disabled}
                    defaultValue="#a78bfa"
                    onChange={(e) => applyFormatting('foreColor', e.target.value)}
                    aria-label="Custom text color"
                    style={{
                        width: 28,
                        height: 26,
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                />
            </label>
        </div>

        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => applyFormatting('bold')}
            aria-label="Bold"
            title="Bold"
            style={toolbarBtnStyle}
        >
            <Bold size={18} strokeWidth={2.25} />
        </Button>
        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => applyFormatting('italic')}
            aria-label="Italic"
            title="Italic"
            style={toolbarBtnStyle}
        >
            <Italic size={18} strokeWidth={2.25} />
        </Button>
        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => applyFormatting('underline')}
            aria-label="Underline"
            title="Underline"
            style={toolbarBtnStyle}
        >
            <Underline size={18} strokeWidth={2.25} />
        </Button>
        <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => applyFormatting('hiliteColor', 'yellow')}
            aria-label="Highlight"
            title="Highlight"
            style={toolbarBtnStyle}
        >
            <Highlighter size={18} strokeWidth={2.25} />
        </Button>
    </div>
);

export default RichTextEditorToolbar;
