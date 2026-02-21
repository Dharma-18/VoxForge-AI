import { useEffect, useRef, useState } from 'react'

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.7 + 0.2,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 5,
}))

const ORBS = [
  { x: 15, y: 20, size: 300, color: 'rgba(0,245,255,0.06)', blur: 120, speed: 0.015 },
  { x: 80, y: 60, size: 400, color: 'rgba(255,0,170,0.05)', blur: 160, speed: 0.010 },
  { x: 50, y: 80, size: 250, color: 'rgba(0,255,136,0.04)', blur: 100, speed: 0.020 },
  { x: 30, y: 50, size: 200, color: 'rgba(0,245,255,0.03)', blur: 80, speed: 0.025 },
]

const FEATURES = [
  {
    icon: '🎤',
    title: 'Voice Control',
    desc: 'Speak naturally. AURA understands and executes your web-building commands in real time.',
    color: '#00ff88',
  },
  {
    icon: '🤖',
    title: '3D AI Avatar',
    desc: 'AURA is your 3D holographic AI companion — animated, reactive, and always listening.',
    color: '#00f5ff',
  },
  {
    icon: '⚡',
    title: 'Monaco Editor',
    desc: 'Professional-grade code editor with syntax highlighting powered by VSCode core.',
    color: '#ff00aa',
  },
  {
    icon: '👁',
    title: 'Live Preview',
    desc: 'Watch your website materialize in real time as AURA executes each command.',
    color: '#00f5ff',
  },
]

function StarField({ scrollY }) {
  return (
    <div className="landing-stars" aria-hidden="true">
      {STARS.map((star) => (
        <div
          key={star.id}
          className="landing-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y + scrollY * 0.02}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function ParallaxOrbs({ scrollY }) {
  return (
    <div className="landing-orbs" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="landing-orb"
          style={{
            left: `${orb.x}%`,
            top: `calc(${orb.y}% + ${scrollY * orb.speed * 100}px)`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur * 0.5}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}

function GridOverlay({ scrollY }) {
  return (
    <div
      className="landing-grid"
      aria-hidden="true"
      style={{
        backgroundPosition: `0 ${scrollY * 0.3}px`,
      }}
    />
  )
}

function GlitchTitle() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 200)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glitch-wrapper">
      <h1
        className={`landing-title ${glitch ? 'glitching' : ''}`}
        data-text="VoxForge AI"
      >
        VoxForge AI
      </h1>
    </div>
  )
}

function FeatureCard({ feature, index, visible }) {
  return (
    <div
      className={`feature-card ${visible ? 'feature-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="feature-icon" style={{ color: feature.color, textShadow: `0 0 20px ${feature.color}` }}>
        {feature.icon}
      </div>
      <h3 className="feature-title" style={{ color: feature.color }}>
        {feature.title}
      </h3>
      <p className="feature-desc">{feature.desc}</p>
      <div className="feature-card-border" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }} />
    </div>
  )
}

export default function LandingPage({ onLaunch }) {
  const [scrollY, setScrollY] = useState(0)
  const [cardsVisible, setCardsVisible] = useState(false)
  const [launched, setLaunched] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      setScrollY(el.scrollTop)
      if (el.scrollTop > 100) setCardsVisible(true)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    // Trigger cards shortly for non-scrollers
    const t = setTimeout(() => setCardsVisible(true), 1200)
    return () => {
      el.removeEventListener('scroll', handleScroll)
      clearTimeout(t)
    }
  }, [])

  const handleLaunch = () => {
    setLaunched(true)
    setTimeout(() => onLaunch(), 700)
  }

  return (
    <div
      ref={containerRef}
      className={`landing-container ${launched ? 'landing-exit' : ''}`}
    >
      {/* Background layers */}
      <StarField scrollY={scrollY} />
      <ParallaxOrbs scrollY={scrollY} />
      <GridOverlay scrollY={scrollY} />

      {/* Hero Section */}
      <section className="landing-hero">
        {/* Tagline above */}
        <div className="landing-badge">
          <span className="badge-dot" />
          AURA · AI Development Agent
        </div>

        {/* Glitch title */}
        <GlitchTitle />

        {/* Subtitle */}
        <p className="landing-subtitle">
          <span className="subtitle-line subtitle-line--1">Speak.</span>{' '}
          <span className="subtitle-line subtitle-line--2">Build.</span>{' '}
          <span className="subtitle-line subtitle-line--3">Forge the Web with AI.</span>
        </p>

        {/* Description */}
        <p className="landing-desc">
          Build websites using natural voice commands. Your 3D AI companion AURA
          interprets your intent and executes changes in real time — no typing required.
        </p>

        {/* CTA */}
        <div className="landing-cta-group">
          <button className="cta-primary" onClick={handleLaunch}>
            <span className="cta-glow" />
            <span className="cta-text">Launch IDE</span>
            <span className="cta-arrow">→</span>
          </button>
          <a
            href="https://github.com/Dharma-18/VoxForge-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-secondary"
          >
            <span>GitHub</span>
            <span className="cta-arrow">↗</span>
          </a>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <div className="scroll-hint-line" />
          <span>Scroll to explore</span>
          <div className="scroll-hint-line" />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="features-label">CAPABILITIES</div>
        <h2 className="features-heading">
          Everything you need to<br />
          <span className="features-heading-accent">build at the speed of thought</span>
        </h2>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} visible={cardsVisible} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <div className="bottom-cta-glow" />
        <p className="bottom-cta-label">Ready to forge the web?</p>
        <button className="cta-primary cta-large" onClick={handleLaunch}>
          <span className="cta-glow" />
          <span className="cta-text">Open VoxForge IDE</span>
          <span className="cta-arrow">→</span>
        </button>
        <p className="bottom-cta-meta">
          No backend required for demo · Voice + Text commands · Instant preview
        </p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="footer-brand">VoxForge AI</span>
        <span className="footer-sep">·</span>
        <span className="footer-tagline">Speak. Build. Forge.</span>
      </footer>
    </div>
  )
}
