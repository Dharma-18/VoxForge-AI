import AuraRobot from './AuraRobot'
import ChatPanel from '../Chat/ChatPanel'

export default function RobotPanel() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* 3D Robot Section */}
      <div className="h-64 border-b border-[#2a2a36] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <AuraRobot />
        </div>
        <div className="absolute top-2 left-2">
          <h2 className="text-sm font-semibold text-[#00f5ff] text-glow-cyan">AURA</h2>
          <p className="text-xs text-zinc-500">AI Development Agent</p>
        </div>
      </div>
      
      {/* Chat Section */}
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  )
}
