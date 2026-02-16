import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import axios from 'axios'

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useStore((state) => state.messages)
  const addMessage = useStore((state) => state.addMessage)
  const setRobotState = useStore((state) => state.setRobotState)
  const setIsListening = useStore((state) => state.setIsListening)
  const addLog = useStore((state) => state.addLog)
  const addCommand = useStore((state) => state.addCommand)
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user', content: input, timestamp: new Date() }
    addMessage(userMessage)
    setInput('')
    setRobotState('talking')
    
    try {
      addLog(`Processing command: ${input}`)
      
      // Get current code from store
      const currentCode = useStore.getState().code
      
      // Call backend API
      const response = await axios.post('http://localhost:8000/api/agent/command', {
        prompt: input,
        context: { code: currentCode }
      }, {
        timeout: 5000
      })
      
      const aiMessage = {
        role: 'assistant',
        content: response.data.response || 'Command processed',
        timestamp: new Date()
      }
      addMessage(aiMessage)
      
      // Process structured commands
      if (response.data.commands && Array.isArray(response.data.commands)) {
        response.data.commands.forEach(cmd => {
          addCommand(cmd)
          addLog(`Executing: ${cmd.action} on ${cmd.target}`)
        })
      }
      
      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }
      
      setRobotState('idle')
    } catch (error) {
      const errorMsg = error.code === 'ECONNREFUSED' || error.message.includes('Network Error')
        ? 'Backend server not running. Please start the backend server on port 8000.'
        : `Error: ${error.message}`
      
      addLog(errorMsg)
      addMessage({
        role: 'assistant',
        content: errorMsg.includes('Backend') 
          ? 'Backend server is not running. Please start it with: cd backend && uvicorn main:app --reload'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      })
      setRobotState('idle')
    }
  }
  
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addLog('Speech recognition not supported in this browser')
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
      addLog('Listening...')
    }
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      setRobotState('idle')
      handleSend()
    }
    
    recognition.onerror = (event) => {
      addLog(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      setRobotState('idle')
    }
    
    recognition.onend = () => {
      setIsListening(false)
      setRobotState('idle')
    }
    
    recognition.start()
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 text-sm mt-8">
            <p className="text-[#00f5ff]/60 mb-2">Start chatting with AURA</p>
            <p className="text-xs">Try: "Change the background color to blue"</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/30'
                  : 'bg-[#1a1a24] text-zinc-200 border border-[#2a2a36]'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-[#2a2a36] p-3 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your command or use voice..."
            className="flex-1 bg-[#1a1a24] border border-[#2a2a36] rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00f5ff]/50"
          />
          <button
            onClick={handleVoiceInput}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              useStore.getState().isListening
                ? 'bg-[#00ff88] text-black animate-pulse'
                : 'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/30 hover:bg-[#00f5ff]/30'
            }`}
          >
            🎤
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/30 rounded text-sm font-medium hover:bg-[#00f5ff]/30 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
