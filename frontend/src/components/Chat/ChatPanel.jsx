import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import axios from 'axios'

// ─── Avatar ──────────────────────────────────────────────────────────────────
function AuraAvatar({ state = 'idle' }) {
  const colorMap = {
    idle: '#00cfff', listening: '#00ff88',
    thinking: '#bf5fff', talking: '#00cfff', executing: '#ffee00',
  }
  const c = colorMap[state] || '#00cfff'
  return (
    <div
      className="chat-aura-avatar"
      style={{ borderColor: `${c}55`, boxShadow: `0 0 12px ${c}40`, color: c }}
    >
      A
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, robotState }) {
  const isUser = msg.role === 'user'
  const isError = msg.type === 'error'

  if (isUser) {
    return (
      <div className="chat-msg chat-msg--user">
        <div className="chat-bubble chat-bubble--user">
          <p className="chat-text">{msg.content}</p>
          <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="chat-user-avatar">U</div>
      </div>
    )
  }

  return (
    <div className="chat-msg chat-msg--aura">
      <AuraAvatar state={robotState} />
      <div className={`chat-bubble chat-bubble--aura ${isError ? 'chat-bubble--error' : ''}`}>
        <div className="chat-bubble-glow" />
        <p className="chat-text">{msg.content}</p>
        <div className="chat-bottom-row">
          <span className="chat-time">AURA · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {msg.commands?.length > 0 && (
            <span className="chat-cmd-badge">⚡ {msg.commands.length} cmd{msg.commands.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg--aura">
      <AuraAvatar state="thinking" />
      <div className="chat-bubble chat-bubble--aura chat-bubble--typing">
        <div className="chat-bubble-glow" />
        <span className="typing-label">AURA is thinking</span>
        <span className="typing-wave">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useStore((s) => s.messages)
  const addMessage = useStore((s) => s.addMessage)
  const setRobotState = useStore((s) => s.setRobotState)
  const setStatusText = useStore((s) => s.setStatusText)
  const setIsListening = useStore((s) => s.setIsListening)
  const addLog = useStore((s) => s.addLog)
  const addCommand = useStore((s) => s.addCommand)
  const robotState = useStore((s) => s.robotState)
  const isListening = useStore((s) => s.isListening)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, robotState])

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim()) return

    const userInput = input.trim()
    addMessage({ role: 'user', content: userInput, timestamp: new Date(), type: 'text' })
    setInput('')
    setRobotState('thinking')
    setStatusText('Processing your request…')
    addLog(`User: ${userInput}`)

    try {
      const currentCode = useStore.getState().code
      const response = await axios.post(
        'http://localhost:8000/api/agent/command',
        { prompt: userInput, context: { code: currentCode } },
        { timeout: 10000 },
      )

      setRobotState('executing')
      setStatusText('Executing commands…')

      if (response.data.commands?.length) {
        for (const cmd of response.data.commands) {
          addCommand(cmd)
          addLog(`✓ ${cmd.action} on ${cmd.target}`)
          await new Promise((r) => setTimeout(r, 250))
        }
      }

      const aiReply = response.data.response ||
        `Done! Executed ${response.data.commands?.length || 0} command(s).`

      addMessage({ role: 'assistant', content: aiReply, timestamp: new Date(), type: 'text', commands: response.data.commands || [] })

      setRobotState('talking')
      setStatusText('Responding…')

      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(aiReply)
        utt.rate = 0.92; utt.pitch = 1.1; utt.volume = 0.8
        utt.onend = () => { setRobotState('idle'); setStatusText('Ready') }
        speechSynthesis.speak(utt)
      } else {
        setTimeout(() => { setRobotState('idle'); setStatusText('Ready') }, 1200)
      }
    } catch (error) {
      const isNetErr = error.code === 'ECONNREFUSED' || error.message.includes('Network Error')
      const msg = isNetErr
        ? 'Backend not reachable. Start the backend on port 8000 to use AI commands.'
        : `Error: ${error.message}`
      addLog(`✗ ${msg}`)
      addMessage({ role: 'assistant', content: msg, timestamp: new Date(), type: 'error' })
      setRobotState('idle'); setStatusText('Ready')
    }
  }

  // ── Voice ──────────────────────────────────────────────────────────────────
  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      addLog('✗ Speech recognition not supported')
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = false
    rec.onstart = () => { setIsListening(true); setRobotState('listening'); setStatusText('Listening…'); addLog('🎤 Listening…') }
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript
      setInput(t); setIsListening(false); setRobotState('thinking'); setStatusText('Processing…')
      addLog(`Voice: "${t}"`)
      setTimeout(handleSend, 400)
    }
    rec.onerror = (e) => { addLog(`✗ Voice error: ${e.error}`); setIsListening(false); setRobotState('idle'); setStatusText('Ready') }
    rec.onend = () => { setIsListening(false); if (useStore.getState().robotState === 'listening') { setRobotState('idle'); setStatusText('Ready') } }
    rec.start()
  }

  const isThinking = robotState === 'thinking' || robotState === 'executing'

  return (
    <div className="chat-panel">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <p className="chat-empty-title">Chat with AURA</p>
          <p className="chat-empty-hint">Try: "Change background to dark blue" or "Add a hero section"</p>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={msg.id || `${msg.timestamp}-${i}`} className="animate-fade-in">
            <MessageBubble msg={msg} robotState={robotState} />
          </div>
        ))}
        {isThinking && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Talk to AURA…"
            disabled={isListening}
          />
          <button
            className={`chat-btn-mic ${isListening ? 'chat-btn-mic--active' : ''}`}
            onClick={handleVoice}
            disabled={isListening}
            title="Voice input"
          >
            {isListening ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            )}
          </button>
          <button
            className="chat-btn-send"
            onClick={handleSend}
            disabled={!input.trim() || isListening}
            title="Send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            <span>Send</span>
          </button>
        </div>
        <p className="chat-input-hint">Enter to send · Mic for voice</p>
      </div>
    </div>
  )
}
