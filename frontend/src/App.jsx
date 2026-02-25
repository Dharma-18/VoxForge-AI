import { useState, useEffect } from 'react'
import LandingPage from './components/Landing/LandingPage'
import AuthPage from './components/Auth/AuthPage'
import RobotPanel from './components/Robot/RobotPanel'
import CodeEditor from './components/Editor/CodeEditor'
import LivePreview from './components/Preview/LivePreview'
import TerminalPanel from './components/Terminal/TerminalPanel'
import { useStore } from './store/useStore'
import { AuraWebSocket } from './utils/websocket'

// ── Page enum ──────────────────────────────────────────────────────────────
const PAGE = { LANDING: 'landing', AUTH: 'auth', IDE: 'ide' }

// ── IDE Layout ─────────────────────────────────────────────────────────────
function IDELayout() {
  const addLog = useStore((s) => s.addLog)
  const addCommand = useStore((s) => s.addCommand)
  const code = useStore((s) => s.code)
  const setCode = useStore((s) => s.setCode)
  const commandQueue = useStore((s) => s.commandQueue)
  const setRobotState = useStore((s) => s.setRobotState)
  const setStatusText = useStore((s) => s.setStatusText)
  const setWsConnection = useStore((s) => s.setWsConnection)
  const setIsConnected = useStore((s) => s.setIsConnected)
  const isConnected = useStore((s) => s.isConnected)
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)

  useEffect(() => {
    addLog('VoxForge AI initialized')
    addLog('AURA is ready to assist')
    try {
      const ws = new AuraWebSocket()
      ws.on('connected', () => { setIsConnected(true); addLog('✓ WebSocket connected — Real-time active') })
      ws.on('disconnected', () => { setIsConnected(false); addLog('WebSocket disconnected — HTTP fallback') })
      ws.on('state', (d) => { if (d.state) setRobotState(d.state); if (d.message) setStatusText(d.message) })
      ws.on('commands', (d) => { if (d.commands?.length) d.commands.forEach((c) => { addCommand(c); addLog(`✓ ${c.action} on ${c.target}`) }) })
      ws.on('complete', (d) => { setRobotState(d.state || 'idle'); setStatusText(d.message || 'Ready') })
      ws.on('error', (e) => { addLog(`WebSocket error: ${e.message || 'failed'}`); setIsConnected(false) })
      ws.connect()
      setWsConnection(ws)
      return () => ws.disconnect()
    } catch { addLog('WebSocket not available — HTTP API'); setIsConnected(false) }
  }, [])

  // Command executor
  useEffect(() => {
    if (commandQueue.length > 0) {
      executeCommand(commandQueue[0])
      const q = [...commandQueue]; q.shift()
      useStore.setState({ commandQueue: q })
    }
  }, [commandQueue, code])

  const executeCommand = (cmd) => {
    addLog(`Executing: ${cmd.action} on ${cmd.target}`)
    try {
      let html = code
      switch (cmd.action) {
        case 'update_style': html = updateStyle(html, cmd.target, cmd.property, cmd.value); break
        case 'update_text': html = updateText(html, cmd.target, cmd.value); break
        case 'add_element': html = addElement(html, cmd.element, cmd.parent); break
        case 'remove_element': html = removeElement(html, cmd.target); break
        default: addLog(`Unknown action: ${cmd.action}`); return
      }
      setCode(html); addLog(`✓ ${cmd.action} complete`)
    } catch (e) { addLog(`✗ Command error: ${e.message}`) }
  }

  const updateStyle = (h, t, p, v) => {
    if (t === 'body') {
      const m = h.match(/<body[^>]*>/i)
      if (m) {
        return m[0].includes('style=')
          ? h.replace(/<body([^>]*)style="([^"]*)"/i, `<body$1style="$2; ${p}: ${v};"`)
          : h.replace(/<body([^>]*)>/i, `<body$1 style="${p}: ${v};">`)
      }
    }
    return h
  }
  const updateText = (h, t, v) => h.replace(new RegExp(`<${t}[^>]*>([^<]*)</${t}>`, 'i'), `<${t}>${v}</${t}>`)
  const addElement = (h, el, p) => h.replace(new RegExp(`</${p}>`, 'i'), `${el}</${p}>`)
  const removeElement = (h, t) => h.replace(new RegExp(`<${t}[^>]*>.*?</${t}>`, 'gis'), '')

  return (
    <div className="ide-root ide-enter">
      {/* ── Header ── */}
      <header className="ide-header">
        <div className="ide-logo">
          <div className="ide-logo-orb">V</div>
          <div>
            <div className="ide-logo-name">VoxForge AI</div>
            <div className="ide-logo-tagline">Speak. Build. Forge.</div>
          </div>
        </div>

        <div className="ide-header-center">
          <div className="ide-status-pill">
            <div className="ide-status-dot" />
            AURA Development IDE
          </div>
        </div>

        <div className="ide-header-right">
          {isConnected && (
            <div className="ide-badge ide-badge--green">
              <div className="ide-badge-dot ide-badge-dot--pulse" style={{ background: '#00ff88' }} />
              Real-time
            </div>
          )}
          <div className="ide-badge ide-badge--cyan">
            <div className="ide-badge-dot" style={{ background: '#00cfff' }} />
            AURA Active
          </div>
          {user && (
            <div className="ide-user-chip" onClick={logout} title="Click to log out">
              <div className="ide-user-avatar">{user.name[0].toUpperCase()}</div>
              <span className="ide-user-name">{user.name}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </div>
          )}
        </div>
      </header>

      {/* ── IDE Grid ── */}
      <main className="ide-grid">
        <aside className="ide-panel ide-panel--left">
          <RobotPanel />
        </aside>
        <section className="ide-panel">
          <CodeEditor />
        </section>
        <section className="ide-panel">
          <LivePreview />
        </section>
        <div className="ide-panel ide-panel--terminal">
          <TerminalPanel />
        </div>
      </main>
    </div>
  )
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(PAGE.LANDING)

  return (
    <>
      {page === PAGE.LANDING && <LandingPage onLaunch={() => setPage(PAGE.AUTH)} />}
      {page === PAGE.AUTH && <AuthPage onSuccess={() => setPage(PAGE.IDE)} />}
      {page === PAGE.IDE && <IDELayout />}
    </>
  )
}
