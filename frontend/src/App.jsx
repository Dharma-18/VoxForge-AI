import { useState, useEffect } from 'react'
import LandingPage from './components/Landing/LandingPage'
import RobotPanel from './components/Robot/RobotPanel'
import CodeEditor from './components/Editor/CodeEditor'
import LivePreview from './components/Preview/LivePreview'
import TerminalPanel from './components/Terminal/TerminalPanel'
import { useStore } from './store/useStore'
import { AuraWebSocket } from './utils/websocket'

function IDELayout() {
  const addLog = useStore((state) => state.addLog)
  const addCommand = useStore((state) => state.addCommand)
  const code = useStore((state) => state.code)
  const setCode = useStore((state) => state.setCode)
  const commandQueue = useStore((state) => state.commandQueue)
  const setRobotState = useStore((state) => state.setRobotState)
  const setStatusText = useStore((state) => state.setStatusText)
  const setWsConnection = useStore((state) => state.setWsConnection)
  const setIsConnected = useStore((state) => state.setIsConnected)
  const isConnected = useStore((state) => state.isConnected)

  useEffect(() => {
    addLog('VoxForge AI initialized')
    addLog('AURA is ready to assist')

    try {
      const ws = new AuraWebSocket()

      ws.on('connected', () => {
        setIsConnected(true)
        addLog('✓ WebSocket connected — Real-time mode active')
      })
      ws.on('disconnected', () => {
        setIsConnected(false)
        addLog('WebSocket disconnected — Using HTTP fallback')
      })
      ws.on('state', (data) => {
        if (data.state) setRobotState(data.state)
        if (data.message) setStatusText(data.message)
      })
      ws.on('commands', (data) => {
        if (data.commands && Array.isArray(data.commands)) {
          data.commands.forEach((cmd) => {
            addCommand(cmd)
            addLog(`✓ Command received: ${cmd.action} on ${cmd.target}`)
          })
        }
      })
      ws.on('complete', (data) => {
        setRobotState(data.state || 'idle')
        setStatusText(data.message || 'Ready')
      })
      ws.on('error', (error) => {
        addLog(`WebSocket error: ${error.message || 'Connection failed'}`)
        setIsConnected(false)
      })

      ws.connect()
      setWsConnection(ws)

      return () => ws.disconnect()
    } catch {
      addLog('WebSocket not available — Using HTTP API')
      setIsConnected(false)
    }
  }, [])

  // Command executor
  useEffect(() => {
    if (commandQueue.length > 0) {
      const command = commandQueue[0]
      executeCommand(command)
      const newQueue = [...commandQueue]
      newQueue.shift()
      useStore.setState({ commandQueue: newQueue })
    }
  }, [commandQueue, code])

  const executeCommand = (command) => {
    addLog(`Executing: ${command.action} on ${command.target}`)
    try {
      let updatedCode = code
      switch (command.action) {
        case 'update_style':
          updatedCode = updateStyle(code, command.target, command.property, command.value)
          break
        case 'update_text':
          updatedCode = updateText(code, command.target, command.value)
          break
        case 'add_element':
          updatedCode = addElement(code, command.element, command.parent)
          break
        case 'remove_element':
          updatedCode = removeElement(code, command.target)
          break
        default:
          addLog(`Unknown action: ${command.action}`)
          return
      }
      setCode(updatedCode)
      addLog(`✓ ${command.action} completed`)
    } catch (error) {
      addLog(`✗ Error executing command: ${error.message}`)
    }
  }

  const updateStyle = (html, target, property, value) => {
    if (target === 'body') {
      const styleMatch = html.match(/<body[^>]*>/i)
      if (styleMatch) {
        const bodyTag = styleMatch[0]
        if (bodyTag.includes('style=')) {
          return html.replace(/<body([^>]*)style="([^"]*)"/i, `<body$1style="$2; ${property}: ${value};"`)
        } else {
          return html.replace(/<body([^>]*)>/i, `<body$1 style="${property}: ${value};">`)
        }
      }
    }
    return html
  }
  const updateText = (html, target, value) => {
    const regex = new RegExp(`<${target}[^>]*>([^<]*)</${target}>`, 'i')
    return html.replace(regex, `<${target}>${value}</${target}>`)
  }
  const addElement = (html, element, parent) => {
    const parentRegex = new RegExp(`</${parent}>`, 'i')
    return html.replace(parentRegex, `${element}</${parent}>`)
  }
  const removeElement = (html, target) => {
    const regex = new RegExp(`<${target}[^>]*>.*?</${target}>`, 'gis')
    return html.replace(regex, '')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 flex flex-col ide-enter">
      {/* Header */}
      <header className="border-b border-[#2a2a36] px-5 py-3 flex items-center gap-4 bg-[#0c0c14]" style={{ boxShadow: '0 1px 0 rgba(0,245,255,0.08)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f5ff]/20 to-[#ff00aa]/20 border border-[#00f5ff]/30 flex items-center justify-center text-[#00f5ff] text-xs font-bold" style={{ boxShadow: '0 0 12px rgba(0,245,255,0.2)' }}>
            V
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#00f5ff] leading-none" style={{ textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>VoxForge AI</h1>
            <p className="text-[10px] text-zinc-600 leading-none mt-0.5">AI Web Development IDE</p>
          </div>
        </div>

        {/* Center status */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a36] rounded-full px-4 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[11px] text-zinc-500 font-mono">Speak. Build. Forge.</span>
          </div>
        </div>

        {/* Right status badges */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-1.5 bg-[#00ff88]/10 border border-[#00ff88]/25 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[11px] text-[#00ff88] font-medium">Real-time</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#00f5ff]/10 border border-[#00f5ff]/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]" />
              <span className="text-[11px] text-[#00f5ff]">HTTP Mode</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-[#ff00aa]/10 border border-[#ff00aa]/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff00aa] animate-pulse" />
            <span className="text-[11px] text-[#ff00aa]">AURA Active</span>
          </div>
        </div>
      </header>

      {/* Main IDE Layout */}
      <main className="flex-1 grid grid-cols-[350px_1fr_1fr] grid-rows-[1fr_200px] gap-px bg-[#1a1a24] p-px min-h-0">
        {/* Left — Robot + Chat */}
        <aside className="bg-[#0c0c14] overflow-hidden" style={{ boxShadow: 'inset 0 0 30px rgba(0,245,255,0.03)' }}>
          <RobotPanel />
        </aside>

        {/* Center — Code Editor */}
        <section className="bg-[#0c0c14] overflow-hidden">
          <CodeEditor />
        </section>

        {/* Right — Live Preview */}
        <section className="bg-[#0c0c14] overflow-hidden">
          <LivePreview />
        </section>

        {/* Bottom — Terminal */}
        <div className="col-span-3 bg-[#080810] overflow-hidden">
          <TerminalPanel />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true)

  return showLanding
    ? <LandingPage onLaunch={() => setShowLanding(false)} />
    : <IDELayout />
}
