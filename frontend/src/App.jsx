import RobotPanel from './components/Robot/RobotPanel'
import CodeEditor from './components/Editor/CodeEditor'
import LivePreview from './components/Preview/LivePreview'
import TerminalPanel from './components/Terminal/TerminalPanel'
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { AuraWebSocket } from './utils/websocket'

function App() {
  const addLog = useStore((state) => state.addLog)
  const addCommand = useStore((state) => state.addCommand)
  const code = useStore((state) => state.code)
  const setCode = useStore((state) => state.setCode)
  const commandQueue = useStore((state) => state.commandQueue)
  const setRobotState = useStore((state) => state.setRobotState)
  const setStatusText = useStore((state) => state.setStatusText)
  const setWsConnection = useStore((state) => state.setWsConnection)
  const setIsConnected = useStore((state) => state.setIsConnected)
  
  useEffect(() => {
    addLog('VoxForge AI initialized')
    addLog('AURA is ready to assist')
    
    // Initialize WebSocket connection (optional - falls back to HTTP)
    try {
      const ws = new AuraWebSocket()
      
      ws.on('connected', () => {
        setIsConnected(true)
        addLog('✓ WebSocket connected - Real-time mode active')
      })
      
      ws.on('disconnected', () => {
        setIsConnected(false)
        addLog('WebSocket disconnected - Using HTTP fallback')
      })
      
      ws.on('state', (data) => {
        if (data.state) {
          setRobotState(data.state)
        }
        if (data.message) {
          setStatusText(data.message)
        }
      })
      
      ws.on('commands', (data) => {
        if (data.commands && Array.isArray(data.commands)) {
          data.commands.forEach(cmd => {
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
      
      return () => {
        ws.disconnect()
      }
    } catch (error) {
      addLog('WebSocket not available - Using HTTP API')
      setIsConnected(false)
    }
  }, [])
  
  // Command executor - processes structured JSON commands
  useEffect(() => {
    if (commandQueue.length > 0) {
      const command = commandQueue[0]
      executeCommand(command)
      // Remove processed command
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
    // Simple regex-based style update (for demo - in production use proper HTML parser)
    if (target === 'body') {
      const styleMatch = html.match(/<body[^>]*>/i)
      if (styleMatch) {
        const bodyTag = styleMatch[0]
        if (bodyTag.includes('style=')) {
          return html.replace(
            /<body([^>]*)style="([^"]*)"/i,
            `<body$1style="$2; ${property}: ${value};"`
          )
        } else {
          return html.replace(/<body([^>]*)>/i, `<body$1 style="${property}: ${value};">`)
        }
      }
    }
    return html
  }
  
  const updateText = (html, target, value) => {
    // Simple text replacement
    const regex = new RegExp(`<${target}[^>]*>([^<]*)</${target}>`, 'i')
    return html.replace(regex, `<${target}>${value}</${target}>`)
  }
  
  const addElement = (html, element, parent) => {
    // Add element before closing parent tag
    const parentRegex = new RegExp(`</${parent}>`, 'i')
    return html.replace(parentRegex, `${element}</${parent}>`)
  }
  
  const removeElement = (html, target) => {
    // Remove element and its content
    const regex = new RegExp(`<${target}[^>]*>.*?</${target}>`, 'gis')
    return html.replace(regex, '')
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a36] px-4 py-3 flex items-center gap-3 bg-[#12121a]">
        <h1 className="text-lg font-semibold text-[#00f5ff] text-glow-cyan">VoxForge AI</h1>
        <span className="text-sm text-zinc-500">Speak. Build. Forge the Web with AI.</span>
        <div className="ml-auto flex items-center gap-3">
          {useStore.getState().isConnected && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
              <span className="text-xs text-[#00ff88]">Real-time</span>
            </div>
          )}
          <div className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse"></div>
          <span className="text-xs text-zinc-500">AURA Active</span>
        </div>
      </header>
      
      {/* Main IDE Layout */}
      <main className="flex-1 grid grid-cols-[350px_1fr_1fr] grid-rows-[1fr_200px] gap-px bg-[#2a2a36] p-1 min-h-0">
        {/* Left Panel - Robot + Chat */}
        <aside className="bg-[#12121a] rounded border border-[#00f5ff]/30 shadow-[0_0_15px_rgba(0,245,255,0.15)] overflow-hidden">
          <RobotPanel />
        </aside>
        
        {/* Center Panel - Code Editor */}
        <section className="bg-[#12121a] rounded border border-[#2a2a36] overflow-hidden">
          <CodeEditor />
        </section>
        
        {/* Right Panel - Live Preview */}
        <section className="bg-[#12121a] rounded border border-[#2a2a36] overflow-hidden">
          <LivePreview />
        </section>
        
        {/* Bottom Panel - Terminal */}
        <div className="col-span-3 bg-[#1a1a24] rounded border border-[#2a2a36] overflow-hidden">
          <TerminalPanel />
        </div>
      </main>
    </div>
  )
}

export default App
