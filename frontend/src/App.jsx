function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 flex flex-col">
      {/* Placeholder layout shell for Phase 1 — theme visible */}
      <header className="border-b border-[#2a2a36] px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[#00f5ff] text-glow-cyan">VoxForge AI</h1>
        <span className="text-sm text-zinc-500">Speak. Build. Forge the Web with AI.</span>
      </header>
      <main className="flex-1 grid grid-cols-[1fr_2fr_1fr] grid-rows-[1fr_auto] gap-px bg-[#2a2a36] p-1 min-h-0">
        <aside className="bg-[#12121a] rounded border border-[#00f5ff]/30 p-4 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
          <p className="text-xs uppercase tracking-wider text-[#00f5ff]/80">AURA</p>
          <p className="text-zinc-500 text-sm mt-2">3D avatar + chat</p>
        </aside>
        <section className="bg-[#12121a] rounded border border-[#2a2a36] p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Editor</p>
          <p className="text-zinc-600 text-sm mt-2">Monaco</p>
        </section>
        <section className="bg-[#12121a] rounded border border-[#2a2a36] p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Preview</p>
          <p className="text-zinc-600 text-sm mt-2">Live iframe</p>
        </section>
        <div className="col-span-3 bg-[#1a1a24] rounded border border-[#2a2a36] p-3 h-24">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Terminal / Log</p>
        </div>
      </main>
    </div>
  )
}

export default App
