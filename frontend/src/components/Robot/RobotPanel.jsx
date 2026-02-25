import AuraRobot from './AuraRobot'
import ChatPanel from '../Chat/ChatPanel'
import { useStore } from '../../store/useStore'

const STATE_CONFIG = {
  idle: { label: 'Standby', color: '#00cfff', border: 'rgba(0,207,255,0.3)', glow: 'rgba(0,207,255,0.12)', pulse: false },
  listening: { label: 'Listening…', color: '#00ff88', border: 'rgba(0,255,136,0.35)', glow: 'rgba(0,255,136,0.10)', pulse: true },
  thinking: { label: 'Thinking…', color: '#bf5fff', border: 'rgba(191,95,255,0.35)', glow: 'rgba(191,95,255,0.10)', pulse: true },
  talking: { label: 'Responding…', color: '#00cfff', border: 'rgba(0,207,255,0.35)', glow: 'rgba(0,207,255,0.12)', pulse: true },
  executing: { label: 'Executing…', color: '#ffee00', border: 'rgba(255,238,0,0.35)', glow: 'rgba(255,238,0,0.08)', pulse: true },
}

export default function RobotPanel() {
  const robotState = useStore((s) => s.robotState)
  const statusText = useStore((s) => s.statusText)
  const isConnected = useStore((s) => s.isConnected)
  const user = useStore((s) => s.user)

  const cfg = STATE_CONFIG[robotState] || STATE_CONFIG.idle

  return (
    <div className="robot-panel">
      {/* ── Header ── */}
      <div className="robot-header" style={{ borderBottomColor: cfg.border }}>
        <div className="robot-header-left">
          <div
            className="robot-avatar-orb"
            style={{ borderColor: cfg.border, boxShadow: `0 0 16px ${cfg.glow}`, color: cfg.color }}
          >
            <span>A</span>
            <div className="robot-avatar-pulse" style={{ backgroundColor: cfg.color }} />
          </div>
          <div>
            <div className="robot-name" style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.glow}` }}>AURA</div>
            <div className="robot-subtitle">AI Development Agent</div>
          </div>
        </div>

        <div className="robot-header-right">
          {isConnected && (
            <div className="robot-badge robot-badge--green">
              <span className="robot-badge-dot robot-badge-dot--pulse" style={{ background: '#00ff88' }} />
              WS
            </div>
          )}
          {user && (
            <div className="robot-badge" style={{ borderColor: cfg.border, color: cfg.color }}>
              <span className="robot-badge-dot" style={{ background: cfg.color }} />
              {user.name.split(' ')[0]}
            </div>
          )}
        </div>
      </div>

      {/* ── State bar ── */}
      <div className="robot-state-bar" style={{ background: `linear-gradient(90deg, ${cfg.glow} 0%, transparent 100%)` }}>
        <div
          className={`robot-state-dot ${cfg.pulse ? 'animate-pulse' : ''}`}
          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
        />
        <span className="robot-state-label" style={{ color: cfg.color }}>{cfg.label}</span>
        <span className="robot-state-text">{statusText}</span>
      </div>

      {/* ── 3D Robot Viewport ── */}
      <div className="robot-viewport">
        {/* Subtle corner accents */}
        <div className="viewport-corner viewport-corner--tl" style={{ borderColor: cfg.color }} />
        <div className="viewport-corner viewport-corner--tr" style={{ borderColor: cfg.color }} />
        <div className="viewport-corner viewport-corner--bl" style={{ borderColor: cfg.color }} />
        <div className="viewport-corner viewport-corner--br" style={{ borderColor: cfg.color }} />

        {/* Scanlines */}
        <div className="viewport-scanlines" />

        {/* 3D Canvas */}
        <div className="robot-canvas-wrap">
          <AuraRobot />
        </div>

        {/* State overlay label */}
        {robotState !== 'idle' && (
          <div className="viewport-overlay-label" style={{ color: cfg.color, borderColor: `${cfg.color}33`, background: `${cfg.glow}` }}>
            {cfg.label}
          </div>
        )}
      </div>

      {/* ── Chat ── */}
      <div className="robot-chat-area">
        <ChatPanel />
      </div>
    </div>
  )
}
