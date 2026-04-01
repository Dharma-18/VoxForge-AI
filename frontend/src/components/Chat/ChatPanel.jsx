import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import axios from 'axios'

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useStore((state) => state.messages)
  const addMessage = useStore((state) => state.addMessage)
  const setRobotState = useStore((state) => state.setRobotState)
  const setStatusText = useStore((state) => state.setStatusText)
  const setIsListening = useStore((state) => state.setIsListening)
  const setScreenState = useStore((state) => state.setScreenState)
  const addLog = useStore((state) => state.addLog)
  const addCommand = useStore((state) => state.addCommand)
  const robotState = useStore((state) => state.robotState)
  const isListening = useStore((state) => state.isListening)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = { 
      role: 'user', 
      content: input, 
      timestamp: new Date(),
      type: 'text',
    }
    addMessage(userMessage)
    const userInput = input
    setInput('')
    
    // Set thinking / workspace state
    setRobotState('thinking')
    setStatusText('Processing your request...')
    setScreenState?.('coding')
    addLog(`User command: ${userInput}`)
    
    try {
      // Get current code from store
      const currentCode = useStore.getState().code
      
      // Call backend API
      const response = await axios.post(
        'http://localhost:8000/api/agent/command',
        {
          prompt: userInput,
          context: { code: currentCode },
        },
        {
          timeout: 10000,
        },
      )
      
      // Set executing state
      setRobotState('executing')
      setStatusText('Executing commands...')
      
      // Process structured commands
      if (response.data.commands && Array.isArray(response.data.commands)) {
        for (const cmd of response.data.commands) {
          addCommand(cmd)
          addLog(`✓ Executing: ${cmd.action} on ${cmd.target}`)
          // Small delay for visual feedback
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
      }
      
      // Generate AI response
      const aiResponse =
        response.data.response ||
        `I've processed your request and executed ${
          response.data.commands?.length || 0
        } command(s).`
      
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text',
        commands: response.data.commands || [],
      }
      addMessage(aiMessage)
      
      // Set talking state and speak
      setRobotState('talking')
      setStatusText('Responding...')
      
      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        utterance.volume = 0.8
        
        utterance.onend = () => {
          setRobotState('idle')
          setStatusText('Ready')
        }
        
        speechSynthesis.speak(utterance)
      } else {
        setTimeout(() => {
          setRobotState('idle')
          setStatusText('Ready')
        }, 1000)
      }
    } catch (error) {
      const errorMsg =
        error.code === 'ECONNREFUSED' || error.message.includes('Network Error')
          ? 'Backend server not running. Please start the backend server on port 8000.'
          : `Error: ${error.message}`
      
      addLog(`✗ ${errorMsg}`)
      
      const errorResponse = errorMsg.includes('Backend')
        ? "I'm unable to connect to the backend server. Please ensure it's running on port 8000."
        : 'Sorry, I encountered an error processing your request. Please try again.'
      
      addMessage({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date(),
        type: 'error',
      })
      
      setRobotState('idle')
      setStatusText('Ready')
    } finally {
      setScreenState?.('idle')
    }
  }
  
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addLog('Speech recognition not supported in this browser')
      addMessage({
        role: 'assistant',
        content: 'Voice recognition is not supported in your browser. Please use text input instead.',
        timestamp: new Date(),
        type: 'error'
      })
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsListening(true)
      setRobotState('listening')
      setStatusText('Listening...')
      addLog('🎤 Microphone active - listening for voice command')
    }
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      setRobotState('thinking')
      setStatusText('Processing voice command...')
      addLog(`Voice command received: "${transcript}"`)
      
      // Auto-send after voice input
      setTimeout(() => {
        handleSend()
      }, 500)
    }
    
    recognition.onerror = (event) => {
      addLog(`✗ Speech recognition error: ${event.error}`)
      setIsListening(false)
      setRobotState('idle')
      setStatusText('Ready')
      
      if (event.error === 'no-speech') {
        addMessage({
          role: 'assistant',
          content: 'I didn\'t hear anything. Please try speaking again.',
          timestamp: new Date(),
          type: 'error'
        })
      }
    }
    
    recognition.onend = () => {
      setIsListening(false)
      if (useStore.getState().robotState === 'listening') {
        setRobotState('idle')
        setStatusText('Ready')
      }
    }
    
    recognition.start()
  }
  
  return (
    <div className="flex flex-col h-full bg-[#020617]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 text-sm mt-8 space-y-2">
            <div className="text-[#00f5ff]/60 font-medium mb-3">Start chatting with AURA</div>
            <div className="text-xs space-y-1">
              <p className="text-zinc-600">Try voice or text commands like:</p>
              <p className="text-[#00f5ff]/40">• "Change the background color to blue"</p>
              <p className="text-[#00f5ff]/40">• "Update the heading text"</p>
              <p className="text-[#00f5ff]/40">• "Create a dark themed login page"</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#0b1120] border border-[#00f5ff]/40 flex items-center justify-center mr-2 flex-shrink-0 shadow-[0_0_12px_rgba(0,245,255,0.45)]">
                <span className="text-[#00f5ff] text-xs font-semibold">A</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-[#111827] text-zinc-100 border border-[#1f2937]'
                  : msg.type === 'error'
                  ? 'bg-[#1f0720] text-[#ff00aa] border border-[#ff00aa]/40 shadow-[0_0_14px_rgba(255,0,170,0.35)]'
                  : 'bg-[#020617] text-zinc-200 border border-[#00f5ff]/35 shadow-[0_0_18px_rgba(0,245,255,0.35)]'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-zinc-500">
                  {msg.role === 'assistant' ? 'AURA' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
                {msg.commands && msg.commands.length > 0 && (
                  <span className="text-xs text-[#00ff88] ml-2">
                    {msg.commands.length} command{msg.commands.length > 1 ? 's' : ''} executed
                  </span>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center ml-2 flex-shrink-0">
                <span className="text-zinc-200 text-xs font-semibold">U</span>
              </div>
            )}
          </div>
        ))}
        {(robotState === 'thinking' || robotState === 'executing') && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-[#0b1120] border border-[#00f5ff]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-[#00f5ff] text-xs font-semibold">A</span>
            </div>
            <div className="typing-indicator text-zinc-400">
              Aura is thinking
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-[#2a2a36] p-3 bg-[#12121a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Talk to Aura..."
            className="flex-1 bg-[#1a1a24] border border-[#2a2a36] rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00f5ff]/50 focus:ring-1 focus:ring-[#00f5ff]/30 transition-all"
            disabled={isListening}
          />
          <button
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isListening
                ? 'bg-[#00ff88] text-black animate-pulse shadow-lg shadow-[#00ff88]/50'
                : 'bg-[#00f5ff]/15 text-[#00f5ff] border border-[#00f5ff]/30 hover:bg-[#00f5ff]/25 hover:shadow-lg hover:shadow-[#00f5ff]/25'
            }`}
            title="Voice input"
          >
            🎤
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isListening}
            className="px-4 py-2.5 bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/40 rounded-lg text-sm font-medium hover:bg-[#00f5ff]/30 hover:shadow-lg hover:shadow-[#00f5ff]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>Send</span>
            <span className="text-xs">⚡</span>
          </button>
        </div>
        <div className="mt-2 text-xs text-zinc-600 text-center">
          Press Enter to send • Click 🎤 for voice input
        </div>
      </div>
    </div>
  )
}
