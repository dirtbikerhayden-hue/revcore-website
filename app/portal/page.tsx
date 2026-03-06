'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const PORTAL_PASSWORD = 'revcoreclient';
const STORAGE_KEY = 'rcPortalAuth';

// ─── Login Screen ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password !== PORTAL_PASSWORD) { setError('Incorrect password. Please try again.'); return; }
    setLoading(true);
    const capitalized = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: capitalized, ts: Date.now() }));
      onLogin(capitalized);
    }, 700);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden', paddingTop: 'calc(80px + 2rem)' }}>
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
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>YOUR NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
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
type Tab = 'home' | 'sales' | 'gmb' | 'resources' | 'support';

function Dashboard({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const displayName = name;

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', fontFamily: 'DM Sans, sans-serif', color: '#fff', paddingTop: '80px' }}>
      {/* Portal Header */}
      <header style={{ position: 'sticky', top: 80, zIndex: 100, background: 'rgba(7,11,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9af9fb003fa7bb8bb92ee.png" alt="RevCore" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Client Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', display: 'none' }} className="portal-email-label">{name}</span>
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
            { id: 'gmb', label: 'Integrations' },
            { id: 'resources', label: 'Resources' },
            { id: 'support', label: 'Support' },
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
        {activeTab === 'gmb' && <GoogleSetup />}
        {activeTab === 'resources' && <Resources />}
        {activeTab === 'support' && <SupportSection />}
      </main>

      <style>{`
        @media (min-width: 600px) { .portal-email-label { display: block !important; } }
        @media (max-width: 600px) { .portal-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ─── Support Section ─────────────────────────────────────────────────────────
function SupportSection() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, []);

  return (
    <div style={{ marginTop: '2.5rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(254,100,98,0.1)', border: '1px solid rgba(254,100,98,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FE6462" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Support Center</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.84rem', margin: 0 }}>Submit a ticket or book a 30-minute call with your RevCore team.</p>
        </div>
      </div>

      {/* GHL Ticket Form */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.3rem', letterSpacing: '-0.01em' }}>Submit a Support Ticket</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.84rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>Report a bug, request a change, or ask a question — we respond within a few hours during business hours.</p>
        <iframe
          src="https://api.leadconnectorhq.com/widget/form/9epUb2dwOeBwrZkLja00"
          style={{ width: '100%', height: '670px', border: 'none', borderRadius: '3px', display: 'block' }}
          id="inline-9epUb2dwOeBwrZkLja00"
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Support"
          data-height="670"
          data-layout-iframe-id="inline-9epUb2dwOeBwrZkLja00"
          data-form-id="9epUb2dwOeBwrZkLja00"
          title="Support"
        />
      </div>

      {/* Book a support call */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.25rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FE6462" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.3rem', letterSpacing: '-0.01em' }}>Book a 30-Minute Support Call</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
              Each client gets <strong style={{ color: 'rgba(255,255,255,0.7)' }}>one complimentary 30-minute call per week</strong> on our support calendar. Pick a time that works for you below.
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            src="https://api.leadconnectorhq.com/widget/booking/zP6dMYc8h9lrBFqYkuXm"
            style={{ width: '100%', border: 'none', minHeight: '680px', display: 'block' }}
            scrolling="no"
            id="zP6dMYc8h9lrBFqYkuXm_1772759825887"
          />
        </div>
      </div>
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

// ─── Google Setup ────────────────────────────────────────────────────────────
function GoogleSetup() {
  const steps = [
    {
      num: '01',
      title: 'Go to your Google Business Profile',
      detail: 'Visit business.google.com and sign in with the Google account that owns your business listing. Make sure you\'re logged into the correct account — the one where your business is verified.',
    },
    {
      num: '02',
      title: 'Open Business Profile Settings',
      detail: 'Once inside your dashboard, click on the business name or select your listing. Then look for the gear icon or "Business Profile settings" in the left-hand menu.',
    },
    {
      num: '03',
      title: 'Navigate to "Managers"',
      detail: 'Inside settings, find and click "Managers" (sometimes listed under "People and access"). This is where you control who can access and edit your profile.',
    },
    {
      num: '04',
      title: 'Add RevCore as a Manager',
      detail: 'Click the "Add" button or the blue "+" icon. In the email field, enter: hello@revcorehq.com — then select "Manager" as the access role (not Owner). Click "Invite."',
      highlight: 'hello@revcorehq.com',
    },
    {
      num: '05',
      title: 'We\'ll Accept and Get to Work',
      detail: 'Once you send the invite, we\'ll receive a notification and accept it. After that, RevCore will have access to optimize your profile — updating photos, posts, services, hours, and your Q&A to drive more organic local leads.',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span style={{ color: '#4285F4', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Google Business</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.1 }}>Google Business Profile Setup</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
          Adding RevCore as a manager to your Google Business Profile lets us optimize your listing for local search — more reviews visibility, better photos, updated services, and local posts that drive calls.
        </p>
      </div>

      {/* Video Placeholder */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'linear-gradient(135deg, #0d1117 0%, #0a0f1a 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#4285F4"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>Google Business Profile Walkthrough</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Step-by-step Loom video — coming soon.</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', borderRadius: '100px', padding: '5px 14px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4285F4', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ color: '#4285F4', fontSize: '0.75rem', fontWeight: 600 }}>Video uploading soon</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>How to Add RevCore as a Google Business Manager</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginTop: '2px' }}>RevCore walkthrough · Coming soon</div>
        </div>
      </div>

      {/* Why it matters */}
      <div style={{ background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', letterSpacing: '-0.01em', color: '#4285F4' }}>Why This Matters for Your Business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { title: 'More Calls from Local Search', desc: 'An optimized GBP profile ranks higher when locals search for your service.' },
            { title: 'Better Review Management', desc: 'We help you respond to reviews and set up a review request strategy.' },
            { title: 'Service & Photo Optimization', desc: 'Updated photos and services signal trust and completeness to Google\'s algorithm.' },
            { title: 'Local Posts & Offers', desc: 'Regular posts keep your listing active and show up in Maps results.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: '#fff' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-step walkthrough */}
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>Step-by-Step: How to Add RevCore</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: i < steps.length - 1 ? '0' : '0', position: 'relative' }}>
            {i < steps.length - 1 && <div style={{ position: 'absolute', left: '19px', top: '44px', height: 'calc(100% - 12px)', width: '1px', background: 'rgba(255,255,255,0.07)' }} />}
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.68rem', fontWeight: 800, color: '#4285F4', letterSpacing: '0.05em' }}>
              {step.num}
            </div>
            <div style={{ paddingTop: '0.35rem', paddingBottom: i < steps.length - 1 ? '1.75rem' : 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{step.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {step.highlight
                  ? step.detail.split(step.highlight).map((part, j, arr) => (
                      <span key={j}>{part}{j < arr.length - 1 && <span style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '5px', padding: '1px 7px', color: '#93bbf9', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.83rem' }}>{step.highlight}</span>}</span>
                    ))
                  : step.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Access level note */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94D96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Manager access — not Owner</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.5 }}>
            When you add us, select <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Manager</strong> — not Owner. This gives us everything we need to optimize your profile without transferring ownership of your listing. You stay in full control.
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Need help with the steps above?</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem' }}>Email us and we can walk you through it live.</div>
        </div>
        <a href="mailto:hello@revcorehq.com?subject=GBP Access Help" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4285F4', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Get help via email
        </a>
      </div>

      {/* ─── FACEBOOK BUSINESS SUITE ─── */}
      <div style={{ marginTop: '3.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.25)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
          <span style={{ color: '#1877F2', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Facebook Business Suite</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.15 }}>Facebook & Instagram Ad Access</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
          We need access to your Facebook ad assets so we can build, launch, and manage your campaigns. Follow one or both paths below depending on how your account is set up.
        </p>
      </div>

      {/* Path 1 — Business Manager */}
      <div style={{ background: 'rgba(24,119,242,0.04)', border: '1px solid rgba(24,119,242,0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(24,119,242,0.12)', border: '1px solid rgba(24,119,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Path A — Campaign Access via Meta Business Manager</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2px' }}>Recommended if you use Business Manager (business.facebook.com)</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { num: '01', title: 'Go to Meta Business Manager', detail: 'Visit business.facebook.com and log in with the Facebook account connected to your business. Make sure you\'re in the correct Business Manager account.' },
            { num: '02', title: 'Open Business Settings', detail: 'In the left sidebar, click "Settings" (or the gear icon), then select "Business Settings." This is the central hub for managing access.' },
            { num: '03', title: 'Go to Users → People', detail: 'In Business Settings, click "Users" in the left panel, then click "People." This is where you\'ll invite our team.' },
            { num: '04', title: 'Invite RevCore as an Employee', detail: 'Click "Add," enter hello@revcorehq.com, and set the role to "Employee." Click Next — don\'t assign pages yet, we\'ll do that in the next step.', highlight: 'hello@revcorehq.com' },
            { num: '05', title: 'Assign Ad Account Access', detail: 'After adding the user, select "Ad accounts" from the left panel under "Accounts." Find your ad account, click "Add People," select RevCore, and set the role to "Advertiser."' },
            { num: '06', title: 'Send the Invite', detail: 'Click "Invite" to finalise. We\'ll receive a notification, accept it, and get to work on your campaigns immediately.' },
          ].map((step: { num: string; title: string; detail: string; highlight?: string }, i: number, arr: { num: string; title: string; detail: string; highlight?: string }[]) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', position: 'relative' }}>
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: '19px', top: '44px', height: 'calc(100% - 12px)', width: '1px', background: 'rgba(255,255,255,0.07)' }} />}
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.68rem', fontWeight: 800, color: '#1877F2', letterSpacing: '0.05em' }}>{step.num}</div>
              <div style={{ paddingTop: '0.35rem', paddingBottom: i < arr.length - 1 ? '1.75rem' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{step.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                  {step.highlight
                    ? step.detail.split(step.highlight).map((part: string, j: number, a: string[]) => (
                        <span key={j}>{part}{j < a.length - 1 && <span style={{ background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.3)', borderRadius: '5px', padding: '1px 7px', color: '#7db4f9', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.83rem' }}>{step.highlight}</span>}</span>
                      ))
                    : step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Path 2 — Ads Manager direct */}
      <div style={{ background: 'rgba(24,119,242,0.04)', border: '1px solid rgba(24,119,242,0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(24,119,242,0.12)', border: '1px solid rgba(24,119,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Path B — Ad Account Access via Ads Manager</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2px' }}>Use this if you manage ads directly in Ads Manager without Business Manager</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { num: '01', title: 'Open Ads Manager', detail: 'Go to adsmanager.facebook.com and make sure you\'re logged into the correct Facebook account that owns the ad account.' },
            { num: '02', title: 'Go to Ad Account Settings', detail: 'Click the menu icon (≡) in the top left, then navigate to "Ad Account Settings." You can also access this via Settings → Ad Account Settings.' },
            { num: '03', title: 'Find "Ad Account Roles"', detail: 'Scroll down to the "Ad Account Roles" section. Here you\'ll see a list of people who currently have access to this ad account.' },
            { num: '04', title: 'Add RevCore as an Advertiser', detail: 'Click "Add People," type in hello@revcorehq.com, and assign the role "Advertiser." This gives us full campaign management without the ability to modify your payment method.', highlight: 'hello@revcorehq.com' },
            { num: '05', title: 'Confirm and Save', detail: 'Click "Confirm" to send the request. We\'ll accept and begin building your campaigns.' },
          ].map((step: { num: string; title: string; detail: string; highlight?: string }, i: number, arr: { num: string; title: string; detail: string; highlight?: string }[]) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', position: 'relative' }}>
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: '19px', top: '44px', height: 'calc(100% - 12px)', width: '1px', background: 'rgba(255,255,255,0.07)' }} />}
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.68rem', fontWeight: 800, color: '#1877F2', letterSpacing: '0.05em' }}>{step.num}</div>
              <div style={{ paddingTop: '0.35rem', paddingBottom: i < arr.length - 1 ? '1.75rem' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{step.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                  {step.highlight
                    ? step.detail.split(step.highlight).map((part: string, j: number, a: string[]) => (
                        <span key={j}>{part}{j < a.length - 1 && <span style={{ background: 'rgba(24,119,242,0.15)', border: '1px solid rgba(24,119,242,0.3)', borderRadius: '5px', padding: '1px 7px', color: '#7db4f9', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.83rem' }}>{step.highlight}</span>}</span>
                      ))
                    : step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook note */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94D96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Advertiser role — not Admin</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.5 }}>
            We only need <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Advertiser</strong> access — this lets us create and manage campaigns without touching your billing, payment methods, or account ownership. You stay in full control.
          </div>
        </div>
      </div>

      {/* ─── GOOGLE CALENDAR ─── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', borderRadius: '100px', padding: '4px 12px', marginBottom: '1rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{ color: '#4285F4', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Google Calendar</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.15 }}>Google Calendar Read/Write Access</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
          Sharing your Google Calendar with full read and write access allows RevCore to manage your appointment scheduling, integrate bookings from your campaigns, and keep your availability synced automatically.
        </p>
      </div>

      <div style={{ background: 'rgba(66,133,244,0.04)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { num: '01', title: 'Open Google Calendar', detail: 'Go to calendar.google.com and sign in with the Google account that holds the calendar you want to share — typically your main business account.' },
            { num: '02', title: 'Find the Calendar to Share', detail: 'On the left sidebar under "My calendars," hover over the calendar you want to share (e.g. your business calendar). Click the three-dot menu (⋮) that appears.' },
            { num: '03', title: 'Open Settings and Sharing', detail: 'Click "Settings and sharing" from the dropdown menu. This opens the sharing and access settings for that specific calendar.' },
            { num: '04', title: 'Add RevCore Under "Share with specific people"', detail: 'Scroll to the "Share with specific people or groups" section. Click "+ Add people and groups" and enter hello@revcorehq.com.', highlight: 'hello@revcorehq.com' },
            { num: '05', title: 'Set Permission to "Make changes to events"', detail: 'In the permissions dropdown next to our email, select "Make changes to events." This grants full read/write access — we can create, edit, and delete events on your behalf.' },
            { num: '06', title: 'Click Send', detail: 'Hit "Send" to share the calendar. We\'ll accept the invite and connect your calendar to your campaign\'s booking workflow so leads can book directly into your schedule.' },
          ].map((step: { num: string; title: string; detail: string; highlight?: string }, i: number, arr: { num: string; title: string; detail: string; highlight?: string }[]) => (
            <div key={i} style={{ display: 'flex', gap: '1.25rem', position: 'relative' }}>
              {i < arr.length - 1 && <div style={{ position: 'absolute', left: '19px', top: '44px', height: 'calc(100% - 12px)', width: '1px', background: 'rgba(255,255,255,0.07)' }} />}
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.68rem', fontWeight: 800, color: '#4285F4', letterSpacing: '0.05em' }}>{step.num}</div>
              <div style={{ paddingTop: '0.35rem', paddingBottom: i < arr.length - 1 ? '1.75rem' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{step.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                  {step.highlight
                    ? step.detail.split(step.highlight).map((part: string, j: number, a: string[]) => (
                        <span key={j}>{part}{j < a.length - 1 && <span style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '5px', padding: '1px 7px', color: '#93bbf9', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.83rem' }}>{step.highlight}</span>}</span>
                      ))
                    : step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar note */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94D96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Make changes to events — not "Make changes and manage sharing"</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', lineHeight: 1.5 }}>
            Select <strong style={{ color: 'rgba(255,255,255,0.75)' }}>"Make changes to events"</strong> from the dropdown. This gives us full read/write access to manage bookings without allowing us to share your calendar with others or change its settings.
          </div>
        </div>
      </div>

      {/* Final CTA for integrations */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Need help with any of these steps?</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem' }}>Email us and we can walk you through it on a quick call.</div>
        </div>
        <a href="mailto:hello@revcorehq.com?subject=Integration Access Help" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4285F4', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Get help via email
        </a>
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
  const [name, setName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { name: n } = JSON.parse(stored);
        if (n) setName(n);
      }
    } catch {}
    setChecked(true);
  }, []);

  const handleLogin = (n: string) => setName(n);
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setName(null);
  };

  if (!checked) return null;
  if (!name) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard name={name} onLogout={handleLogout} />;
}
