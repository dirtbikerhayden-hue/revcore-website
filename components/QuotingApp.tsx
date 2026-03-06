'use client';

import { useState, useEffect } from 'react';

type Tab = 'dashboard' | 'quote' | 'jobs' | 'followup';

const ACCENT = '#94D96B';
const BG = '#0b0e13';
const SURFACE = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.07)';

/* ─── Status bar ─────────────────────────────────────────────────────────── */
function StatusBar({ center }: { center: string }) {
  return (
    <div style={{ background: BG, padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.02em' }}>9:41</span>
      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{center}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5px' }}>
          {[4, 6, 8, 10].map((h, i) => (
            <div key={i} style={{ width: '2.5px', height: `${h}px`, borderRadius: '1px', background: i < 3 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        {/* WiFi */}
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
          <circle cx="6.5" cy="8.5" r="1.2" fill="rgba(255,255,255,0.65)" />
          <path d="M3.8 6.2C4.5 5.5 5.4 5.1 6.5 5.1s2 .4 2.7 1.1" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M1.5 3.9C2.8 2.6 4.5 1.8 6.5 1.8s3.7.8 5 2.1" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <div style={{ width: '19px', height: '9px', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '2.5px', padding: '1.5px' }}>
            <div style={{ width: '72%', height: '100%', background: ACCENT, borderRadius: '1px' }} />
          </div>
          <div style={{ width: '2px', height: '4px', background: 'rgba(255,255,255,0.28)', borderRadius: '0 1px 1px 0' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable atoms ─────────────────────────────────────────────────────── */
function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.54rem', fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30`, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.48rem', color, fontWeight: 800, letterSpacing: '0.02em' }}>
      {initials}
    </div>
  );
}

/* ─── Tab icons ──────────────────────────────────────────────────────────── */
function IconGrid({ active }: { active: boolean }) {
  const c = active ? ACCENT : 'rgba(255,255,255,0.28)';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill={c} />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 0.55 : 0.4} />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 0.55 : 0.4} />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill={c} />
    </svg>
  );
}
function IconPlus({ active }: { active: boolean }) {
  const c = active ? ACCENT : 'rgba(255,255,255,0.28)';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke={c} strokeWidth="1.4" />
      <path d="M7.5 4.5v6M4.5 7.5h6" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconList({ active }: { active: boolean }) {
  const c = active ? ACCENT : 'rgba(255,255,255,0.28)';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1.5 4h12M1.5 7.5h12M1.5 11h7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRefresh({ active }: { active: boolean }) {
  const c = active ? ACCENT : 'rgba(255,255,255,0.28)';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 7.5A5.5 5.5 0 112 7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 4.5v3h-3" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Views ──────────────────────────────────────────────────────────────── */
function Dashboard() {
  const stats = [
    { label: 'Revenue (Mo.)', value: '$89.3K', sub: '+12% vs last mo.', color: ACCENT },
    { label: 'Open Quotes', value: '12', sub: '3 expiring soon', color: '#FEB64A' },
    { label: 'Follow-Ups', value: '7', sub: '2 auto-sent today', color: '#6B8EFE' },
    { label: 'New Reviews', value: '9', sub: '4.9★ avg rating', color: '#4FC3F7' },
  ];
  const activity = [
    { name: 'Thompson quote viewed', time: '4 min ago', color: ACCENT, initials: 'TH' },
    { name: 'Auto follow-up → Garcia', time: '22 min ago', color: '#6B8EFE', initials: 'GA' },
    { name: 'Williams signed!', time: '1 hr ago', color: '#FEB64A', initials: 'WL' },
    { name: 'Review request → Davis', time: '2 hrs ago', color: '#4FC3F7', initials: 'DV' },
  ];
  return (
    <div style={{ padding: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20`, borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '0.54rem', color: `${s.color}80` }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '9px', fontWeight: 600 }}>Recent Activity</div>
      {activity.map((a) => (
        <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Avatar initials={a.initials} color={a.color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>{a.name}</div>
            <div style={{ fontSize: '0.54rem', color: 'rgba(255,255,255,0.25)', marginTop: '1px' }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewQuote() {
  const [items, setItems] = useState([
    { name: 'Roof Replacement (3,400 sqft)', price: 18200, qty: 1 },
    { name: 'Gutters & Fascia', price: 3800, qty: 1 },
    { name: 'Attic Insulation Package', price: 2400, qty: 1 },
  ]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const adj = (idx: number, d: number) => setItems((p) => p.map((it, i) => i === idx ? { ...it, qty: Math.max(0, it.qty + d) } : it));

  return (
    <div style={{ padding: '14px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.25)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Customer</div>
        <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Avatar initials="MT" color={ACCENT} />
          Mike Thompson — 4238 Oak Lane
        </div>
      </div>
      <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.25)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Line Items</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.72)', marginBottom: '2px', fontWeight: 500 }}>{item.name}</div>
            <div style={{ fontSize: '0.63rem', color: ACCENT, fontWeight: 700 }}>${item.price.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => adj(i, -1)} style={{ width: '21px', height: '21px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ color: 'white', fontSize: '0.7rem', minWidth: '14px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
            <button onClick={() => adj(i, 1)} style={{ width: '21px', height: '21px', borderRadius: '50%', background: `${ACCENT}22`, border: `1px solid ${ACCENT}50`, color: ACCENT, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: `${ACCENT}0d`, border: `1px solid ${ACCENT}22`, borderRadius: '10px', marginTop: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Total</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em' }}>${total.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', gap: '7px' }}>
        <button style={{ flex: 1, padding: '10px', borderRadius: '10px', background: ACCENT, border: 'none', color: '#0b0e13', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>Send Quote</button>
        <button style={{ padding: '10px 14px', borderRadius: '10px', background: SURFACE, border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );
}

function ActiveJobs() {
  const jobs = [
    { name: 'Thompson', addr: 'Oak Lane', value: '$24,400', status: 'Viewed', sc: '#FEB64A', initials: 'TH' },
    { name: 'Garcia', addr: 'Birchwood Dr', value: '$18,900', status: 'Signed', sc: ACCENT, initials: 'GA' },
    { name: 'Williams', addr: 'Maple Ave', value: '$31,200', status: 'Follow-up', sc: '#6B8EFE', initials: 'WL' },
    { name: 'Davis', addr: 'Pine Street', value: '$14,800', status: 'Quoted', sc: 'rgba(255,255,255,0.35)', initials: 'DV' },
    { name: 'Brown', addr: 'Elm Court', value: '$22,100', status: 'Sent', sc: '#4FC3F7', initials: 'BR' },
  ];
  return (
    <div style={{ padding: '14px' }}>
      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontWeight: 600 }}>5 Active Jobs</div>
      {jobs.map((j) => (
        <div
          key={j.name}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '5px', borderRadius: '12px', background: SURFACE, border: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = SURFACE; e.currentTarget.style.borderColor = BORDER; }}
        >
          <Avatar initials={j.initials} color={j.sc} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: '4px' }}>{j.name} — {j.addr}</div>
            <StatusPill label={j.status} color={j.sc} />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: ACCENT, letterSpacing: '-0.01em' }}>{j.value}</div>
        </div>
      ))}
    </div>
  );
}

function FollowUps() {
  const sequences = [
    { name: 'Thompson Quote', trigger: '24h after send', status: 'Scheduled', color: '#FEB64A', sent: 1, total: 4 },
    { name: 'Davis Quote', trigger: '72h after send', status: 'Running', color: '#6B8EFE', sent: 2, total: 4 },
    { name: 'Garcia — Review', trigger: 'After close', status: 'Sent', color: ACCENT, sent: 4, total: 4 },
    { name: 'Chen Quote', trigger: '24h after send', status: 'Paused', color: 'rgba(255,255,255,0.3)', sent: 0, total: 4 },
  ];
  return (
    <div style={{ padding: '14px' }}>
      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', fontWeight: 600 }}>Automation Sequences</div>
      {sequences.map((s) => (
        <div key={s.name} style={{ marginBottom: '8px', padding: '12px', background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{s.name}</div>
            <StatusPill label={s.status} color={s.color} />
          </div>
          <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.28)', marginBottom: '8px' }}>{s.trigger}</div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: s.total }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '100px', background: i < s.sent ? s.color : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />
            ))}
          </div>
          <div style={{ fontSize: '0.54rem', color: 'rgba(255,255,255,0.2)', marginTop: '5px' }}>{s.sent} of {s.total} touches sent</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
type TabCfg = { id: Tab; label: string; Icon: React.ComponentType<{ active: boolean }> };
const TABS: TabCfg[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconGrid },
  { id: 'quote', label: 'New Quote', Icon: IconPlus },
  { id: 'jobs', label: 'Jobs', Icon: IconList },
  { id: 'followup', label: 'Follow-Ups', Icon: IconRefresh },
];

export default function QuotingApp({ controlledTab }: { controlledTab?: Tab } = {}) {
  const [tab, setTab] = useState<Tab>(controlledTab ?? 'jobs');
  useEffect(() => { if (controlledTab) setTab(controlledTab); }, [controlledTab]);
  return (
    <div style={{ background: BG, fontFamily: '-apple-system, "DM Sans", sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar center="RevCore Quoting" />
      {/* Tab bar */}
      <div style={{ display: 'flex', background: BG, padding: '2px 6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '7px 4px 9px', border: 'none', cursor: 'pointer', background: 'transparent',
              color: tab === t.id ? ACCENT : 'rgba(255,255,255,0.28)',
              fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              borderBottom: `2px solid ${tab === t.id ? ACCENT : 'transparent'}`,
              marginBottom: '-1px', transition: 'all 0.15s',
            }}
          >
            <t.Icon active={tab === t.id} />
            <span style={{ fontSize: '0.5rem', fontWeight: tab === t.id ? 700 : 400, letterSpacing: '0.01em' }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'quote' && <NewQuote />}
        {tab === 'jobs' && <ActiveJobs />}
        {tab === 'followup' && <FollowUps />}
      </div>
    </div>
  );
}
