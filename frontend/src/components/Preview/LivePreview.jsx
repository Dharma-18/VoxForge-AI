import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

export default function LivePreview() {
  const iframeRef = useRef(null)
  const code = useStore((state) => state.code)
  const addLog = useStore((state) => state.addLog)
  
  useEffect(() => {
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
        addLog(`Preview error: ${error.message}`)
      }
    }
  }, [code])
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-2 border-b border-[#2a2a36] flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Live Preview</span>
        <span className="text-xs text-[#00ff88]">● Live</span>
      </div>
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
      />
    </div>
  )
}
