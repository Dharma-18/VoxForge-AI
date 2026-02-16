import { create } from 'zustand'

export const useStore = create((set) => ({
  // Code editor state
  code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>VoxForge Preview</title>\n  <style>\n    body { margin: 0; padding: 20px; font-family: Arial; background: #f0f0f0; }\n  </style>\n</head>\n<body>\n  <h1>Welcome to VoxForge AI</h1>\n  <p>Start building with voice or text commands!</p>\n</body>\n</html>',
  setCode: (code) => set({ code }),
  
  // Chat messages
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  
  // Terminal logs
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, { id: Date.now(), message: log, timestamp: new Date().toLocaleTimeString() }] })),
  clearLogs: () => set({ logs: [] }),
  
  // Robot state: idle, listening, thinking, talking, executing
  robotState: 'idle',
  setRobotState: (state) => set({ robotState: state }),
  
  // Status indicator
  statusText: 'Ready',
  setStatusText: (text) => set({ statusText: text }),
  
  // Voice state
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  
  // AI commands queue
  commandQueue: [],
  addCommand: (command) => set((state) => ({ commandQueue: [...state.commandQueue, command] })),
  clearCommands: () => set({ commandQueue: [] }),
  
  // WebSocket connection
  wsConnection: null,
  setWsConnection: (conn) => set({ wsConnection: conn }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}))
