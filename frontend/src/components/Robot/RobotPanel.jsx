import AuraRobot from './AuraRobot'
import ChatPanel from '../Chat/ChatPanel'
import { useStore } from '../../store/useStore'

export default function RobotPanel() {
  const robotState = useStore((state) => state.robotState)
  const statusText = useStore((state) => state.statusText)
  const isConnected = useStore((state) => state.isConnected)
  
  const getStatusColor = () => {
    switch (robotState) {
      case 'listening': return 'text-[#00ff88]'
      case 'thinking': return 'text-[#ff00aa]'
      case 'talking': return 'text-[#00f5ff]'
      case 'executing': return 'text-[#ffff00]'
      default: return 'text-[#00f5ff]'
    }
  }
  
  const getStatusDotColor = () => {
    switch (robotState) {
      case 'listening': return 'bg-[#00ff88]'
      case 'thinking': return 'bg-[#ff00aa]'
      case 'talking': return 'bg-[#00f5ff]'
      case 'executing': return 'bg-[#ffff00]'
      default: return 'bg-[#00f5ff]'
    }
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* AURA Header */}
      <div className="px-4 py-3 border-b border-[#2a2a36] bg-[#0a0a0f]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-[#00f5ff] text-glow-cyan">AURA</h2>
            <p className="text-xs text-zinc-500">AI Development Agent</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${getStatusDotColor()} ${robotState !== 'idle' ? 'animate-pulse' : ''}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {statusText}
          </span>
          {isConnected && (
            <span className="text-xs text-[#00ff88]">● Connected</span>
          )}
        </div>
      </div>
      
      {/* 3D Robot Section */}
      <div className="h-64 border-b border-[#2a2a36] relative bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
        <div className="absolute inset-0 flex items-center justify-center">
          <AuraRobot />
        </div>
      </div>
      
      {/* Chat Section */}
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  )
}
