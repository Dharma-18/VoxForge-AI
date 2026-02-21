import AuraRobot from './AuraRobot'
import ChatPanel from '../Chat/ChatPanel'
import { useStore } from '../../store/useStore'

const STATE_CONFIG = {
  idle: { label: 'Standby', color: '#00f5ff', dot: 'bg-[#00f5ff]', pulse: false },
  listening: { label: 'Listening', color: '#00ff88', dot: 'bg-[#00ff88]', pulse: true },
  thinking: { label: 'Thinking', color: '#ff00aa', dot: 'bg-[#ff00aa]', pulse: true },
  talking: { label: 'Responding', color: '#00f5ff', dot: 'bg-[#00f5ff]', pulse: true },
  executing: { label: 'Executing', color: '#ffff00', dot: 'bg-[#ffff00]', pulse: true },
}

export default function RobotPanel() {
  const robotState = useStore((state) => state.robotState)
  const statusText = useStore((state) => state.statusText)
  const isConnected = useStore((state) => state.isConnected)

  const cfg = STATE_CONFIG[robotState] || STATE_CONFIG.idle

  return (
    <div className="w-full h-full flex flex-col">
      {/* AURA Header */}
      <div className="px-4 py-3 border-b border-[#1a1a24] bg-[#080810]" style={{ boxShadow: '0 1px 0 rgba(0,245,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Avatar orb */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold relative overflow-hidden"
              style={{
                background: `radial-gradient(circle, ${cfg.color}22 0%, rgba(10,10,20,0.8) 100%)`,
                border: `1px solid ${cfg.color}40`,
                boxShadow: `0 0 16px ${cfg.color}25`,
                color: cfg.color,
              }}
            >
              A
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(circle at 30% 30%, ${cfg.color}40, transparent 60%)` }}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}60` }}>
                AURA
              </h2>
              <p className="text-[10px] text-zinc-600 leading-none mt-1">AI Development Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full px-2 py-0.5">
                <div className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-[9px] text-[#00ff88]">WS</span>
              </div>
            )}
            <div
              className={`w-2 h-2 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`}
              style={{ boxShadow: `0 0 8px ${cfg.color}80` }}
            />
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 bg-[#0a0a14] rounded-lg px-3 py-1.5 border border-[#1a1a24]">
          <div
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`}
          />
          <span className="text-[11px] font-medium font-mono flex-1" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-zinc-600 truncate max-w-[120px]">{statusText}</span>
        </div>
      </div>

      {/* 3D Robot */}
      <div
        className="h-60 border-b border-[#1a1a24] relative overflow-hidden flex-shrink-0"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,245,255,0.04) 0%, #08080f 70%)' }}
      >
        <div className="absolute inset-0">
          <AuraRobot />
        </div>
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
          }}
        />
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  )
}
