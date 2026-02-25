import { create } from 'zustand'

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VoxForge Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0b1120;
      color: #e5e7eb;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px;
    }
    h1 { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg,#00f5ff,#bf5fff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    p  { color: #9ca3af; font-size: 1.05rem; max-width: 500px; text-align: center; line-height: 1.7; }
    .badge { background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); color: #00f5ff; padding: 6px 16px; border-radius: 100px; font-size: 12px; letter-spacing: .1em; }
  </style>
</head>
<body>
  <span class="badge">VoxForge AI · Live Preview</span>
  <h1>Welcome to VoxForge AI</h1>
  <p>Start building with voice or text commands. Try "Add a button" or "Change background to dark blue"!</p>
</body>
</html>`

export const useStore = create((set) => ({
  // ── Auth ─────────────────────────────────────────────────────────────────
  user: null,
  isLoggedIn: false,
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),

  // ── Code editor ──────────────────────────────────────────────────────────
  code: DEFAULT_CODE,
  setCode: (code) => set({ code }),

  // ── Chat ─────────────────────────────────────────────────────────────────
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  // ── Terminal logs ─────────────────────────────────────────────────────────
  logs: [],
  addLog: (log) =>
    set((s) => ({
      logs: [...s.logs, { id: Date.now() + Math.random(), message: log, timestamp: new Date().toLocaleTimeString() }],
    })),
  clearLogs: () => set({ logs: [] }),

  // ── Robot ─────────────────────────────────────────────────────────────────
  robotState: 'idle',  // idle | listening | thinking | talking | executing
  setRobotState: (state) => set({ robotState: state }),

  statusText: 'Ready',
  setStatusText: (text) => set({ statusText: text }),

  screenState: 'idle',
  setScreenState: (state) => set({ screenState: state }),

  // ── Voice ─────────────────────────────────────────────────────────────────
  isListening: false,
  setIsListening: (v) => set({ isListening: v }),

  // ── Command queue ─────────────────────────────────────────────────────────
  commandQueue: [],
  addCommand: (cmd) => set((s) => ({ commandQueue: [...s.commandQueue, cmd] })),
  clearCommands: () => set({ commandQueue: [] }),

  // ── WebSocket ─────────────────────────────────────────────────────────────
  wsConnection: null,
  setWsConnection: (conn) => set({ wsConnection: conn }),
  isConnected: false,
  setIsConnected: (v) => set({ isConnected: v }),
}))
