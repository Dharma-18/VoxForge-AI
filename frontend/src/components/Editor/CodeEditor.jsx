import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { useStore } from '../../store/useStore'

export default function CodeEditor() {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const code = useStore((state) => state.code)
  const setCode = useStore((state) => state.setCode)
  const addLog = useStore((state) => state.addLog)
  
  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      // Configure Monaco theme
      monaco.editor.defineTheme('voxforge-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'string', foreground: 'CE9178' },
        ],
        colors: {
          'editor.background': '#12121a',
          'editor.foreground': '#e4e4e7',
          'editor.lineHighlightBackground': '#1a1a24',
          'editorCursor.foreground': '#00f5ff',
          'editor.selectionBackground': '#00f5ff33',
        },
      })
      
      monaco.editor.setTheme('voxforge-dark')
      
      // Create editor
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: code,
        language: 'html',
        theme: 'voxforge-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        roundedSelection: false,
        cursorStyle: 'line',
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
      })
      
      // Handle changes
      editorRef.current.onDidChangeModelContent(() => {
        const newCode = editorRef.current.getValue()
        setCode(newCode)
        addLog('Code updated')
      })
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])
  
  // Update editor when code changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== code) {
      editorRef.current.setValue(code)
    }
  }, [code])
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-2 border-b border-[#2a2a36] flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-500">Code Editor</span>
        <span className="text-xs text-zinc-600">HTML</span>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
