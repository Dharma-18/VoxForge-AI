import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'

export default function LivePreview() {
  const iframeRef = useRef(null)
  const code = useStore((state) => state.code)
  const addLog = useStore((state) => state.addLog)
  const [refreshKey, setRefreshKey] = useState(0)

  const updatePreview = () => {
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (doc) {
          doc.open()
          doc.write(code)
          doc.close()
          addLog('Preview updated')
        }
      } catch (error) {
        addLog(`✗ Preview error: ${error.message}`)
      }
    }
  }

  useEffect(() => {
    updatePreview()
  }, [code, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    addLog('Preview refreshed manually')
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#1a1a24] flex items-center justify-between flex-shrink-0 bg-[#0a0a12]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-zinc-600 font-mono">Live Preview</span>
          <div className="flex items-center gap-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] text-[#00ff88] font-medium">Live</span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh preview"
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-[#00f5ff] transition-colors font-mono px-2 py-0.5 rounded border border-transparent hover:border-[#00f5ff]/30 group"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-300">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
      />
    </div>
  )
}
