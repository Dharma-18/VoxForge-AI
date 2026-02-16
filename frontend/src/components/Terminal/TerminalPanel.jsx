import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

export default function TerminalPanel() {
  const logs = useStore((state) => state.logs)
  const clearLogs = useStore((state) => state.clearLogs)
  const logsEndRef = useRef(null)
  
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])
  
  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0f]">
      <div className="px-4 py-2 border-b border-[#2a2a36] flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Terminal / Logs</span>
        <button
          onClick={clearLogs}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 && (
          <div className="text-zinc-600">No logs yet. Start interacting with AURA to see activity.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="mb-1 text-zinc-400">
            <span className="text-zinc-600">[{log.timestamp}]</span>{' '}
            <span className="text-zinc-300">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
