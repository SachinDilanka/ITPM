import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2 } from 'lucide-react';
import { sendChatMessageApi } from '../../api/chatbotApi';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: "Hi! I'm KnowVerse AI 🤖\nAsk me anything about your studies — I'm here to help!",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const getHistory = () =>
        messages
            .filter((m) => m.role === 'user' || m.role === 'model')
            .slice(1) // skip greeting
            .map((m) => ({ role: m.role, text: m.text }));

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = getHistory();
            const res = await sendChatMessageApi(trimmed, history);
            const reply = res.data?.data?.reply || 'Sorry, I could not generate a response.';
            setMessages((prev) => [...prev, { role: 'model', text: reply }]);
        } catch (err) {
            const errMsg =
                err.response?.data?.message || 'Something went wrong. Please try again.';
            setMessages((prev) => [...prev, { role: 'model', text: `⚠️ ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([
            {
                role: 'model',
                text: "Chat cleared! Ask me anything about your studies 📚",
            },
        ]);
    };

    // Simple markdown-like formatting for AI responses
    const formatMessage = (text) => {
        return text
            .split('\n')
            .map((line, i) => {
                // Bold
                let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Bullet points
                if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
                    formatted = `<span class="chatbot-bullet">•</span> ${formatted.slice(2)}`;
                }
                return (
                    <span
                        key={i}
                        className="chatbot-line"
                        dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
                    />
                );
            });
    };

    return (
        <>
            {/* Floating AI Button */}
            <button
                className={`chatbot-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
                title="AI Assistant"
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
                {!isOpen && <span className="chatbot-fab-pulse" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={18} />
                            </div>
                            <div>
                                <div className="chatbot-header-title">KnowVerse AI</div>
                                <div className="chatbot-header-status">
                                    <span className="chatbot-status-dot" />
                                    Online
                                </div>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                className="chatbot-header-btn"
                                onClick={handleClear}
                                title="Clear chat"
                            >
                                <Trash2 size={15} />
                            </button>
                            <button
                                className="chatbot-header-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}
                            >
                                <div className="chatbot-msg-icon">
                                    {msg.role === 'user' ? (
                                        <User size={14} />
                                    ) : (
                                        <Bot size={14} />
                                    )}
                                </div>
                                <div className="chatbot-msg-bubble">
                                    {msg.role === 'user' ? msg.text : formatMessage(msg.text)}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chatbot-msg chatbot-msg-bot">
                                <div className="chatbot-msg-icon">
                                    <Bot size={14} />
                                </div>
                                <div className="chatbot-msg-bubble chatbot-typing">
                                    <span className="chatbot-dot" />
                                    <span className="chatbot-dot" />
                                    <span className="chatbot-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <textarea
                            ref={inputRef}
                            className="chatbot-input"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            maxLength={2000}
                            disabled={loading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            title="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
