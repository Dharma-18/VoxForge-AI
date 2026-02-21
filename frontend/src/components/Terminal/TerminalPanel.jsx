import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

function getLogClass(message) {
  if (message.startsWith('✓')) return 'log-success'
  if (message.startsWith('✗')) return 'log-error'
  if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fail')) return 'log-error'
  if (message.toLowerCase().includes('warn')) return 'log-warning'
  if (message.toLowerCase().includes('connect') || message.toLowerCase().includes('websocket')) return 'log-info'
  if (message.toLowerCase().includes('initialized') || message.toLowerCase().includes('ready')) return 'log-info'
  return 'log-default'
}

export default function TerminalPanel() {
  const logs = useStore((state) => state.logs)
  const clearLogs = useStore((state) => state.clearLogs)
  const logsEndRef = useRef(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="w-full h-full flex flex-col bg-[#060609]">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#1a1a24] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-zinc-600 font-mono">
            Terminal · AURA Logs
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
        </div>
        <button
          onClick={clearLogs}
          className="text-[11px] text-zinc-600 hover:text-[#ff00aa] transition-colors font-mono px-2 py-0.5 rounded border border-transparent hover:border-[#ff00aa]/30"
        >
          Clear
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
        {logs.length === 0 && (
          <div className="text-zinc-700 mt-2 flex items-center gap-2">
            <span className="log-info">›</span>
            <span>Waiting for AURA activity...</span>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 hover:bg-white/[0.02] px-1 py-0.5 rounded transition-colors">
            <span className="text-zinc-700 flex-shrink-0 text-[10px] pt-px">{log.timestamp}</span>
            <span className="text-zinc-600 flex-shrink-0">›</span>
            <span className={getLogClass(log.message)}>{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
