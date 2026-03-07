'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase';

const PASS  = 'revcore2024';
const STORE = 'rcTrackerV1';

type Tab       = 'overview' | 'clients' | 'team' | 'calendar' | 'settings';
type Stage     = 'onboarding' | 'balance-pending' | 'active' | 'at-risk' | 'paused' | 'churned';
type PlanT     = 'recurring' | 'one-time';
type InitCommT = 'pct' | 'fixed' | 'none';
type OngoingT  = 'pct-renewal' | 'rev-share' | 'none';
type CommFor   = 'closer' | 'setter' | 'both' | 'none';
type CommStat  = 'pending' | 'paid';
type PayStat   = 'current' | 'overdue' | 'failed';

interface Partner { id: string; name: string; role: 'setter' | 'closer' | 'both'; active?: boolean; }
interface Client {
  id: string; name: string; company: string; pkg: string;
  planT: PlanT; start: string; renewal: string; amount: number; nextDue: string;
  setterId: string; closerId: string;
  setterInitT: InitCommT; setterInitV: number;
  closerInitT: InitCommT; closerInitV: number;
  ongoingT: OngoingT; ongoingFor: CommFor; ongoingV: number;
  isSplit: boolean; deposit: number; bal: number; balNote: string;
  depPaid: boolean; balPaid: boolean;
  stage: Stage; payStat: PayStat; ghlId: string; notes: string; at: string;
  isUpsold?: boolean; origPkg?: string; origAmount?: number; upsoldAt?: string;
}
interface Commission {
  id: string; clientId: string; partnerId: string; role: 'setter' | 'closer';
  commT: 'initial' | 'renewal'; amount: number;
  due: string; paid: string; stat: CommStat; notes: string;
}
interface AppData { partners: Partner[]; clients: Client[]; comms: Commission[]; }

const PPA_MONTHLY = 2000; // estimated monthly revenue per PPA client
const monthlyVal = (c: Client) => c.pkg.toLowerCase().includes('ppa') ? PPA_MONTHLY : c.amount;

const uid   = () => Math.random().toString(36).slice(2, 10);
const fmtD  = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtM  = (n: number) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);

function calcInit(c: Client, role: 'setter' | 'closer'): number {
  const t = role === 'setter' ? c.setterInitT : c.closerInitT;
  const v = role === 'setter' ? c.setterInitV : c.closerInitV;
  if (t === 'none' || !v) return 0;
  return t === 'fixed' ? v : (c.amount * v) / 100;
}
function calcOngoing(c: Client): number {
  if (c.ongoingT === 'none' || !c.ongoingV) return 0;
  return (c.amount * c.ongoingV) / 100;
}
function getWeekStart(offset = 0): Date {
  const d = new Date(); d.setDate(d.getDate() - d.getDay() + offset * 7); d.setHours(0,0,0,0); return d;
}
function getBiweekly(start: string, wStart: Date, wEnd: Date): Date[] {
  if (!start) return [];
  const res: Date[] = [];
  const s = new Date(start + 'T00:00:00');
  let d = new Date(s); d.setDate(d.getDate() + 14);
  while (d <= wEnd) { if (d >= wStart) res.push(new Date(d)); d.setDate(d.getDate() + 14); }
  return res;
}
function genInitComms(c: Client): Commission[] {
  const out: Commission[] = [];
  if (c.setterInitT !== 'none' && c.setterId) {
    const amt = calcInit(c, 'setter');
    if (amt > 0) out.push({ id: uid(), clientId: c.id, partnerId: c.setterId, role: 'setter', commT: 'initial', amount: amt, due: c.start || today(), paid: '', stat: 'pending', notes: '' });
  }
  if (c.closerInitT !== 'none' && c.closerId) {
    const amt = calcInit(c, 'closer');
    if (amt > 0) out.push({ id: uid(), clientId: c.id, partnerId: c.closerId, role: 'closer', commT: 'initial', amount: amt, due: c.start || today(), paid: '', stat: 'pending', notes: '' });
  }
  return out;
}

const STAGES: Record<Stage, { label: string; color: string }> = {
  onboarding:        { label: 'Onboarding',     color: '#6B8EFE' },
  'balance-pending': { label: 'Balance Pending', color: '#26D9B0' },
  active:            { label: 'Active',          color: '#94D96B' },
  'at-risk':  { label: 'At Risk',    color: '#F59E0B' },
  paused:     { label: 'Paused',     color: 'rgba(255,255,255,0.35)' },
  churned:    { label: 'Churned',    color: '#FE6462' },
};
const PAY_STAT: Record<PayStat, { label: string; color: string }> = {
  current: { label: 'Current', color: '#94D96B' },
  overdue: { label: 'Overdue', color: '#F59E0B' },
  failed:  { label: 'Failed',  color: '#FE6462' },
};

// Defaults: setter 10%, closer 25%
const blankC = (): Omit<Client, 'id' | 'at'> => ({
  name: '', company: '', pkg: '', planT: 'recurring', start: '', renewal: '', amount: 0, nextDue: '',
  setterId: '', closerId: '',
  setterInitT: 'pct', setterInitV: 10,
  closerInitT: 'pct', closerInitV: 25,
  ongoingT: 'none', ongoingFor: 'none', ongoingV: 0,
  isSplit: false, deposit: 0, bal: 0, balNote: '', depPaid: false, balPaid: false,
  stage: 'onboarding', payStat: 'current', ghlId: '', notes: '',
  isUpsold: false, origPkg: '', origAmount: 0, upsoldAt: '',
});

// Deterministic star field
const STARS = (() => {
  const arr: { x: number; y: number; r: number; bg: string; dur: number; delay: number }[] = [];
  let s = 42317;
  const rng = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
  for (let i = 0; i < 90; i++) {
    const op = 0.2 + rng() * 0.7;
    arr.push({ x: rng() * 100, y: rng() * 100, r: 0.8 + rng() * 1.8, bg: `rgba(255,255,255,${op.toFixed(2)})`, dur: 2.5 + rng() * 4, delay: rng() * 6 });
  }
  return arr;
})();

// ─── Cosmic Background ────────────────────────────────────────────────────────
function CosmicBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {STARS.map((st, i) => (
        <div key={i} style={{ position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, width: `${st.r * 2}px`, height: `${st.r * 2}px`, borderRadius: '50%', background: st.bg, animation: `starPulse ${st.dur}s ease-in-out ${st.delay}s infinite` }} />
      ))}
      {/* Planet orbs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle at 38% 38%, rgba(254,100,98,0.14) 0%, rgba(254,100,98,0.04) 40%, transparent 70%)', filter: 'blur(1px)' }} />
      <div style={{ position: 'absolute', bottom: '-150px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle at 62% 62%, rgba(107,142,254,0.12) 0%, rgba(107,142,254,0.03) 40%, transparent 70%)', filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', top: '38%', left: '55%', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(148,217,107,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: '20%', left: '25%', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,120,255,0.07) 0%, transparent 70%)' }} />
      {/* Shooting stars */}
      <div style={{ position: 'absolute', top: '12%', left: '-60px', width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)', transform: 'rotate(-20deg)', animation: 'shootAcross 8s linear 1s infinite' }} />
      <div style={{ position: 'absolute', top: '45%', left: '-80px', width: '90px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(254,100,98,0.6), transparent)', transform: 'rotate(-15deg)', animation: 'shootAcross 12s linear 5s infinite' }} />
      <div style={{ position: 'absolute', top: '70%', left: '-50px', width: '70px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(107,142,254,0.5), transparent)', transform: 'rotate(-25deg)', animation: 'shootAcross 15s linear 9s infinite' }} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem', backdropFilter: 'blur(8px)' };
const glassCard: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(12px)' };
const inp: React.CSSProperties  = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.88rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };
const lbl: React.CSSProperties  = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.35rem' };
const badge = (color: string): React.CSSProperties => ({ display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, background: color + '22', color, border: `1px solid ${color}44` });
const btn = (variant: 'primary' | 'ghost' | 'danger' | 'success' = 'primary'): React.CSSProperties => ({
  border: 'none', borderRadius: '10px', padding: '0.55rem 1.1rem', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
  ...(variant === 'primary' ? { background: 'linear-gradient(135deg,#FE6462,#e84f4d)', color: '#fff', boxShadow: '0 4px 15px rgba(254,100,98,0.3)' } :
      variant === 'success' ? { background: 'linear-gradient(135deg,#94D96B,#7bc455)', color: '#fff', boxShadow: '0 4px 12px rgba(148,217,107,0.25)' } :
      variant === 'danger'  ? { background: 'rgba(254,100,98,0.12)', color: '#FE6462', border: '1px solid rgba(254,100,98,0.3)' } :
                              { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }),
});

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.65rem 0.85rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.07)' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 0.85rem', fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' };

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (pass !== PASS) { setErr('Incorrect password.'); return; }
    setLoading(true);
    setTimeout(() => { sessionStorage.setItem('rcTrackerAuth', '1'); onLogin(); }, 600);
  };
  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'DM Sans, sans-serif', paddingTop: 'calc(80px + 2rem)', position: 'relative', overflow: 'hidden' }}>
      <CosmicBg />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'trackerFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'linear-gradient(135deg,rgba(254,100,98,0.15),rgba(254,100,98,0.05))', border: '1px solid rgba(254,100,98,0.3)', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 0 40px rgba(254,100,98,0.15)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FE6462" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 0.4rem', lineHeight: 1.1 }}>RevCore<br />Financial Tracker</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: 0 }}>Internal use only · Authorized access required</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={submit}>
            <label style={lbl}>Access Password</label>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter password" required style={{ ...inp, paddingRight: '3rem' }}
                onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                {show ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                       : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
            {err && <div style={{ background: 'rgba(254,100,98,0.1)', border: '1px solid rgba(254,100,98,0.3)', borderRadius: '10px', padding: '0.65rem 1rem', color: '#FE6462', fontSize: '0.83rem', marginBottom: '1rem' }}>{err}</div>}
            <button type="submit" disabled={loading} style={{ ...btn('primary'), width: '100%', padding: '0.85rem', fontSize: '0.92rem' }}>
              {loading ? 'Authenticating…' : 'Access Tracker'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.73rem', marginTop: '1.25rem' }}>RevCore Internal Tools · Confidential</p>
      </div>
    </div>
  );
}

// ─── Client Modal ─────────────────────────────────────────────────────────────
function ClientModal({ client, partners, onSave, onClose }: { client?: Client; partners: Partner[]; onSave: (c: Omit<Client, 'id' | 'at'>, isNew: boolean) => void; onClose: () => void }) {
  const [f, setF] = useState<Omit<Client, 'id' | 'at'>>(client ? { ...client } : blankC());
  const set = (k: keyof typeof f, v: unknown) => setF(p => {
    const next = { ...p, [k]: v };
    // Auto-set nextDue to 1 month after start for recurring plans (new clients only)
    if (!client && (k === 'start' || k === 'planT')) {
      const start = k === 'start' ? v as string : p.start;
      const planT = k === 'planT' ? v as string : p.planT;
      if (start && planT === 'recurring') {
        const d = new Date(start + 'T00:00:00');
        d.setMonth(d.getMonth() + 1);
        next.nextDue = d.toISOString().slice(0, 10);
      }
    }
    return next;
  });
  const gr: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' };
  const section = (title: string) => <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '1.25rem', marginBottom: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>{title}</div>;
  const field = (label: string, node: React.ReactNode) => <div><label style={lbl}>{label}</label>{node}</div>;
  const sel = (val: string, onChange: (v: string) => void, options: [string, string][]) => (
    <select value={val} onChange={e => onChange(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const numInp = (val: number, onChange: (n: number) => void) => (
    <input type="number" value={val || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)} style={inp}
      onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
  );
  const txtInp = (val: string, onChange: (s: string) => void, placeholder = '') => (
    <input type="text" value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp}
      onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
  );
  const dateInp = (val: string, onChange: (s: string) => void) => (
    <input type="date" value={val} onChange={e => onChange(e.target.value)} style={inp}
      onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', overflowY: 'auto', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: '680px', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', marginTop: '80px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{client ? 'Edit Client' : 'Add New Client'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {section('Client Info')}
        <div style={gr}>
          {field('Client Name *', txtInp(f.name, v => set('name', v), 'John Smith'))}
          {field('Company', txtInp(f.company, v => set('company', v), 'Acme Inc.'))}
          {field('Package', txtInp(f.pkg, v => set('pkg', v), 'Growth Package'))}
          {field('GHL Contact ID', txtInp(f.ghlId, v => set('ghlId', v), 'GHL-XXXXXXXXX'))}
        </div>

        {section('Payment Details')}
        <div style={gr}>
          {field('Plan Type', sel(f.planT, v => set('planT', v as PlanT), [['recurring', 'Recurring'], ['one-time', 'One-Time']]))}
          {field('Payment Amount ($)', numInp(f.amount, v => set('amount', v)))}
          {field('Start Date *', dateInp(f.start, v => set('start', v)))}
          {f.planT === 'recurring' ? field('Renewal Date', dateInp(f.renewal, v => set('renewal', v))) : <div />}
          {field('Next Due Date', dateInp(f.nextDue, v => set('nextDue', v)))}
          {field('Payment Status', sel(f.payStat, v => set('payStat', v as PayStat), [['current', 'Current'], ['overdue', 'Overdue'], ['failed', 'Failed']]))}
        </div>

        {section('Split / Staged Payment')}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', fontWeight: 600 }}>
          <input type="checkbox" checked={f.isSplit} onChange={e => set('isSplit', e.target.checked)} style={{ accentColor: '#FE6462', width: '15px', height: '15px' }} />
          This deal has a split/staged payment
        </label>
        {f.isSplit && (
          <div style={gr}>
            {field('Deposit Amount ($)', numInp(f.deposit, v => set('deposit', v)))}
            {field('Balance Amount ($)', numInp(f.bal, v => set('bal', v)))}
            {field('Deposit Status', sel(f.depPaid ? 'paid' : 'pending', v => set('depPaid', v === 'paid'), [['pending', 'Pending'], ['paid', 'Paid']]))}
            {field('Balance Status', sel(f.balPaid ? 'paid' : 'pending', v => set('balPaid', v === 'paid'), [['pending', 'Pending'], ['paid', 'Paid']]))}
            <div style={{ gridColumn: '1/-1' }}>{field('When is balance due?', txtInp(f.balNote, v => set('balNote', v), 'e.g. After first 3 appointments'))}</div>
          </div>
        )}

        {section('Sales Team')}
        <div style={gr}>
          {field('Setter', sel(f.setterId, v => set('setterId', v), [['', '— None —'], ...partners.map(p => [p.id, p.name] as [string, string])]))}
          {field('Closer', sel(f.closerId, v => set('closerId', v), [['', '— None —'], ...partners.map(p => [p.id, p.name] as [string, string])]))}
        </div>

        {section('Initial Commission (Deal Close)')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.75rem' }}>
          <div><label style={lbl}>Setter — Type</label>{sel(f.setterInitT, v => set('setterInitT', v as InitCommT), [['none', 'None'], ['pct', 'Percentage (%)'], ['fixed', 'Fixed ($)']])}</div>
          <div><label style={lbl}>Setter — Value</label>{numInp(f.setterInitV, v => set('setterInitV', v))}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
            <div style={{ ...card, padding: '0.5rem 0.75rem', background: 'rgba(254,100,98,0.07)', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Setter earns</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FE6462' }}>{fmtM(calcInit({ ...f, id: '', at: '' }, 'setter'))}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
          <div><label style={lbl}>Closer — Type</label>{sel(f.closerInitT, v => set('closerInitT', v as InitCommT), [['none', 'None'], ['pct', 'Percentage (%)'], ['fixed', 'Fixed ($)']])}</div>
          <div><label style={lbl}>Closer — Value</label>{numInp(f.closerInitV, v => set('closerInitV', v))}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
            <div style={{ ...card, padding: '0.5rem 0.75rem', background: 'rgba(107,142,254,0.07)', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Closer earns</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6B8EFE' }}>{fmtM(calcInit({ ...f, id: '', at: '' }, 'closer'))}</div>
            </div>
          </div>
        </div>

        {section('Ongoing Commission (Renewals)')}
        <div style={gr}>
          {field('Commission Type', sel(f.ongoingT, v => set('ongoingT', v as OngoingT), [['none', 'None'], ['pct-renewal', '% of Renewal Payment'], ['rev-share', '% Revenue Share']]))}
          {field('Applies To', sel(f.ongoingFor, v => set('ongoingFor', v as CommFor), [['none', '— None —'], ['closer', 'Closer Only'], ['setter', 'Setter Only'], ['both', 'Both (split evenly']]))}
          {f.ongoingT !== 'none' && field('Percentage (%)', numInp(f.ongoingV, v => set('ongoingV', v)))}
          {f.ongoingT !== 'none' && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ ...card, padding: '0.5rem 0.75rem', background: 'rgba(148,217,107,0.07)', width: '100%' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Per cycle</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#94D96B' }}>{fmtM(calcOngoing({ ...f, id: '', at: '' }))}</div>
              </div>
            </div>
          )}
        </div>

        {section('Upsell Tracking')}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', fontWeight: 600 }}>
          <input type="checkbox" checked={f.isUpsold || false} onChange={e => set('isUpsold', e.target.checked)} style={{ accentColor: '#B47AFF', width: '15px', height: '15px' }} />
          This client was upsold to a new package
        </label>
        {f.isUpsold && (
          <div style={gr}>
            {field('Original Package', txtInp(f.origPkg || '', v => set('origPkg', v), 'e.g. 15 Appointments'))}
            {field('Original Amount ($)', numInp(f.origAmount || 0, v => set('origAmount', v)))}
            {field('Upsell Date', dateInp(f.upsoldAt || '', v => set('upsoldAt', v)))}
            <div />
          </div>
        )}

        {section('Status & Notes')}
        <div style={gr}>
          {field('Pipeline Stage', sel(f.stage, v => set('stage', v as Stage), [['onboarding','Onboarding'],['balance-pending','Balance Pending'],['active','Active'],['at-risk','At Risk'],['paused','Paused'],['churned','Churned']]))}
          <div />
        </div>
        <div style={{ marginTop: '0.75rem' }}>{field('Notes', <textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any relevant notes…" style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />)}</div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose} style={btn('ghost')}>Cancel</button>
          <button onClick={() => { if (!f.name.trim() || !f.start) return; onSave(f, !client); }} disabled={!f.name.trim() || !f.start} style={{ ...btn('primary'), opacity: (!f.name.trim() || !f.start) ? 0.4 : 1, cursor: (!f.name.trim() || !f.start) ? 'not-allowed' : 'pointer' }}>{client ? 'Save Changes' : 'Add Client'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
/* ─── Drill Panel ─────────────────────────────────────────────────────────── */
function DrillPanel({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#070b0f', zIndex: 900, animation: 'drillFadeIn 0.2s ease both' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(580px,100vw)', background: '#0b0f16', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 901, display: 'flex', flexDirection: 'column', animation: 'drillSlideIn 0.38s cubic-bezier(0.16,1,0.3,1) both', boxShadow: '-24px 0 80px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0 }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '34px', height: '34px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>{children}</div>
      </div>
    </>
  );
}

/* ─── Client drill card ───────────────────────────────────────────────────── */
function ClientDrillCard({ client, partners, comms }: { client: Client; partners: Partner[]; comms: Commission[] }) {
  const [hov, setHov] = useState(false);
  const setter = partners.find(p => p.id === client.setterId);
  const closer = partners.find(p => p.id === client.closerId);
  const pendingComm = comms.filter(c => c.clientId === client.id && c.stat === 'pending').reduce((s, c) => s + c.amount, 0);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hov ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '1rem 1.1rem', marginBottom: '0.7rem', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.3)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', letterSpacing: '-0.01em' }}>{client.company || client.name}</div>
          {client.company && <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', marginTop: '1px' }}>{client.name}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={badge(STAGES[client.stage].color)}>{STAGES[client.stage].label}</span>
          <span style={{ color: '#94D96B', fontWeight: 800, fontSize: '0.92rem' }}>{fmtM(client.amount)}{client.planT === 'recurring' && <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/mo</span>}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.25rem', fontSize: '0.74rem', color: 'rgba(255,255,255,0.38)' }}>
        {client.pkg && <span>{client.pkg}</span>}
        {setter && <span>Setter: <b style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{setter.name}</b></span>}
        {closer && <span>Closer: <b style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{closer.name}</b></span>}
        {client.start && <span>Started: <b style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{fmtD(client.start)}</b></span>}
        {pendingComm > 0 && <span style={{ color: '#F59E0B', fontWeight: 600 }}>Comm owed: {fmtM(pendingComm)}</span>}
      </div>
      {(!client.depPaid || (!client.balPaid && client.bal > 0)) && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '0.55rem', flexWrap: 'wrap' }}>
          {!client.depPaid && <span style={{ ...badge('#F59E0B'), fontSize: '0.67rem' }}>Deposit pending</span>}
          {client.depPaid && !client.balPaid && client.bal > 0 && <span style={{ ...badge('#6B8EFE'), fontSize: '0.67rem' }}>Balance {fmtM(client.bal)}{client.balNote ? ` — ${client.balNote}` : ''}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Pipeline stage row ─────────────────────────────────────────────────── */
function StageRow({ stage, count, stageClients, totalClients, partners, comms, onDrill }:
  { stage: Stage; count: number; stageClients: Client[]; totalClients: number; partners: Partner[]; comms: Commission[]; onDrill: (title: string, subtitle: string, content: React.ReactNode) => void }) {
  const [hov, setHov] = useState(false);
  const pct = totalClients > 0 ? (count / totalClients) * 100 : 0;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => count > 0 && onDrill(STAGES[stage].label, `${count} client${count !== 1 ? 's' : ''} in this stage`, <>{[...stageClients].sort((a,b) => b.amount - a.amount).map(c => <ClientDrillCard key={c.id} client={c} partners={partners} comms={comms} />)}</>)}
      style={{ padding: '0.6rem 0.75rem', borderRadius: '10px', background: hov && count > 0 ? 'rgba(255,255,255,0.05)' : 'transparent', cursor: count > 0 ? 'pointer' : 'default', transition: 'background 0.2s', marginLeft: '-0.75rem', marginRight: '-0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: hov && count > 0 ? '#fff' : 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>{STAGES[stage].label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: STAGES[stage].color }}>{count}</span>
          {count > 0 && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', opacity: hov ? 1 : 0, transition: 'opacity 0.2s' }}>↗</span>}
        </div>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: STAGES[stage].color, borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 8px ${STAGES[stage].color}66` }} />
      </div>
    </div>
  );
}

/* ─── Commission breakdown row ───────────────────────────────────────────── */
function CommRow({ label, pending, paid, color, pendingComms, paidComms, commDrill, onDrill }:
  { label: string; pending: number; paid: number; color: string; pendingComms: Commission[]; paidComms: Commission[]; commDrill: (comms: Commission[], role: string) => React.ReactNode; onDrill: (title: string, subtitle: string, content: React.ReactNode) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onDrill(`${label} Commissions`, `${pendingComms.length} pending · ${fmtM(pending)} owed`, commDrill([...pendingComms, ...paidComms], label.toLowerCase().slice(0, -1)))}
      style={{ background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', transform: hov ? 'translateY(-2px)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700, color, fontSize: '0.88rem' }}>{label}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={badge(pending > 0 ? '#F59E0B' : '#94D96B')}>{pendingComms.length} pending</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', opacity: hov ? 1 : 0, transition: 'opacity 0.2s' }}>↗</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: '2px' }}>PENDING</div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>{fmtM(pending)}</div></div>
        <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: '2px' }}>PAID OUT</div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#94D96B' }}>{fmtM(paid)}</div></div>
      </div>
    </div>
  );
}

/* ─── Recent client table row ─────────────────────────────────────────────── */
function RecentClientRow({ c, pName, partners, comms, onDrill }:
  { c: Client; pName: (id: string) => string; partners: Partner[]; comms: Commission[]; onDrill: (title: string, subtitle: string, content: React.ReactNode) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onDrill(c.company || c.name, `${c.pkg || 'No package'} · ${STAGES[c.stage].label}`, <ClientDrillCard client={c} partners={partners} comms={comms} />)}
      style={{ background: hov ? 'rgba(255,255,255,0.04)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}>
      <td style={tdStyle}><div style={{ fontWeight: 700, color: '#fff' }}>{c.name}</div>{c.company && <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{c.company}</div>}</td>
      <td style={tdStyle}>{c.pkg || '—'}</td>
      <td style={tdStyle}><span style={{ color: '#94D96B', fontWeight: 700 }}>{fmtM(c.amount)}</span>{c.planT === 'recurring' && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>/mo</span>}</td>
      <td style={tdStyle}><span style={badge(STAGES[c.stage].color)}>{STAGES[c.stage].label}</span></td>
      <td style={tdStyle}>{pName(c.setterId)}</td>
      <td style={tdStyle}>{pName(c.closerId)}</td>
    </tr>
  );
}

/* ─── All Clients drill (stage filter tabs + cards) ─────────────────────── */
function AllClientsDrill({ data }: { data: AppData }) {
  const [stageF, setStageF] = useState<Stage | 'all'>('all');
  const stages = Object.keys(STAGES) as Stage[];
  const shown = (stageF === 'all' ? [...data.clients] : data.clients.filter(c => c.stage === stageF))
    .sort((a, b) => b.amount - a.amount);
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
        <button onClick={() => setStageF('all')} style={{ border: 'none', borderRadius: '100px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: stageF === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', color: stageF === 'all' ? '#fff' : 'rgba(255,255,255,0.5)' }}>
          All ({data.clients.length})
        </button>
        {stages.map(s => {
          const count = data.clients.filter(c => c.stage === s).length;
          if (count === 0) return null;
          return (
            <button key={s} onClick={() => setStageF(s)} style={{ border: `1px solid ${stageF === s ? STAGES[s].color + '88' : 'transparent'}`, borderRadius: '100px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: stageF === s ? STAGES[s].color + '22' : 'rgba(255,255,255,0.06)', color: stageF === s ? STAGES[s].color : 'rgba(255,255,255,0.5)' }}>
              {STAGES[s].label} ({count})
            </button>
          );
        })}
      </div>
      {shown.length === 0
        ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No clients in this stage.</p>
        : shown.map(c => <ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms} />)
      }
    </div>
  );
}

/* ─── KPI card (top-level so React doesn't remount on parent re-renders) ─── */
function KpiCard({ label, value, sub, color, delay, onClick }: { label: string; value: string; sub?: string; color: string; delay: number; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ ...glassCard, borderTop: `3px solid ${color}`, animation: `cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both`, cursor: onClick ? 'pointer' : 'default', transform: hov && onClick ? 'translateY(-5px)' : 'none', boxShadow: hov && onClick ? `0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px ${color}28` : 'none', background: hov && onClick ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.03)', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s, background 0.25s' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        {label}
        {onClick && <span style={{ opacity: hov ? 0.7 : 0.2, transition: 'opacity 0.2s', fontSize: '0.9rem' }}>↗</span>}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>{sub}</div>}
    </div>
  );
}

/* ─── Revenue & Growth Chart ─────────────────────────────────────────────── */
function RevenueChart({ data }: { data: AppData }) {
  const [hovIdx, setHovIdx]     = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const revPathRef = useRef<SVGPathElement>(null);
  const cliPathRef = useRef<SVGPathElement>(null);
  const [revLen, setRevLen] = useState(1000);
  const [cliLen, setCliLen] = useState(1000);

  // Last 12 months
  const pts = useMemo(() => {
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }
    const currentMonth = today().slice(0, 7);
    return months.map(m => {
      // Use start date (actual service start) for historical accuracy.
      // Historical months include churned clients; current month excludes them.
      const active = data.clients.filter(c => {
        const d = c.start || c.at;
        if (!d || d.slice(0, 7) > m) return false;
        if (m >= currentMonth) return c.stage !== 'churned' && c.stage !== 'paused';
        return true;
      });
      const newC = data.clients.filter(c => (c.start || c.at)?.startsWith(m));
      return {
        label:      new Date(m + '-15').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        revenue:    active.reduce((s, c) => s + monthlyVal(c), 0),
        clients:    active.length,
        newClients: newC.length,
      };
    });
  }, [data.clients]);

  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed(true);
      if (revPathRef.current) setRevLen(revPathRef.current.getTotalLength());
      if (cliPathRef.current) setCliLen(cliPathRef.current.getTotalLength());
    }, 80);
    return () => clearTimeout(t);
  }, [pts]);

  const W = 900, H = 220, PL = 60, PR = 20, PT = 16, PB = 36;
  const iW = W - PL - PR, iH = H - PT - PB;

  const maxRev = Math.max(...pts.map(p => p.revenue), 1);
  const maxCli = Math.max(...pts.map(p => p.clients), 1);
  const x  = (i: number) => PL + (i / (pts.length - 1)) * iW;
  const yR = (v: number) => PT + iH - (v / maxRev) * iH;
  const yC = (v: number) => PT + iH - (v / maxCli) * iH;

  const smooth = (points: [number, number][]) => {
    if (points.length < 2) return `M${points[0]?.[0] ?? 0} ${points[0]?.[1] ?? 0}`;
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i-1][0] + points[i][0]) / 2;
      d += ` C ${cx} ${points[i-1][1]}, ${cx} ${points[i][1]}, ${points[i][0]} ${points[i][1]}`;
    }
    return d;
  };

  const revPts: [number,number][] = pts.map((p,i) => [x(i), yR(p.revenue)]);
  const cliPts: [number,number][] = pts.map((p,i) => [x(i), yC(p.clients)]);
  const revPath  = smooth(revPts);
  const cliPath  = smooth(cliPts);
  const revArea  = revPath  + ` L ${x(pts.length-1)} ${PT+iH} L ${x(0)} ${PT+iH} Z`;
  const cliArea  = cliPath  + ` L ${x(pts.length-1)} ${PT+iH} L ${x(0)} ${PT+iH} Z`;
  const fmtK = (v: number) => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`;

  const tip = hovIdx !== null ? pts[hovIdx] : null;
  const tipX = hovIdx !== null ? (x(hovIdx) / W) * 100 : 0;
  const tipLeft = hovIdx !== null && hovIdx > pts.length * 0.65;

  return (
    <div style={{ ...glassCard, marginBottom: '1.25rem', animation: 'cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Revenue & Growth</div>
          <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Cumulative MRR vs active clients · last 12 months</div>
        </div>
        <div style={{ display: 'flex', gap: '1.1rem', fontSize: '0.73rem' }}>
          {[['#94D96B','#26D9B0','MRR'],['#6B8EFE','#B47AFF','Clients']].map(([c1,c2,label]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.45)' }}>
              <span style={{ width: '22px', height: '2.5px', background: `linear-gradient(to right,${c1},${c2})`, display: 'inline-block', borderRadius: '2px', boxShadow: `0 0 6px ${c1}88` }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }} onMouseLeave={() => setHovIdx(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="rcRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#94D96B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#94D96B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rcCliGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6B8EFE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6B8EFE" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rcRevLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94D96B" /><stop offset="100%" stopColor="#26D9B0" />
            </linearGradient>
            <linearGradient id="rcCliLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6B8EFE" /><stop offset="100%" stopColor="#B47AFF" />
            </linearGradient>
            <filter id="glowGreen"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowBlue"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map(t => (
            <g key={t}>
              <line x1={PL} y1={PT + iH*(1-t)} x2={PL+iW} y2={PT + iH*(1-t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={PL-6} y={PT + iH*(1-t) + 4} textAnchor="end" style={{ fontSize: '9px', fill: 'rgba(255,255,255,0.22)', fontFamily: 'DM Sans,sans-serif' }}>{fmtK(maxRev*t)}</text>
            </g>
          ))}

          {/* Area fills (fade in) */}
          <path d={revArea} fill="url(#rcRevGrad)" style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1.2s ease 0.6s' }} />
          <path d={cliArea} fill="url(#rcCliGrad)" style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1.2s ease 0.8s' }} />

          {/* Lines (stroke-dashoffset reveal) */}
          <path ref={revPathRef} d={revPath} fill="none" stroke="url(#rcRevLine)" strokeWidth="2.5" strokeLinecap="round"
            filter="url(#glowGreen)"
            strokeDasharray={revLen} strokeDashoffset={revealed ? 0 : revLen}
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1) 0.1s' }} />
          <path ref={cliPathRef} d={cliPath} fill="none" stroke="url(#rcCliLine)" strokeWidth="2" strokeLinecap="round"
            filter="url(#glowBlue)"
            strokeDasharray={cliLen} strokeDashoffset={revealed ? 0 : cliLen}
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1) 0.35s' }} />

          {/* Hover vertical line + dots */}
          {hovIdx !== null && (
            <>
              <line x1={x(hovIdx)} y1={PT} x2={x(hovIdx)} y2={PT+iH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3" />
              <circle cx={x(hovIdx)} cy={yR(pts[hovIdx].revenue)} r="5" fill="#94D96B" stroke="#070b0f" strokeWidth="2.5" filter="url(#glowGreen)" />
              <circle cx={x(hovIdx)} cy={yC(pts[hovIdx].clients)} r="4.5" fill="#6B8EFE" stroke="#070b0f" strokeWidth="2.5" filter="url(#glowBlue)" />
            </>
          )}

          {/* Invisible hover zones */}
          {pts.map((_, i) => (
            <rect key={i} x={x(i) - iW/(pts.length*2)} y={PT} width={iW/pts.length} height={iH}
              fill="transparent" onMouseEnter={() => setHovIdx(i)} style={{ cursor: 'crosshair' }} />
          ))}

          {/* X axis labels */}
          {pts.map((p, i) => (
            <text key={i} x={x(i)} y={H-6} textAnchor="middle"
              style={{ fontSize: '9px', fill: hovIdx===i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)', fontFamily: 'DM Sans,sans-serif', transition: 'fill 0.15s', fontWeight: hovIdx===i ? '700' : '400' }}>
              {p.label}
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {tip && (
          <div style={{ position: 'absolute', top: '8px', left: tipLeft ? 'auto' : `calc(${tipX}% + 14px)`, right: tipLeft ? `calc(${100-tipX}% + 14px)` : 'auto', background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '12px', padding: '0.6rem 0.9rem', pointerEvents: 'none', zIndex: 10, minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tip.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>MRR</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#94D96B' }}>{fmtM(tip.revenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tip.newClients > 0 ? '3px' : 0 }}>
              <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>Clients</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6B8EFE' }}>{tip.clients}</span>
            </div>
            {tip.newClients > 0 && (
              <div style={{ fontSize: '0.7rem', color: '#26D9B0', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>+{tip.newClients} new this month</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Overview tab ────────────────────────────────────────────────────────── */
function OverviewTab({ data }: { data: AppData }) {
  const [drill, setDrill] = useState<{ title: string; subtitle: string; content: React.ReactNode } | null>(null);

  // Retainer MRR: only true recurring clients that are active (exclude at-risk / paused / churned)
  const retainerClients = data.clients.filter(c => c.planT === 'recurring' && !c.pkg.toLowerCase().includes('ppa') && c.stage !== 'churned' && c.stage !== 'at-risk' && c.stage !== 'paused');
  const retainerMRR   = retainerClients.reduce((s, c) => s + c.amount, 0);
  // PPA clients: estimated at $2,000/mo each
  const ppaActive     = data.clients.filter(c => c.pkg.toLowerCase().includes('ppa') && c.stage !== 'churned' && c.stage !== 'paused');
  const ppaMonthly    = ppaActive.length * PPA_MONTHLY;
  // Total Monthly Revenue: every non-churned, non-paused client — PPA @ $2k, appt packages treated as monthly
  const totalMonthlyClients = data.clients.filter(c => c.stage !== 'churned' && c.stage !== 'paused');
  const totalMonthly  = totalMonthlyClients.reduce((s, c) => s + monthlyVal(c), 0);
  const activeClients  = data.clients.filter(c => c.stage === 'active');
  const atRiskClients  = data.clients.filter(c => c.stage === 'at-risk');
  const lastMonthStr   = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();
  const lastMonthRev   = data.clients.filter(c => { const d = c.start || c.at; return d && d.slice(0, 7) <= lastMonthStr; }).reduce((s, c) => s + monthlyVal(c), 0);
  const momGrowthPct   = lastMonthRev > 0 ? ((totalMonthly - lastMonthRev) / lastMonthRev) * 100 : null;
  const projectedARR   = totalMonthly * 12;


  const stageCounts   = (Object.keys(STAGES) as Stage[]).map(s => ({ stage: s, count: data.clients.filter(c => c.stage === s).length, clients: data.clients.filter(c => c.stage === s) }));
  const recentClients = [...data.clients].sort((a, b) => (b.start || b.at).localeCompare(a.start || a.at)).slice(0, 8);
  const pName = (id: string) => data.partners.find(p => p.id === id)?.name || '—';

  const thisMonth        = today().slice(0, 7);
  const newThisMonth     = data.clients.filter(c => c.start && c.start.startsWith(thisMonth));
  const newMonthRevenue  = newThisMonth.reduce((s, c) => s + monthlyVal(c), 0);
  const cashOutstanding  = data.clients.reduce((s, c) =>
    s + (!c.depPaid ? c.deposit : 0) + (!c.balPaid && c.bal > 0 ? c.bal : 0), 0);
  const avgValue         = data.clients.filter(c => c.stage !== 'churned').length > 0
    ? data.clients.filter(c => c.stage !== 'churned').reduce((s, c) => s + c.amount, 0) / data.clients.filter(c => c.stage !== 'churned').length
    : 0;

  return (
    <div>
      {drill && (
        <DrillPanel title={drill.title} subtitle={drill.subtitle} onClose={() => setDrill(null)}>
          {drill.content}
        </DrillPanel>
      )}

      <div style={{ marginBottom: '2rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem', letterSpacing: '-0.03em' }}>Agency Overview</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: 0 }}>Click any metric to drill in</p>
      </div>

      {/* Row 1 — Revenue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <KpiCard label="Retainer MRR" value={fmtM(retainerMRR)} sub={`${retainerClients.length} retainer${retainerClients.length !== 1 ? 's' : ''}${ppaActive.length > 0 ? ` · ${ppaActive.length} PPA @ $2k/mo` : ''}`} color="#94D96B" delay={0}
          onClick={() => setDrill({ title: 'Retainer MRR', subtitle: `${retainerClients.length} active recurring clients`, content: <>{retainerClients.sort((a,b) => b.amount - a.amount).map(c => <ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms} />)}</> })} />
        <KpiCard label="Total Monthly Revenue" value={fmtM(totalMonthly)} sub={`${totalMonthlyClients.length} clients · ${fmtM(retainerMRR)} retainer · ${fmtM(ppaMonthly)} PPA`} color="#6B8EFE" delay={0.06}
          onClick={() => setDrill({ title: 'Total Monthly Revenue', subtitle: `${fmtM(totalMonthly)}/mo across all active clients`, content: <>{[...totalMonthlyClients].sort((a,b) => monthlyVal(b)-monthlyVal(a)).map(c => <ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms} />)}</> })} />
        <KpiCard label="Avg Client Value" value={fmtM(avgValue)} sub={`${data.clients.filter(c=>c.stage!=='churned').length} active clients`} color="#B47AFF" delay={0.12}
          onClick={() => setDrill({ title: 'All Active Clients by Value', subtitle: 'Sorted by monthly value', content: <>{[...data.clients].filter(c=>c.stage!=='churned').sort((a,b)=>monthlyVal(b)-monthlyVal(a)).map(c=><ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms}/>)}</> })} />
        <KpiCard label="Projected Annual Revenue" value={fmtM(projectedARR)} sub={`${fmtM(totalMonthly)}/mo × 12`} color="#F59E0B" delay={0.18}
          onClick={() => setDrill({ title: 'Projected Annual Revenue', subtitle: `Based on current monthly revenue run rate`, content: <>{[...totalMonthlyClients].sort((a,b) => monthlyVal(b)-monthlyVal(a)).map(c => <ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms} />)}</> })} />
      </div>

      {/* Row 2 — Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard label="New Clients This Month" value={String(newThisMonth.length)} sub={newThisMonth.length > 0 ? `${fmtM(newMonthRevenue)} added · ${new Date().toLocaleString('en-US',{month:'long'})}` : `No new clients in ${new Date().toLocaleString('en-US',{month:'long'})}`} color="#26D9B0" delay={0.22}
          onClick={() => setDrill({ title: 'New Clients This Month', subtitle: `${newThisMonth.length} signed in ${new Date().toLocaleString('en-US',{month:'long',year:'numeric'})}`, content: newThisMonth.length === 0 ? <p style={{color:'rgba(255,255,255,0.4)'}}>No new clients this month.</p> : <>{[...newThisMonth].sort((a,b) => monthlyVal(b)-monthlyVal(a)).map(c => <ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms} />)}</> })} />
        <KpiCard label="Cash Outstanding" value={fmtM(cashOutstanding)} sub="Unpaid deposits & balances" color={cashOutstanding > 0 ? '#F59E0B' : '#94D96B'} delay={0.28}
          onClick={() => setDrill({ title: 'Cash Outstanding', subtitle: 'Clients with unpaid deposits or balances', content: <>{data.clients.filter(c=>!c.depPaid||(!c.balPaid&&c.bal>0)).map(c=><ClientDrillCard key={c.id} client={c} partners={data.partners} comms={data.comms}/>)}</> })} />
        <KpiCard label="MoM Revenue Growth" value={momGrowthPct === null ? '—' : `${momGrowthPct >= 0 ? '+' : ''}${momGrowthPct.toFixed(1)}%`} sub={lastMonthRev > 0 ? `${fmtM(lastMonthRev)} last mo → ${fmtM(totalMonthly)} this mo` : 'No prior month data'} color={momGrowthPct === null ? '#6B8EFE' : momGrowthPct >= 0 ? '#94D96B' : '#FE6462'} delay={0.34} />
        <KpiCard label="All Clients" value={String(data.clients.filter(c=>c.stage!=='churned').length)} sub={`${activeClients.length} active · ${atRiskClients.length} at risk`} color="#94D96B" delay={0.40}
          onClick={() => setDrill({ title: 'All Clients', subtitle: `${data.clients.length} total across all stages`, content: <AllClientsDrill data={data} /> })} />
      </div>

      {/* Chart */}
      <RevenueChart data={data} />

      {/* Pipeline breakdown + Recent Clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ ...glassCard, animation: 'cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) 0.44s both' }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Pipeline <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>· click to drill in</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stageCounts.map(({ stage, count, clients: stageClients }) => (
              <StageRow key={stage} stage={stage} count={count} stageClients={stageClients} totalClients={data.clients.length} partners={data.partners} comms={data.comms}
                onDrill={(title, subtitle, content) => setDrill({ title, subtitle, content })} />
            ))}
          </div>
        </div>

        <div style={{ ...glassCard, animation: 'cardReveal 0.5s cubic-bezier(0.16,1,0.3,1) 0.48s both' }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Recent Clients</div>
          {recentClients.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No clients added yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Client', 'Package', 'Amount', 'Stage', 'Setter', 'Closer'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {recentClients.map(c => (
                    <RecentClientRow key={c.id} c={c} pName={pName} partners={data.partners} comms={data.comms}
                      onDrill={(title, subtitle, content) => setDrill({ title, subtitle, content })} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PipeCard({ c, color, partnerName, onEdit, PAY_STAT: PS }: { c: Client; color: string; partnerName: (id: string) => string; onEdit: (c: Client) => void; PAY_STAT: Record<PayStat, { label: string; color: string }> }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onEdit(c)}
      style={{ background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hov ? color + '55' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '0.85rem', cursor: 'pointer', transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.35)' : 'none' }}>
      <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#fff', marginBottom: '2px', lineHeight: 1.2 }}>{c.company || c.name}</div>
      {c.company && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{c.name}</div>}
      <div style={{ fontSize: '0.82rem', fontWeight: 800, color, marginBottom: '6px' }}>{fmtM(c.amount)}{c.planT === 'recurring' && <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/mo</span>}</div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {c.payStat !== 'current' && <span style={badge(PS[c.payStat].color)}>{PS[c.payStat].label}</span>}
        {!c.depPaid && <span style={badge('#F59E0B')}>Dep. Pending</span>}
        {c.depPaid && !c.balPaid && c.bal > 0 && <span style={badge('#26D9B0')}>Bal. {fmtM(c.bal)}</span>}
        {c.isUpsold && <span style={badge('#B47AFF')}>↑ Upsell</span>}
      </div>
      {(c.setterId || c.closerId) && (
        <div style={{ marginTop: '6px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          {c.setterId && <span>Set: {partnerName(c.setterId)}</span>}
          {c.setterId && c.closerId && <span style={{ margin: '0 4px' }}>·</span>}
          {c.closerId && <span>Close: {partnerName(c.closerId)}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
function ClientsTab({ data, setData, partners }: { data: AppData; setData: (d: AppData) => void; partners: Partner[] }) {
  const [search, setSearch] = useState('');
  const [stageF, setStageF] = useState<Stage | 'all'>('all');
  const [partnerF, setPartnerF] = useState('all');
  const [modal, setModal] = useState<'add' | Client | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const filtered = useMemo(() => data.clients.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q) && !c.pkg.toLowerCase().includes(q)) return false;
    if (stageF !== 'all' && c.stage !== stageF) return false;
    if (partnerF !== 'all' && c.setterId !== partnerF && c.closerId !== partnerF) return false;
    return true;
  }), [data.clients, search, stageF, partnerF]);

  const partnerName = (id: string) => partners.find(p => p.id === id)?.name || '—';

  const saveClient = (f: Omit<Client, 'id' | 'at'>, isNew: boolean) => {
    if (isNew) {
      const newC: Client = { ...f, id: uid(), at: today() };
      const newComms = genInitComms(newC);
      setData({ ...data, clients: [...data.clients, newC], comms: [...data.comms, ...newComms] });
    } else {
      setData({ ...data, clients: data.clients.map(c => c.id === (modal as Client).id ? { ...f, id: c.id, at: c.at } : c) });
    }
    setModal(null);
  };

  const deleteClient = (id: string) => {
    setData({ ...data, clients: data.clients.filter(c => c.id !== id), comms: data.comms.filter(c => c.clientId !== id) });
    setDelId(null);
  };

  const togglePayStatus = (c: Client, stat: PayStat) => {
    setData({ ...data, clients: data.clients.map(x => x.id === c.id ? { ...x, payStat: stat } : x) });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.03em' }}>Clients</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>{data.clients.length} closed client{data.clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px' }}>
            {(['pipeline', 'table'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: view === v ? 'rgba(255,255,255,0.12)' : 'transparent', color: view === v ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
                {v === 'pipeline' ? '⬛ Pipeline' : '☰ Table'}
              </button>
            ))}
          </div>
          <button onClick={() => setModal('add')} style={btn('primary')}>+ Add Client</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total MRR', value: fmtM(data.clients.filter(c => c.planT === 'recurring').reduce((s, c) => s + c.amount, 0)), color: '#94D96B' },
          { label: 'Active Clients', value: data.clients.filter(c => c.stage === 'active').length, color: '#94D96B' },
          { label: 'At Risk', value: data.clients.filter(c => c.stage === 'at-risk').length, color: '#F59E0B' },
          { label: 'Upsells', value: data.clients.filter(c => c.isUpsold).length, color: '#B47AFF' },
        ].map(({ label, value, color }, i) => (
          <div key={label} style={{ ...glassCard, borderLeft: `3px solid ${color}`, padding: '1rem 1.25rem', animation: `cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both` }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ ...inp, width: '220px' }} />
        {view === 'table' && (
          <select value={stageF} onChange={e => setStageF(e.target.value as Stage | 'all')} style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
            <option value="all">All Stages</option>
            {(Object.keys(STAGES) as Stage[]).map(s => <option key={s} value={s}>{STAGES[s].label}</option>)}
          </select>
        )}
        <select value={partnerF} onChange={e => setPartnerF(e.target.value)} style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Team Members</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {view === 'pipeline' ? (
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', minWidth: 'max-content' }}>
            {(Object.keys(STAGES) as Stage[]).map(stage => {
              const stageClients = data.clients.filter(c => {
                if (c.stage !== stage) return false;
                const q = search.toLowerCase();
                if (q && !c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q) && !c.pkg.toLowerCase().includes(q)) return false;
                if (partnerF !== 'all' && c.setterId !== partnerF && c.closerId !== partnerF) return false;
                return true;
              });
              const { label, color } = STAGES[stage];
              const colValue = stageClients.reduce((s, c) => s + c.amount, 0);
              const isDragTarget = dragOverStage === stage;
              return (
                <div key={stage} style={{ width: '240px', flexShrink: 0 }}
                  onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStage(null); }}
                  onDrop={e => {
                    e.preventDefault();
                    if (dragId) setData({ ...data, clients: data.clients.map(cl => cl.id === dragId ? { ...cl, stage } : cl) });
                    setDragId(null); setDragOverStage(null);
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', padding: '0 2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{stageClients.length}</span>
                  </div>
                  {colValue > 0 && <div style={{ fontSize: '0.72rem', color, fontWeight: 700, marginBottom: '0.7rem', padding: '0 2px' }}>{fmtM(colValue)}{stageClients.some(c => c.planT === 'recurring') ? '/mo' : ''}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: '60px', borderRadius: '12px', border: `1.5px dashed ${isDragTarget ? color : 'transparent'}`, padding: isDragTarget ? '6px' : '0', transition: 'all 0.15s', background: isDragTarget ? `${color}0d` : 'transparent' }}>
                    {stageClients.length === 0 ? (
                      <div style={{ border: `1px dashed ${isDragTarget ? color : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '1.2rem', textAlign: 'center', color: isDragTarget ? color : 'rgba(255,255,255,0.18)', fontSize: '0.75rem', transition: 'all 0.15s' }}>
                        {isDragTarget ? 'Drop here' : 'Empty'}
                      </div>
                    ) : stageClients.map(c => (
                      <div key={c.id} draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(c.id); }}
                        onDragEnd={() => { setDragId(null); setDragOverStage(null); }}
                        style={{ opacity: dragId === c.id ? 0.4 : 1, transition: 'opacity 0.15s', cursor: 'grab' }}>
                        <PipeCard c={c} color={color} partnerName={partnerName} onEdit={setModal} PAY_STAT={PAY_STAT} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem' }}>No clients found. Add your first closed client above.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Client', 'Package', 'Stage', 'Payment', 'Next Due', 'Setter', 'Closer', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} style={{ transition: 'background 0.15s' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{c.name}</div>
                        {c.company && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{c.company}</div>}
                        {c.isSplit && (
                          <div style={{ marginTop: '3px', display: 'flex', gap: '4px' }}>
                            <span style={badge(c.depPaid ? '#94D96B' : '#F59E0B')}>{c.depPaid ? 'Dep. Paid' : 'Dep. Pending'}</span>
                            <span style={badge(c.balPaid ? '#94D96B' : '#F59E0B')}>{c.balPaid ? 'Bal. Paid' : 'Bal. Pending'}</span>
                          </div>
                        )}
                        {c.isUpsold && <div style={{ marginTop: '3px' }}><span style={badge('#B47AFF')}>↑ Upsell</span></div>}
                      </td>
                      <td style={tdStyle}><div>{c.pkg || '—'}</div><div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{c.planT === 'recurring' ? `${fmtM(c.amount)}/mo` : fmtM(c.amount)}</div></td>
                      <td style={tdStyle}><span style={badge(STAGES[c.stage].color)}>{STAGES[c.stage].label}</span></td>
                      <td style={tdStyle}>
                        <span style={badge(PAY_STAT[c.payStat].color)}>{PAY_STAT[c.payStat].label}</span>
                        {c.payStat !== 'current' && <button onClick={() => togglePayStatus(c, 'current')} style={{ ...btn('ghost'), padding: '2px 8px', fontSize: '0.7rem', marginLeft: '4px' }}>Mark current</button>}
                      </td>
                      <td style={tdStyle}>{fmtD(c.nextDue)}</td>
                      <td style={tdStyle}>{partnerName(c.setterId)}</td>
                      <td style={tdStyle}>{partnerName(c.closerId)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setModal(c)} style={{ ...btn('ghost'), padding: '4px 10px' }}>Edit</button>
                          <button onClick={() => setDelId(c.id)} style={{ ...btn('danger'), padding: '4px 10px' }}>Del</button>
                          {c.ghlId && <a href={`https://app.gohighlevel.com/contacts/${c.ghlId}`} target="_blank" rel="noreferrer" style={{ ...btn('ghost'), padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem' }}>GHL ↗</a>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '90%' }}>
            <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontWeight: 800 }}>Delete Client?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>This will permanently remove the client and all associated commissions.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDelId(null)} style={btn('ghost')}>Cancel</button>
              <button onClick={() => deleteClient(delId)} style={btn('danger')}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {modal && <ClientModal client={modal === 'add' ? undefined : modal} partners={partners} onSave={saveClient} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────
function TeamTab({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const [selected, setSelected] = useState<string>('all');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'setter' | 'closer' | 'both'>('closer');
  const [delId, setDelId] = useState<string | null>(null);
  const partners = data.partners;

  const addMember = () => {
    if (!newName.trim()) return;
    setData({ ...data, partners: [...data.partners, { id: uid(), name: newName.trim(), role: newRole }] });
    setNewName('');
  };
  const deleteMember = (id: string) => {
    setData({ ...data, partners: data.partners.filter(p => p.id !== id) });
    setDelId(null);
  };
  const terminateMember   = (id: string) => setData({ ...data, partners: data.partners.map(p => p.id === id ? { ...p, active: false } : p) });
  const reactivateMember  = (id: string) => setData({ ...data, partners: data.partners.map(p => p.id === id ? { ...p, active: true  } : p) });

  const getMetrics = (partnerId: string) => {
    const myClients = data.clients.filter(c => partnerId === 'all' ? true : c.setterId === partnerId || c.closerId === partnerId);
    const myComms = data.comms.filter(c => partnerId === 'all' ? true : c.partnerId === partnerId);
    const totalEarned   = myComms.reduce((s, c) => s + c.amount, 0);
    const paidOut       = myComms.filter(c => c.stat === 'paid').reduce((s, c) => s + c.amount, 0);
    const pendingPayout = myComms.filter(c => c.stat === 'pending').reduce((s, c) => s + c.amount, 0);
    const setterPending = myComms.filter(c => c.role === 'setter' && c.stat === 'pending').reduce((s, c) => s + c.amount, 0);
    const setterPaid    = myComms.filter(c => c.role === 'setter' && c.stat === 'paid').reduce((s, c) => s + c.amount, 0);
    const closerPending = myComms.filter(c => c.role === 'closer' && c.stat === 'pending').reduce((s, c) => s + c.amount, 0);
    const closerPaid    = myComms.filter(c => c.role === 'closer' && c.stat === 'paid').reduce((s, c) => s + c.amount, 0);
    const ongoingPerCycle = myClients.reduce((s, c) => {
      if (c.ongoingFor === 'both') return s + calcOngoing(c) / 2;
      if ((c.ongoingFor === 'closer' && (partnerId === 'all' || c.closerId === partnerId)) ||
          (c.ongoingFor === 'setter' && (partnerId === 'all' || c.setterId === partnerId))) return s + calcOngoing(c);
      return s;
    }, 0);
    return { myClients, totalEarned, paidOut, pendingPayout, setterPending, setterPaid, closerPending, closerPaid, ongoingPerCycle };
  };

  const pName = (id: string) => partners.find(p => p.id === id)?.name || '—';
  const m = getMetrics(selected);

  return (
    <div>
      <div style={{ marginBottom: '2rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.03em' }}>Team</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>Commission performance & team management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Roster + Add */}
        <div>
          <div style={{ ...glassCard, marginBottom: '1rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '1rem' }}>Add Team Member</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" style={inp} onKeyDown={e => e.key === 'Enter' && addMember()}
                onFocus={e => e.target.style.borderColor = 'rgba(254,100,98,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              <select value={newRole} onChange={e => setNewRole(e.target.value as typeof newRole)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="setter">Setter</option>
                <option value="closer">Closer</option>
                <option value="both">Both</option>
              </select>
              <button onClick={addMember} style={btn('primary')}>Add Member</button>
            </div>
          </div>

          <div style={{ ...glassCard, animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Active Roster ({partners.filter(p => p.active !== false).length})
            </div>
            {partners.filter(p => p.active !== false).length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>No active team members.</div>
            ) : partners.filter(p => p.active !== false).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                onClick={() => setSelected(selected === p.id ? 'all' : p.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: selected === p.id ? 'rgba(254,100,98,0.25)' : 'rgba(254,100,98,0.1)', border: `1px solid ${selected === p.id ? 'rgba(254,100,98,0.6)' : 'rgba(254,100,98,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#FE6462', transition: 'all 0.2s' }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: selected === p.id ? '#fff' : 'rgba(255,255,255,0.8)', fontSize: '0.86rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{p.role}</div>
                  </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <button onClick={() => terminateMember(p.id)} style={{ ...btn('danger'), padding: '3px 10px', fontSize: '0.68rem' }}>Terminate</button>
                </div>
              </div>
            ))}

            {partners.filter(p => p.active === false).length > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1.25rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  Terminated ({partners.filter(p => p.active === false).length})
                </div>
                {partners.filter(p => p.active === false).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: 0.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize' }}>{p.role}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => reactivateMember(p.id)} style={{ ...btn('ghost'), padding: '3px 10px', fontSize: '0.68rem' }}>Reactivate</button>
                      <button onClick={() => setDelId(p.id)} style={{ ...btn('danger'), padding: '3px 8px', fontSize: '0.68rem' }}>×</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Metrics panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.08s both' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{selected === 'all' ? 'All Team' : pName(selected)}</div>
            <select value={selected} onChange={e => setSelected(e.target.value)} style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
              <option value="all">All Team Members</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[
              { label: 'Total Commissions', value: fmtM(m.totalEarned), color: '#FE6462', delay: 0.12 },
              { label: 'Pending Payout', value: fmtM(m.pendingPayout), color: '#F59E0B', delay: 0.16 },
              { label: 'Total Paid Out', value: fmtM(m.paidOut), color: '#94D96B', delay: 0.20 },
              { label: 'Ongoing / Cycle', value: fmtM(m.ongoingPerCycle), color: '#6B8EFE', delay: 0.24 },
            ].map(({ label, value, color, delay }) => (
              <div key={label} style={{ ...glassCard, borderLeft: `3px solid ${color}`, padding: '1rem 1.25rem', animation: `cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Setter / Closer split cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}>
            <div style={{ ...glassCard, borderTop: '2px solid #FE6462' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FE6462', marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Setter Commissions</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>PENDING</div><div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F59E0B' }}>{fmtM(m.setterPending)}</div></div>
                <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>PAID OUT</div><div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#94D96B' }}>{fmtM(m.setterPaid)}</div></div>
              </div>
            </div>
            <div style={{ ...glassCard, borderTop: '2px solid #6B8EFE' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B8EFE', marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Closer Commissions</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>PENDING</div><div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F59E0B' }}>{fmtM(m.closerPending)}</div></div>
                <div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>PAID OUT</div><div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#94D96B' }}>{fmtM(m.closerPaid)}</div></div>
              </div>
            </div>
          </div>

          {/* Client breakdown */}
          <div style={{ ...glassCard, padding: 0, overflow: 'hidden', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Client Breakdown</div>
            {m.myClients.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>No clients.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Client', 'Amount', 'Setter', 'Closer', 'Init Comm', 'Stage'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {m.myClients.map(c => {
                      const myInit = selected === 'all'
                        ? calcInit(c, 'setter') + calcInit(c, 'closer')
                        : (c.setterId === selected ? calcInit(c, 'setter') : 0) + (c.closerId === selected ? calcInit(c, 'closer') : 0);
                      return (
                        <tr key={c.id}>
                          <td style={tdStyle}><div style={{ fontWeight: 700, color: '#fff' }}>{c.name}</div>{c.company && <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{c.company}</div>}</td>
                          <td style={tdStyle}><span style={{ color: '#94D96B', fontWeight: 700 }}>{fmtM(c.amount)}</span>{c.planT === 'recurring' && <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>/mo</span>}</td>
                          <td style={tdStyle}><span style={{ color: c.setterId === selected && selected !== 'all' ? '#FE6462' : 'inherit' }}>{pName(c.setterId)}</span></td>
                          <td style={tdStyle}><span style={{ color: c.closerId === selected && selected !== 'all' ? '#6B8EFE' : 'inherit' }}>{pName(c.closerId)}</span></td>
                          <td style={tdStyle}><span style={{ color: '#94D96B', fontWeight: 700 }}>{fmtM(myInit)}</span></td>
                          <td style={tdStyle}><span style={badge(STAGES[c.stage].color)}>{STAGES[c.stage].label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.75rem', maxWidth: '360px', width: '90%' }}>
            <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontWeight: 800 }}>Remove Team Member?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>Their commission records will remain but they'll be unlinked from new clients.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDelId(null)} style={btn('ghost')}>Cancel</button>
              <button onClick={() => deleteMember(delId)} style={btn('danger')}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payouts Tab ──────────────────────────────────────────────────────────────
function PayoutsTab({ data, setData, partners }: { data: AppData; setData: (d: AppData) => void; partners: Partner[] }) {
  const [filter, setFilter] = useState<'pending' | 'paid' | 'all'>('pending');
  const [addModal, setAddModal] = useState(false);
  const [newP, setNewP] = useState({ clientId: '', partnerId: '', role: 'closer' as 'setter' | 'closer', commT: 'initial' as 'initial' | 'renewal', amount: 0, due: today(), notes: '' });

  const pName = (id: string) => partners.find(p => p.id === id)?.name || '—';
  const cName = (id: string) => data.clients.find(c => c.id === id)?.name || '—';
  const shown = data.comms.filter(c => filter === 'all' || c.stat === filter);

  const markPaid    = (id: string) => setData({ ...data, comms: data.comms.map(c => c.id === id ? { ...c, stat: 'paid', paid: today() } : c) });
  const markPending = (id: string) => setData({ ...data, comms: data.comms.map(c => c.id === id ? { ...c, stat: 'pending', paid: '' } : c) });
  const addComm     = () => {
    if (!newP.clientId || !newP.partnerId || !newP.amount) return;
    setData({ ...data, comms: [...data.comms, { ...newP, id: uid(), stat: 'pending', paid: '' }] });
    setAddModal(false);
    setNewP({ clientId: '', partnerId: '', role: 'closer', commT: 'initial', amount: 0, due: today(), notes: '' });
  };
  const deleteComm = (id: string) => setData({ ...data, comms: data.comms.filter(c => c.id !== id) });

  const pendingTotal   = data.comms.filter(c => c.stat === 'pending').reduce((s, c) => s + c.amount, 0);
  const setterPending  = data.comms.filter(c => c.stat === 'pending' && c.role === 'setter').reduce((s, c) => s + c.amount, 0);
  const closerPending  = data.comms.filter(c => c.stat === 'pending' && c.role === 'closer').reduce((s, c) => s + c.amount, 0);
  const totalPaidOut   = data.comms.filter(c => c.stat === 'paid').reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.03em' }}>Commission Payouts</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>Mark commissions as paid once transferred</p>
        </div>
        <button onClick={() => setAddModal(true)} style={btn('ghost')}>+ Add Commission</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Pending', value: fmtM(pendingTotal), color: '#F59E0B', delay: 0 },
          { label: 'Setter Pending', value: fmtM(setterPending), color: '#FE6462', delay: 0.06 },
          { label: 'Closer Pending', value: fmtM(closerPending), color: '#6B8EFE', delay: 0.12 },
          { label: 'Total Paid Out', value: fmtM(totalPaidOut), color: '#94D96B', delay: 0.18 },
        ].map(({ label, value, color, delay }) => (
          <div key={label} style={{ ...glassCard, borderLeft: `3px solid ${color}`, padding: '1rem 1.25rem', animation: `cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(['pending', 'paid', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter === f ? 'primary' : 'ghost'), textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
        {shown.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>No commissions to show.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Partner', 'Client', 'Type', 'Role', 'Amount', 'Due', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {shown.map(c => (
                  <tr key={c.id} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} style={{ transition: 'background 0.15s' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 700, color: '#fff' }}>{pName(c.partnerId)}</span></td>
                    <td style={tdStyle}>{cName(c.clientId)}</td>
                    <td style={tdStyle}><span style={{ textTransform: 'capitalize' }}>{c.commT}</span></td>
                    <td style={tdStyle}><span style={{ textTransform: 'capitalize', color: c.role === 'closer' ? '#6B8EFE' : '#FE6462', fontWeight: 700 }}>{c.role}</span></td>
                    <td style={tdStyle}><span style={{ fontWeight: 700, color: c.stat === 'paid' ? '#94D96B' : '#F59E0B', fontSize: '0.95rem' }}>{fmtM(c.amount)}</span></td>
                    <td style={tdStyle}>{fmtD(c.due)}</td>
                    <td style={tdStyle}>
                      <span style={badge(c.stat === 'paid' ? '#94D96B' : '#F59E0B')}>{c.stat === 'paid' ? 'Paid' : 'Pending'}</span>
                      {c.stat === 'paid' && c.paid && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{fmtD(c.paid)}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {c.stat === 'pending'
                          ? <button onClick={() => markPaid(c.id)} style={{ ...btn('success'), padding: '4px 10px', fontSize: '0.75rem' }}>Mark Paid</button>
                          : <button onClick={() => markPending(c.id)} style={{ ...btn('ghost'), padding: '4px 10px', fontSize: '0.75rem' }}>Undo</button>}
                        <button onClick={() => deleteComm(c.id)} style={{ ...btn('danger'), padding: '4px 10px', fontSize: '0.75rem' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.75rem', width: '90%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#fff', margin: 0, fontWeight: 800 }}>Add Commission Entry</h3>
              <button onClick={() => setAddModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={lbl}>Partner</label>
                <select value={newP.partnerId} onChange={e => setNewP(p => ({ ...p, partnerId: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">— Select —</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Client</label>
                <select value={newP.clientId} onChange={e => setNewP(p => ({ ...p, clientId: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">— Select —</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Role</label>
                <select value={newP.role} onChange={e => setNewP(p => ({ ...p, role: e.target.value as 'setter' | 'closer' }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="setter">Setter</option><option value="closer">Closer</option>
                </select>
              </div>
              <div><label style={lbl}>Type</label>
                <select value={newP.commT} onChange={e => setNewP(p => ({ ...p, commT: e.target.value as 'initial' | 'renewal' }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="initial">Initial</option><option value="renewal">Renewal</option>
                </select>
              </div>
              <div><label style={lbl}>Amount ($)</label>
                <input type="number" value={newP.amount || ''} onChange={e => setNewP(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} style={inp} />
              </div>
              <div><label style={lbl}>Due Date</label>
                <input type="date" value={newP.due} onChange={e => setNewP(p => ({ ...p, due: e.target.value }))} style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Notes</label>
                <input type="text" value={newP.notes} onChange={e => setNewP(p => ({ ...p, notes: e.target.value }))} placeholder="Optional…" style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setAddModal(false)} style={btn('ghost')}>Cancel</button>
              <button onClick={addComm} style={btn('primary')}>Add Commission</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────
function CalendarTab({ data }: { data: AppData }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getWeekStart(weekOffset);
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const weekEnd = weekDays[6];

  const eventsForDay = (day: Date) => {
    const ds = day.toISOString().slice(0, 10);
    const payments = data.clients.filter(c => c.nextDue === ds).map(c => ({ type: 'payment' as const, client: c, date: day }));
    const checkins = data.clients.flatMap(c => {
      const dates = getBiweekly(c.start, new Date(weekStart), new Date(weekEnd));
      return dates.filter(d => d.toISOString().slice(0, 10) === ds).map(() => ({ type: 'checkin' as const, client: c, date: day }));
    });
    return [...payments, ...checkins];
  };

  const weekLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = today();
  const upcoming = data.clients.filter(c => c.nextDue && c.nextDue >= todayStr).sort((a, b) => a.nextDue.localeCompare(b.nextDue)).slice(0, 10);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.03em' }}>Calendar</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>Payments due + bi-weekly check-in reminders</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={btn('ghost')}>← Prev</button>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, minWidth: '200px', textAlign: 'center' }}>{weekLabel}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={btn('ghost')}>Next →</button>
          {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={btn('primary')}>Today</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
        {weekDays.map((day, i) => {
          const events = eventsForDay(day);
          const isToday = day.toISOString().slice(0, 10) === todayStr;
          return (
            <div key={i} style={{ ...glassCard, minHeight: '120px', padding: '0.75rem', borderColor: isToday ? 'rgba(254,100,98,0.4)' : 'rgba(255,255,255,0.07)', boxShadow: isToday ? '0 0 20px rgba(254,100,98,0.1)' : 'none' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{dayNames[i]}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: isToday ? '#FE6462' : '#fff', lineHeight: 1 }}>{day.getDate()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {events.map((ev, j) => (
                  <div key={j} style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.3,
                    background: ev.type === 'payment' ? 'rgba(148,217,107,0.15)' : 'rgba(107,142,254,0.15)',
                    color: ev.type === 'payment' ? '#94D96B' : '#6B8EFE',
                    border: `1px solid ${ev.type === 'payment' ? 'rgba(148,217,107,0.3)' : 'rgba(107,142,254,0.3)'}` }}>
                    {ev.type === 'payment' ? '💳 ' : '📞 '}{ev.client.name}
                    {ev.type === 'payment' && <span style={{ opacity: 0.7 }}> · {fmtM(ev.client.amount)}</span>}
                  </div>
                ))}
                {events.length === 0 && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.12)' }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#94D96B' }} /><span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Payment Due</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6B8EFE' }} /><span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Bi-Weekly Check-In</span></div>
      </div>

      <div style={glassCard}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '1rem' }}>Upcoming Payments (Next 30 Days)</div>
        {upcoming.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.83rem' }}>No upcoming payments logged.</div>
        ) : upcoming.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{c.name}</span>
              {c.company && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginLeft: '6px' }}>{c.company}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#94D96B', fontWeight: 700, fontSize: '0.88rem' }}>{fmtM(c.amount)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{fmtD(c.nextDue)}</span>
              <span style={badge(PAY_STAT[c.payStat].color)}>{PAY_STAT[c.payStat].label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `revcore-tracker-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { try { const d = JSON.parse(ev.target?.result as string); setData(d); } catch { alert('Invalid file.'); } };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '2rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.2rem', letterSpacing: '-0.03em' }}>Settings</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>Team members are managed in the Team tab</p>
      </div>

      <div style={{ ...glassCard, marginBottom: '1rem', animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.06s both' }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Data Management</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem', margin: '0 0 1.25rem' }}>Export your tracker data as JSON, or import a backup.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={exportData} style={btn('ghost')}>Export JSON</button>
          <label style={{ ...btn('ghost'), cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            Import JSON<input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ ...glassCard, animation: 'cardReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.12s both' }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Summary</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
          {[
            { label: 'Total Clients', value: data.clients.length },
            { label: 'Team Members', value: data.partners.length },
            { label: 'Commission Entries', value: data.comms.length },
            { label: 'Pending Payouts', value: data.comms.filter(c => c.stat === 'pending').length },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{label}</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setDataRaw] = useState<AppData>({ partners: [], clients: [], comms: [] });
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const isSaving = useRef(false);

  // Initial load
  useEffect(() => {
    const loadLocal = () => {
      try { const s = localStorage.getItem(STORE); if (s) setDataRaw(JSON.parse(s)); } catch {}
      setSyncStatus('offline');
    };
    if (hasSupabase && supabase) {
      (async () => {
        try {
          const { data: row, error } = await supabase!.from('rc_tracker_data').select('value').eq('key', 'appData').single();
          if (error || !row?.value) { loadLocal(); return; }
          setDataRaw(row.value as AppData);
          setSyncStatus('live');
        } catch { loadLocal(); }
      })();
    } else {
      loadLocal();
    }
  }, []);

  // Realtime subscription — push remote changes to all connected clients
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const channel = supabase
      .channel('tracker-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rc_tracker_data', filter: 'key=eq.appData' },
        (payload) => {
          // Ignore updates we triggered ourselves
          if (isSaving.current) return;
          const incoming = (payload.new as { value: AppData }).value;
          if (incoming) { setDataRaw(incoming); try { localStorage.setItem(STORE, JSON.stringify(incoming)); } catch {} }
        })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSyncStatus('live');
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setSyncStatus('offline');
      });
    return () => { supabase!.removeChannel(channel); };
  }, []);

  const setData = (d: AppData) => {
    setDataRaw(d);
    try { localStorage.setItem(STORE, JSON.stringify(d)); } catch {}
    if (hasSupabase && supabase) {
      isSaving.current = true;
      supabase.from('rc_tracker_data').upsert({ key: 'appData', value: d }, { onConflict: 'key' })
        .then(() => { setTimeout(() => { isSaving.current = false; }, 500); });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'clients',   label: 'Clients' },
    { id: 'team',      label: 'Team & Payouts' },
    { id: 'calendar',  label: 'Calendar' },
    { id: 'settings',  label: 'Settings' },
  ];

  const pendingCount = data.comms.filter(c => c.stat === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', fontFamily: 'DM Sans, sans-serif', color: '#fff', paddingTop: '0', position: 'relative' }}>
      <CosmicBg />

      {/* Floating sign-out */}
      <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 200, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Sync status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '3px 10px', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: syncStatus === 'live' ? '#94D96B' : syncStatus === 'offline' ? '#F59E0B' : '#6B8EFE', boxShadow: syncStatus === 'live' ? '0 0 6px #94D96B' : 'none', animation: syncStatus === 'connecting' ? 'starPulse 1.2s ease infinite' : 'none' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: syncStatus === 'live' ? '#94D96B' : syncStatus === 'offline' ? '#F59E0B' : '#6B8EFE' }}>
            {syncStatus === 'live' ? 'Live' : syncStatus === 'offline' ? 'Offline' : 'Connecting…'}
          </span>
        </div>
        {pendingCount > 0 && (
          <button onClick={() => setTab('team')} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '100px', padding: '3px 12px', fontSize: '0.73rem', fontWeight: 700, color: '#F59E0B', backdropFilter: 'blur(8px)', cursor: 'pointer' }}>
            {pendingCount} pending
          </button>
        )}
        <button onClick={onLogout} style={{ ...btn('ghost'), fontSize: '0.78rem', padding: '5px 14px', backdropFilter: 'blur(8px)' }}>Sign out</button>
      </div>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(1.5rem, 4vw, 3rem)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', color: tab === t.id ? '#FE6462' : 'rgba(255,255,255,0.4)', borderBottom: tab === t.id ? '2px solid #FE6462' : '2px solid transparent', transition: 'color 0.2s', marginBottom: '-1px', position: 'relative' }}>
              {t.label}
              {t.id === 'team' && pendingCount > 0 && <span style={{ position: 'absolute', top: '8px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)', position: 'relative', zIndex: 1 }}>
        {tab === 'overview'  && <OverviewTab  data={data} />}
        {tab === 'clients'   && <ClientsTab   data={data} setData={setData} partners={data.partners} />}
        {tab === 'team'      && <><TeamTab data={data} setData={setData} /><div style={{ marginTop: '2.5rem' }}><PayoutsTab data={data} setData={setData} partners={data.partners} /></div></>}
        {tab === 'calendar'  && <CalendarTab  data={data} />}
        {tab === 'settings'  && <SettingsTab  data={data} setData={setData} />}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes drillSlideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes drillFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes trackerFadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cardReveal { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes starPulse { 0%,100% { transform:scale(1); opacity:1 } 50% { transform:scale(0.4); opacity:0.1 } }
        @keyframes shootAcross { 0% { transform:translateX(0) rotate(0deg); opacity:0 } 5% { opacity:1 } 25% { transform:translateX(110vw) rotate(0deg); opacity:0 } 100% { transform:translateX(110vw); opacity:0 } }
        @media (max-width:700px) { table { font-size:0.78rem } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.6); cursor:pointer }
        select option { background:#1a1f28 }
        ::-webkit-scrollbar { width:6px; height:6px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:3px }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const [auth, setAuth]       = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuth(sessionStorage.getItem('rcTrackerAuth') === '1');
    setChecked(true);
  }, []);

  const logout = () => { sessionStorage.removeItem('rcTrackerAuth'); setAuth(false); };

  if (!checked) return null;
  if (!auth) return <Login onLogin={() => setAuth(true)} />;
  return <Dashboard onLogout={logout} />;
}
