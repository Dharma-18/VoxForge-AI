import { useState } from 'react'
import { useStore } from '../../store/useStore'

const STARS_AUTH = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: Math.random() * 4 + 3,
    delay: Math.random() * 5,
}))

export default function AuthPage({ onSuccess }) {
    const [tab, setTab] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const login = useStore((s) => s.login)

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!form.email || !form.password) {
            setError('Please fill in all required fields.')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Please enter a valid email address.')
            return
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (tab === 'signup' && !form.name.trim()) {
            setError('Please enter your name.')
            return
        }

        setLoading(true)
        // Simulate auth (replace with real API call later)
        setTimeout(() => {
            login({
                name: tab === 'signup' ? form.name : form.email.split('@')[0],
                email: form.email,
            })
            setLoading(false)
            onSuccess()
        }, 1200)
    }

    return (
        <div className="auth-page">
            {/* Stars */}
            <div className="landing-stars" aria-hidden="true">
                {STARS_AUTH.map((s) => (
                    <div
                        key={s.id}
                        className="landing-star"
                        style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
                    />
                ))}
            </div>

            {/* Orbs */}
            <div className="auth-orb auth-orb--cyan" />
            <div className="auth-orb auth-orb--magenta" />

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-orb">V</div>
                    <div>
                        <div className="auth-logo-name">VoxForge AI</div>
                        <div className="auth-logo-sub">AI Development IDE</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
                        onClick={() => { setTab('login'); setError(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${tab === 'signup' ? 'auth-tab--active' : ''}`}
                        onClick={() => { setTab('signup'); setError(''); }}
                    >
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {tab === 'signup' && (
                        <div className="auth-field">
                            <label className="auth-label">Full Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="name"
                                placeholder="Ada Lovelace"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            name="password"
                            placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                            value={form.password}
                            onChange={handleChange}
                            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span className="auth-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        <span className="cta-glow" />
                        {loading ? (
                            <span className="auth-loading">
                                <span className="auth-dot" />
                                <span className="auth-dot" />
                                <span className="auth-dot" />
                            </span>
                        ) : (
                            <span>{tab === 'login' ? 'Launch VoxForge →' : 'Create Account →'}</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer-text">
                    {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        className="auth-switch"
                        onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                    >
                        {tab === 'login' ? 'Sign up free' : 'Sign in'}
                    </button>
                </p>

                <p className="auth-disclaimer">
                    By continuing you agree to the VoxForge AI Terms of Service.
                </p>
            </div>
        </div>
    )
}
