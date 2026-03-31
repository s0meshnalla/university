import { useState, useRef, useEffect } from 'react'
import { chatApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './AIChatWidget.css'

const QUICK_PROMPTS = [
    { label: '📝 SOP Tips', text: 'Give me tips for writing a strong Statement of Purpose' },
    { label: '📋 Documents', text: 'What documents do I need for graduate school applications?' },
    { label: '🎯 Strategy', text: 'Help me plan my application strategy and timeline' },
    { label: '💰 Scholarships', text: 'How can I find scholarships for international students?' },
    { label: '🛂 Visa Guide', text: 'What are the student visa requirements?' },
]

const cleanInlineMarkdown = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
}

const renderAssistantContent = (content, keyPrefix) => {
    const lines = content.split('\n')
    const blocks = []
    let listItems = []

    const flushList = () => {
        if (listItems.length > 0) {
            blocks.push(
                <ul key={`${keyPrefix}-list-${blocks.length}`}>
                    {listItems.map((item, index) => (
                        <li key={`${keyPrefix}-item-${index}`}>{cleanInlineMarkdown(item)}</li>
                    ))}
                </ul>
            )
            listItems = []
        }
    }

    lines.forEach((line) => {
        const trimmed = line.trim()
        const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/)

        if (bulletMatch) {
            listItems.push(bulletMatch[1])
            return
        }

        flushList()

        if (!trimmed) {
            blocks.push(<br key={`${keyPrefix}-br-${blocks.length}`} />)
            return
        }

        const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/)
        const normalized = headingMatch ? headingMatch[1] : trimmed
        blocks.push(<p key={`${keyPrefix}-p-${blocks.length}`}>{cleanInlineMarkdown(normalized)}</p>)
    })

    flushList()
    return blocks
}

function AIChatWidget() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return

        const userMessage = { role: 'user', content: text }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await chatApi.sendMessage(text, sessionId)
            setSessionId(response.session_id)
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    const clearChat = () => {
        setMessages([])
        setSessionId(null)
        if (sessionId) chatApi.clearHistory(sessionId).catch(() => { })
    }

    if (!user) return null

    return (
        <>
            {/* Chat Bubble */}
            <button
                className={`chat-bubble ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Assistant"
            >
                {isOpen ? '✕' : '🤖'}
                {!isOpen && <span className="chat-bubble-pulse" />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <span className="chat-avatar">🤖</span>
                            <div>
                                <h4>UniGuide AI</h4>
                                <span className="chat-status">Online</span>
                            </div>
                        </div>
                        <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">
                            🗑️
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-welcome">
                                <span className="chat-welcome-icon">🎓</span>
                                <h4>Hi there! I'm UniGuide AI</h4>
                                <p>Your personal admissions counselor. Ask me anything about universities, SOPs, visas, or applications!</p>
                                <div className="quick-prompts">
                                    {QUICK_PROMPTS.map((prompt, i) => (
                                        <button
                                            key={i}
                                            className="quick-prompt-btn"
                                            onClick={() => sendMessage(prompt.text)}
                                        >
                                            {prompt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                {msg.role === 'assistant' && <span className="msg-avatar">🤖</span>}
                                <div className="msg-bubble">
                                    {msg.role === 'assistant'
                                        ? renderAssistantContent(msg.content, `assistant-${i}`)
                                        : msg.content.split('\n').map((line, j) => (
                                            <p key={j}>{line || <br />}</p>
                                        ))}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chat-message assistant">
                                <span className="msg-avatar">🤖</span>
                                <div className="msg-bubble typing-indicator">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIChatWidget
