'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const PORTAL_PASSWORD = 'revcoreclient';
const STORAGE_KEY = 'rcPortalAuth';

// ─── Login Screen ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password !== PORTAL_PASSWORD) { setError('Incorrect password. Please try again.'); return; }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: email.trim(), ts: Date.now() }));
      onLogin(email.trim());
    }, 700);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,100,98,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,142,254,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9af9fb003fa7bb8bb92ee.png" alt="RevCore" style={{ height: '36px', width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: '1rem' }} />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Client Portal</div>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem' }}>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', margin: '0 0 2rem' }}>Sign in to access your RevCore client resources.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.85rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.85rem 3rem 0.85rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(254,100,98,0.1)', border: '1px solid rgba(254,100,98,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#FE6462', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? 'rgba(254,100,98,0.5)' : '#FE6462', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s', letterSpacing: '-0.01em' }}
            >
              {loading ? 'Signing in...' : 'Access Client Portal'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Need access? Email <a href="mailto:hello@revcorehq.com" style={{ color: 'rgba(254,100,98,0.7)', textDecoration: 'none' }}>hello@revcorehq.com</a>
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
type Tab = 'home' | 'sales' | 'resources';

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const firstName = email.split('@')[0].split('.')[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', fontFamily: 'DM Sans, sans-serif', color: '#fff' }}>
      {/* Portal Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,11,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9af9fb003fa7bb8bb92ee.png" alt="RevCore" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Client Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', display: 'none' }} className="portal-email-label">{email}</span>
            <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div style={{ display: 'flex', gap: '0', maxWidth: '1200px', margin: '0 auto', overflowX: 'auto' }}>
          {([
            { id: 'home', label: 'Dashboard' },
            { id: 'sales', label: 'Sales Mastery' },
            { id: 'resources', label: 'Resources' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 1.5rem', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', color: activeTab === tab.id ? '#FE6462' : 'rgba(255,255,255,0.4)', borderBottom: activeTab === tab.id ? '2px solid #FE6462' : '2px solid transparent', transition: 'all 0.2s', marginBottom: '-1px' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 5vw, 4rem)' }}>
        {activeTab === 'home' && <HomeDashboard displayName={displayName} setActiveTab={setActiveTab} />}
        {activeTab === 'sales' && <SalesMastery />}
        {activeTab === 'resources' && <Resources />}
      </main>

      <style>{`
        @media (min-width: 600px) { .portal-email-label { display: block !important; } }
        @media (max-width: 600px) { .portal-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ─── Home Dashboard ──────────────────────────────────────────────────────────
function HomeDashboard({ displayName, setActiveTab }: { displayName: string; setActiveTab: (t: Tab) => void }) {
  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254,100,98,0.1)', border: '1px solid rgba(254,100,98,0.2)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FE6462', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <span style={{ color: '#FE6462', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Client</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.1 }}>
          Welcome back, {displayName}.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0 }}>
          Everything you need to get the most out of RevCore — all in one place.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }} className="portal-grid-2">
        {/* Onboarding */}
        <Link href="/onboarding" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(254,100,98,0.12) 0%, rgba(254,100,98,0.04) 100%)', border: '1px solid rgba(254,100,98,0.25)', borderRadius: '16px', padding: '1.75rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(254,100,98,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(254,100,98,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(254,100,98,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FE6462" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>Complete Onboarding</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>Fill out your service details, starting price, and media prep checklist before your kickoff call.</p>
            <span style={{ color: '#FE6462', fontSize: '0.83rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Start now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </Link>

        {/* Sales Mastery */}
        <div onClick={() => setActiveTab('sales')} style={{ background: 'linear-gradient(135deg, rgba(107,142,254,0.1) 0%, rgba(107,142,254,0.03) 100%)', border: '1px solid rgba(107,142,254,0.2)', borderRadius: '16px', padding: '1.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,142,254,0.45)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,142,254,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(107,142,254,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8EFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>Sales Mastery Training</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>Watch our in-home sales best practices video and learn how to close more appointments.</p>
          <span style={{ color: '#6B8EFE', fontSize: '0.83rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Watch training
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>

      {/* Launch Roadmap */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>Your Launch Roadmap</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { step: '01', title: 'Complete Onboarding Form', desc: 'Service details, pricing, media prep — the foundation of your campaign.', done: false },
            { step: '02', title: 'Kickoff Strategy Call', desc: 'We review your onboarding form and align on campaign strategy, targeting, and creative direction.', done: false },
            { step: '03', title: 'Creative Production', desc: 'RevCore builds your ad creatives, copy, and landing pages — ready for review within 5–7 days.', done: false },
            { step: '04', title: 'Campaign Goes Live', desc: 'Ads launch across your target market. We monitor daily and optimize for cost-per-booked-job.', done: false },
            { step: '05', title: 'Weekly Performance Reviews', desc: 'We send performance updates and continuously optimize to improve results month over month.', done: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: i < 4 ? '1.5rem' : 0, position: 'relative' }}>
              {i < 4 && <div style={{ position: 'absolute', left: '19px', top: '38px', bottom: 0, width: '1px', background: 'rgba(255,255,255,0.08)' }} />}
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                {item.step}
              </div>
              <div style={{ paddingTop: '0.4rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support card */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Need help or have questions?</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>Your RevCore team is here. Reach out anytime.</div>
        </div>
        <a href="mailto:hello@revcorehq.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          hello@revcorehq.com
        </a>
      </div>

      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>
    </div>
  );
}

// ─── Sales Mastery ───────────────────────────────────────────────────────────
function SalesMastery() {
  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(107,142,254,0.1)', border: '1px solid rgba(107,142,254,0.2)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B8EFE" stroke="none"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          <span style={{ color: '#6B8EFE', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Training</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.1 }}>Sales Mastery Hub</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0, maxWidth: '560px' }}>
          Best practices for in-home sales from the RevCore team — built specifically for the trades.
        </p>
      </div>

      {/* Video Placeholder */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'linear-gradient(135deg, #0d1117 0%, #0a0f1a 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(107,142,254,0.15)', border: '1px solid rgba(107,142,254,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#6B8EFE"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>In-Home Sales Best Practices</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Loom video coming soon — your team will be notified when it's ready.</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(107,142,254,0.12)', border: '1px solid rgba(107,142,254,0.25)', borderRadius: '100px', padding: '5px 14px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6B8EFE', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ color: '#6B8EFE', fontSize: '0.75rem', fontWeight: 600 }}>Video uploading soon</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>In-Home Sales Best Practices — RevCore Walkthrough</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginTop: '2px' }}>Hosted by RevCore team · Coming soon</div>
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem', letterSpacing: '-0.02em' }}>Key Principles for In-Home Sales</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          {
            icon: '01', color: '#FE6462',
            title: 'Show Up to Win, Not Just Arrive',
            tips: ['Arrive 5 min early — never late', 'Dress sharp: clean uniform or business casual', 'Leave your truck/van neat and visible (it\'s a billboard)', 'Bring a printed or digital proposal — not just a verbal quote'],
          },
          {
            icon: '02', color: '#6B8EFE',
            title: 'Diagnose Before You Prescribe',
            tips: ['Ask questions before presenting solutions', 'Find out their timeline, budget concern, and who else is involved in the decision', 'Listen 70%, talk 30% during the first half', 'Repeat their pain point back to them in their own words'],
          },
          {
            icon: '03', color: '#94D96B',
            title: 'Build Trust, Not Pressure',
            tips: ['Reference nearby jobs or neighborhoods you\'ve worked in', 'Show before/after photos or videos from past clients', 'Be honest about timelines — don\'t overpromise', 'Answer objections with curiosity, not defense'],
          },
          {
            icon: '04', color: '#FE6462',
            title: 'Present Value, Not Just Price',
            tips: ['Break down what\'s included — don\'t just quote a number', 'Anchor high first, then show the right-fit option', 'Explain WHY you\'re priced the way you are (quality, warranty, team)', 'Quantify the risk of doing nothing or going cheap'],
          },
          {
            icon: '05', color: '#6B8EFE',
            title: 'Handle Objections Like a Pro',
            tips: ['"I need to think about it" → Ask what specifically', '"It\'s too expensive" → Reframe to value per year / per day', '"I\'m getting other quotes" → Find out what they\'re really comparing', 'Never discount without getting something in return (urgency, deposit)'],
          },
          {
            icon: '06', color: '#94D96B',
            title: 'Close With Confidence',
            tips: ['Ask for the business directly: "Are you ready to move forward?"', 'Offer two options — both say yes, just in different ways', 'Make paperwork easy: digital signing on-site if possible', 'Get a deposit same day whenever possible — buyers remorse kills deals'],
          },
        ].map((card, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${card.color}18`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: card.color, letterSpacing: '0.05em' }}>{card.icon}</div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{card.title}</h3>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {card.tips.map((tip, j) => (
                <li key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <span style={{ color: card.color, marginTop: '0.25rem', flexShrink: 0 }}>›</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Appointment Prep Checklist */}
      <div style={{ background: 'rgba(254,100,98,0.05)', border: '1px solid rgba(254,100,98,0.15)', borderRadius: '16px', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>Before Every Appointment — Checklist</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>Run through this before you walk in the door.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem' }}>
          {[
            'Confirm appointment 1–2 hrs ahead with a text/call',
            'Research the property address on Google Maps',
            'Review any notes from the lead source',
            'Have your pricing sheet / proposal ready',
            'Charge your phone & tablet fully',
            'Load before/after photos or videos to show',
            'Have financing options ready to discuss if needed',
            'Know your schedule — can you start this week?',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1.5px solid rgba(254,100,98,0.4)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>
    </div>
  );
}

// ─── Resources ───────────────────────────────────────────────────────────────
function Resources() {
  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94D96B" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style={{ color: '#94D96B', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Resources</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.1 }}>Client Resources</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0, maxWidth: '560px' }}>
          Reference guides, expectations, and important information for your RevCore partnership.
        </p>
      </div>

      {/* What to Expect */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>What to Expect From Your Campaign</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { period: 'Week 1–2', title: 'Setup & Launch', desc: 'Ad accounts configured, creatives built, audiences dialed in. Your campaign goes live. Expect data collection — not volume yet.' },
            { period: 'Week 3–4', title: 'Optimization Begins', desc: 'We analyze early data, cut underperforming ads, and scale what\'s working. Lead quality improves week over week.' },
            { period: 'Month 2', title: 'Consistency & Volume', desc: 'Campaigns are dialed in. Lead flow becomes more predictable. We continue testing new creative angles to sustain performance.' },
            { period: 'Month 3+', title: 'Scale & Refinement', desc: 'We have enough data to confidently scale budget toward your best-performing segments. Results compound over time.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(254,100,98,0.1)', border: '1px solid rgba(254,100,98,0.2)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: '#FE6462', letterSpacing: '0.04em', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>{item.period}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>Metrics We Track For You</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>These are the numbers that actually matter — not vanity metrics.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { metric: 'Cost Per Lead', desc: 'How much we spend to acquire each inbound inquiry' },
            { metric: 'Cost Per Booked Job', desc: 'The real number — cost to generate a paying customer' },
            { metric: 'Lead-to-Appointment Rate', desc: 'What % of leads actually book an appointment' },
            { metric: 'Appointment-to-Close Rate', desc: 'How well your team converts appointments into sales' },
            { metric: 'Average Job Value', desc: 'Revenue per closed job — key to calculating true ROI' },
            { metric: 'Return on Ad Spend', desc: 'Revenue generated per dollar of ad spend' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#94D96B', marginBottom: '0.35rem' }}>{item.metric}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>Common Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { q: 'How quickly will I see leads?', a: 'Most campaigns start generating leads within 5–10 days of going live. Volume increases as we optimize over the first 30 days.' },
            { q: 'What should I do when a lead comes in?', a: 'Respond within 5 minutes. Speed to lead is the single biggest factor in conversion rates. A warm lead goes cold fast.' },
            { q: 'What if the lead quality is low?', a: 'Let us know immediately via email. We use this feedback to tighten targeting and improve lead quality. Don\'t sit on bad data.' },
            { q: 'Can I pause or change my campaign?', a: 'Yes. Reach out to hello@revcorehq.com with any change requests. We generally need 48 hours notice for budget or targeting changes.' },
            { q: 'How do I refer another contractor?', a: 'We love referrals. Email us or mention it on your next check-in call and we\'ll take care of you.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>{item.q}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.5 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Your RevCore Team</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>We typically respond within a few hours during business hours.</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="mailto:hello@revcorehq.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            hello@revcorehq.com
          </a>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FE6462', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Book a call
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { email: e } = JSON.parse(stored);
        if (e) setEmail(e);
      }
    } catch {}
    setChecked(true);
  }, []);

  const handleLogin = (e: string) => setEmail(e);
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
  };

  if (!checked) return null;
  if (!email) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard email={email} onLogout={handleLogout} />;
}
