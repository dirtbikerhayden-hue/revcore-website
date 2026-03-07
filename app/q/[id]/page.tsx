'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────
interface LineItem {
  category: 'LABOR' | 'ADDON' | 'MATERIAL';
  description: string;
  qty?: string;
  unitPrice?: number;
  amount: number;
}
interface QuoteData {
  companyName: string;
  companySubtitle: string;
  companyTagline: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyAddress: string;
  companyCertifications: string[];
  clientName: string;
  clientFirstName: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  validDays: number;
  salesRep: string;
  projectType: string;
  projectDetails: string[];
  lineItems: LineItem[];
  subtotal: number;
  discountLabel?: string;
  discountPct?: number;
  taxRate: number;
  total: number;
  financingOptions: { months: number; rate: number }[];
  downPaymentPct: number;
  trustPoints: { label: string; sub: string }[];
  terms: string[];
}

// ─── Demo data (Rock N Roll Stoneworks) ──────────────────────────────────────
const DEMO: QuoteData = {
  companyName: 'Rock N Roll',
  companySubtitle: 'Stoneworks · Pools & Spas',
  companyTagline: 'Premium Outdoor Spaces. Zero Subcontractors. Built to Last.',
  companyPhone: '303-587-3035',
  companyEmail: 'mrstoneworks@gmail.com',
  companyWebsite: 'rnrstoneworks.com',
  companyAddress: '12420 Arapahoe Road\nLafayette, CO 80026',
  companyCertifications: ['ICPI Certified', 'Belgard Authorized', '2-Year Installation Guarantee'],
  clientName: 'Hayden Mitchell',
  clientFirstName: 'Hayden',
  clientAddress: '2537 N 28th Pl',
  clientPhone: '9494630653',
  clientEmail: 'hayden@revcorehq.com',
  quoteNumber: '17728299',
  dateIssued: 'March 7, 2026',
  validUntil: 'April 6, 2026',
  validDays: 30,
  salesRep: 'Sales Representative',
  projectType: 'Pool Construction',
  projectDetails: ['400 sq ft', 'Flat slope', 'Easy access'],
  lineItems: [
    { category: 'ADDON',    description: 'Custom Electrical',                         qty: '1 sq ft', unitPrice: 15000, amount: 15000 },
    { category: 'LABOR',    description: 'Pool Construction — Large L Shape (800 sq ft)',               amount: 88000 },
    { category: 'ADDON',    description: 'Depth Upgrade — Deep',                                       amount: 4500  },
    { category: 'MATERIAL', description: 'Interior Finish — Pebble Tec',                               amount: 7800  },
    { category: 'MATERIAL', description: 'Coping Upgrade — Travertine',                                amount: 2800  },
    { category: 'ADDON',    description: 'Tanning Ledge',                                              amount: 4500  },
  ],
  subtotal: 122600,
  discountLabel: 'Senior Discount',
  discountPct: 5,
  taxRate: 4.9,
  total: 122177,
  financingOptions: [
    { months: 12, rate: 7.99  },
    { months: 24, rate: 9.99  },
    { months: 36, rate: 11.99 },
    { months: 60, rate: 13.99 },
  ],
  downPaymentPct: 20,
  trustPoints: [
    { label: 'Top-Rated',         sub: '5-star reviewed'  },
    { label: 'Licensed & Insured', sub: 'Full coverage'   },
    { label: 'Local Colorado',     sub: 'Lafayette, CO'    },
  ],
  terms: [
    'This estimate is valid for 30 days from the date of issue.',
    'A 50% deposit is required to confirm your project start date. Balance is due upon completion.',
    'Rock N Roll Stoneworks provides a 2-year workmanship installation guarantee on all projects.',
    "Belgard-certified installations qualify for Belgard's lifetime limited product warranty.",
    'Pricing does not include HOA permits, engineering reports, or utility relocation unless specified.',
    'Scope changes after signing may result in a revised estimate and/or change order.',
    'All work performed by our own ICPI-certified crew — zero subcontractors, ever.',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
function calcMonthly(total: number, downPct: number, months: number, apr: number) {
  const principal = total * (1 - downPct / 100);
  const r = apr / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}
const CAT_COLOR: Record<string, string> = {
  LABOR: '#16a34a', ADDON: '#7c3aed', MATERIAL: '#2563eb',
};

// ─── Signature canvas ─────────────────────────────────────────────────────────
function SignatureCanvas({ onSign }: { onSign: (data: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const pos = (e: { clientX: number; clientY: number }, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top)  * (canvas.height / r.height),
    };
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const pt = 'touches' in e ? e.touches[0] : e;
      const { x, y } = pos(pt, canvas);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const pt = 'touches' in e ? e.touches[0] : e;
      const { x, y } = pos(pt, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasStrokes(true);
    };
    const end = () => {
      drawing.current = false;
      if (hasStrokes || ref.current) onSign(canvas.toDataURL());
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onSign('');
  };

  return (
    <div>
      <canvas ref={ref} width={700} height={180}
        style={{ width: '100%', height: '180px', border: '1.5px solid #d1d5db', borderRadius: '10px', background: '#fff', cursor: 'crosshair', touchAction: 'none', display: 'block' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signature</span>
        <button onClick={clear} style={{ fontSize: '0.75rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>Clear</button>
      </div>
    </div>
  );
}

// ─── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const mailtoBody = `Hi,\n\nPlease find your custom project quote at the link below:\n\n${url}\n\nThis quote is valid for 30 days. Click the link to review your estimate, explore financing options, and sign electronically.\n\nLet me know if you have any questions!\n\nBest,`;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <h3 style={{ margin: '0 0 0.4rem', fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>Send Quote to Client</h3>
        <p style={{ margin: '0 0 1.4rem', color: '#6b7280', fontSize: '0.88rem' }}>Share this link via email, text, or any messaging app.</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <input readOnly value={url} style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.82rem', color: '#374151', background: '#f9fafb', outline: 'none' }} />
          <button onClick={copy} style={{ padding: '10px 18px', background: copied ? '#16a34a' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <a href={`mailto:?subject=Your%20Custom%20Project%20Quote&body=${encodeURIComponent(mailtoBody)}`}
          style={{ display: 'block', width: '100%', padding: '12px', background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '10px', color: '#92400e', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center', textDecoration: 'none', marginBottom: '0.75rem' }}>
          Open in Email Client →
        </a>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '10px', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

// ─── Print-only PDF layout ────────────────────────────────────────────────────
function PrintView({ q, sigData }: { q: QuoteData; sigData: string }) {
  const discount = q.discountPct ? q.subtotal * (q.discountPct / 100) : 0;
  const tax = (q.subtotal - discount) * (q.taxRate / 100);
  const GOLD = '#c47b14';
  return (
    <div className="print-only" style={{ fontFamily: 'Arial, sans-serif', color: '#222', background: '#fff', margin: 0 }}>
      {/* Header */}
      <div style={{ background: '#111', color: '#fff', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{q.companyName.toUpperCase()}</div>
          <div style={{ color: GOLD, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', marginBottom: '6px' }}>{q.companySubtitle.toUpperCase()}</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#aaa', marginBottom: '10px' }}>{q.companyTagline}</div>
          <div style={{ fontSize: '0.72rem', color: '#888' }}>{q.companyCertifications.join(' · ')}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.78rem', lineHeight: 1.8, color: '#ccc' }}>
          <div>{q.companyPhone}</div>
          <div>{q.companyEmail}</div>
          <div>{q.companyWebsite}</div>
          {q.companyAddress.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
      {/* Gold accent bar */}
      <div style={{ height: '4px', background: GOLD }} />

      {/* Estimate title block */}
      <div style={{ padding: '32px 40px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111', lineHeight: 1 }}>ESTIMATE</div>
          <div style={{ width: '60px', height: '3px', background: GOLD, marginTop: '6px', marginBottom: '10px' }} />
          <div style={{ fontSize: '0.8rem', color: '#666' }}>#{q.quoteNumber}</div>
        </div>
        <div style={{ fontSize: '0.82rem', lineHeight: 2.2 }}>
          {[['Date Issued:', q.dateIssued], ['Valid Until:', q.validUntil], ['Sales Rep:', q.salesRep], ['Contact:', q.companyPhone]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontWeight: 700, minWidth: '90px' }}>{k}</span>
              <span style={{ color: '#555' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prepared For + Project Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 40px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: GOLD, color: '#fff', padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em' }}>PREPARED FOR</div>
          <div style={{ padding: '14px', background: '#f9fafb' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{q.clientName}</div>
            {q.clientAddress && <div style={{ fontSize: '0.8rem', color: '#555' }}>{q.clientAddress}</div>}
            {q.clientPhone && <div style={{ fontSize: '0.8rem', color: '#555' }}>{q.clientPhone}</div>}
            {q.clientEmail && <div style={{ fontSize: '0.8rem', color: '#555' }}>{q.clientEmail}</div>}
          </div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: '#111', color: '#fff', padding: '8px 14px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em' }}>PROJECT DETAILS</div>
          <div style={{ padding: '14px', background: '#f9fafb' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{q.projectType}</div>
            <div style={{ fontSize: '0.8rem', color: '#555' }}>{q.projectDetails.join(' · ')}</div>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div style={{ padding: '20px 40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ background: '#111', color: '#fff', padding: '10px 14px', textAlign: 'left', borderLeft: `4px solid ${GOLD}`, fontSize: '0.72rem', letterSpacing: '0.08em' }}>SCOPE OF WORK</th>
              <th style={{ background: '#333', color: '#ccc', padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem' }}>QTY / UNIT</th>
              <th style={{ background: '#333', color: '#ccc', padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem' }}>UNIT PRICE</th>
              <th style={{ background: '#333', color: '#ccc', padding: '10px 14px', textAlign: 'right', fontSize: '0.7rem' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {q.lineItems.map((item, i) => (
              <>
                <tr key={`cat-${i}`}>
                  <td colSpan={4} style={{ padding: '6px 14px 2px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#888', background: '#f3f4f6' }}>{item.category}</td>
                </tr>
                <tr key={`item-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLOR[item.category], flexShrink: 0, display: 'inline-block' }} />
                    {item.description}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{item.qty ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{item.unitPrice ? fmt(item.unitPrice) : '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{fmt(item.amount)}</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <div style={{ width: '300px', fontSize: '0.85rem' }}>
            {[
              { label: 'Subtotal', value: fmt(q.subtotal), color: '#222' },
              q.discountPct ? { label: `${q.discountLabel} (${q.discountPct}%)`, value: `−${fmt(discount)}`, color: '#16a34a' } : null,
              { label: `Sales Tax (${q.taxRate}%)`, value: fmt(tax), color: '#222' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', color: row!.color }}>
                <span>{row!.label}</span><span>{row!.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', background: GOLD, color: '#fff', padding: '12px 16px', borderRadius: '6px', fontWeight: 900, fontSize: '1rem', marginTop: '8px' }}>
              <span>TOTAL INVESTMENT</span><span>{fmt(q.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div style={{ padding: '0 40px 20px' }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '12px' }}>
          <div style={{ width: '4px', background: GOLD, borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ background: '#111', color: '#fff', padding: '8px 16px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', flex: 1 }}>TERMS &amp; CONDITIONS</div>
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 0', listStyle: 'none', fontSize: '0.8rem', color: '#555', lineHeight: 1.8 }}>
          {q.terms.map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
              <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>●</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Acceptance */}
      <div style={{ padding: '0 40px 40px' }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
          <div style={{ width: '4px', background: GOLD, borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ background: '#111', color: '#fff', padding: '8px 16px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', flex: 1 }}>ACCEPTANCE OF ESTIMATE</div>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#555', marginBottom: '24px' }}>
          By signing below, you authorize {q.companyName} {q.companySubtitle} to proceed with the described scope of work and agree to the terms and payment schedule outlined in this estimate.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', background: '#f9fafb' }}>
            <div style={{ color: GOLD, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '12px' }}>CLIENT SIGNATURE</div>
            {sigData ? (
              <img src={sigData} alt="signature" style={{ width: '100%', height: '80px', objectFit: 'contain', objectPosition: 'left' }} />
            ) : (
              <div style={{ height: '80px', borderBottom: '1.5px solid #111' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#555' }}>
              <span>Signature</span>
              <span>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style={{ borderTop: '1px solid #ccc', marginTop: '16px', paddingTop: '8px', fontSize: '0.8rem' }}>{q.clientName}</div>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', background: '#f9fafb' }}>
            <div style={{ color: GOLD, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '12px' }}>{q.companyName.toUpperCase()} {q.companySubtitle.split('·')[0].trim().toUpperCase()}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{q.salesRep}</div>
            <div style={{ fontSize: '0.78rem', color: '#777', marginBottom: '16px' }}>Outdoor Living Specialist</div>
            <div style={{ height: '40px', borderBottom: '1.5px solid #111' }} />
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#555' }}>Authorized Signature</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '28px', fontStyle: 'italic', color: GOLD, fontWeight: 700, fontSize: '0.88rem' }}>
          Thank you for the opportunity to earn your business.
        </div>
        <div style={{ textAlign: 'center', color: '#777', fontSize: '0.8rem', marginTop: '4px' }}>
          We look forward to transforming your outdoor space.
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function QuotePage() {
  const { id } = useParams<{ id: string }>();
  const [q, setQ] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [finTerm, setFinTerm] = useState(2); // index into financingOptions
  const [sigData, setSigData] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // For 'demo', use hardcoded data. In production, fetch from Supabase by id.
    if (id === 'demo') { setQ(DEMO); setLoading(false); return; }
    // Attempt Supabase fetch
    import('@/lib/supabase').then(({ supabase }) => {
      if (!supabase) { setQ(DEMO); setLoading(false); return; }
      supabase.from('rc_quotes').select('data').eq('id', id).single()
        .then(({ data }) => { setQ(data?.data ?? DEMO); setLoading(false); });
    });
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') setShareUrl(window.location.href);
  }, []);

  const handleAccept = useCallback(async () => {
    if (!sigData) { alert('Please draw your signature before accepting.'); return; }
    // Optionally save to Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      if (supabase) {
        await supabase.from('rc_quote_signatures').upsert({
          quote_id: id, sig_data: sigData, signed_at: new Date().toISOString(), client_name: q?.clientName,
        }, { onConflict: 'quote_id' });
      }
    } catch { /* offline is fine — sig shown in print anyway */ }
    setAccepted(true);
  }, [sigData, id, q]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif', color: '#9ca3af', fontSize: '0.9rem' }}>
      Loading quote…
    </div>
  );
  if (!q) return null;

  const GOLD = '#c47b14';
  const discount = q.discountPct ? q.subtotal * (q.discountPct / 100) : 0;
  const tax = (q.subtotal - discount) * (q.taxRate / 100);
  const opt = q.financingOptions[finTerm];
  const monthly = calcMonthly(q.total, q.downPaymentPct, opt.months, opt.rate);
  const downAmt = q.total * (q.downPaymentPct / 100);
  const financed = q.total - downAmt;
  const totalCost = downAmt + monthly * opt.months;

  const card: React.CSSProperties = { background: '#fff', borderRadius: '18px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2f5; font-family: system-ui, -apple-system, sans-serif; }
        @media print {
          .screen-only { display: none !important; }
          .print-only  { display: block !important; }
          body { background: #fff; }
          @page { margin: 0; size: letter; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
        .fin-btn { border: 1.5px solid #d1d5db; background: #fff; color: #374151; border-radius: 100px; padding: 8px 16px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .fin-btn.active { background: ${GOLD}; border-color: ${GOLD}; color: #fff; }
        .fin-btn:hover:not(.active) { border-color: ${GOLD}; color: ${GOLD}; }
        .accept-btn { width: 100%; padding: 16px; background: ${GOLD}; color: #fff; border: none; border-radius: 14px; font-size: 1rem; font-weight: 800; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
        .accept-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .accept-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      <PrintView q={q} sigData={sigData} />

      <div className="screen-only" style={{ maxWidth: '680px', margin: '0 auto', padding: '0 0 3rem' }}>
        {/* Top nav bar */}
        <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 0 rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: GOLD, fontWeight: 900, fontSize: '0.7rem', letterSpacing: '-0.03em' }}>RR</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowShare(true)} style={{ padding: '8px 16px', border: `1.5px solid ${GOLD}`, borderRadius: '100px', background: 'none', color: GOLD, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
              Share
            </button>
            <button onClick={() => window.print()} style={{ padding: '8px 16px', border: `1.5px solid ${GOLD}`, borderRadius: '100px', background: 'none', color: GOLD, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
              ⬇ PDF
            </button>
            <a href={`tel:${q.companyPhone}`} style={{ padding: '8px 16px', border: `1.5px solid ${GOLD}`, borderRadius: '100px', background: 'none', color: GOLD, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              📞 {q.companyPhone}
            </a>
          </div>
        </div>

        {/* Intro card */}
        <div style={{ ...card, margin: '0 1rem 1rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: GOLD, letterSpacing: '0.1em', marginBottom: '10px' }}>CUSTOM PROJECT QUOTE</div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>Hello, {q.clientFirstName}!</h1>
          <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '0.9rem' }}>Here&apos;s your personalized estimate from {q.companyName} {q.companySubtitle.split('·')[0].trim()}.</p>
          <span style={{ display: 'inline-block', padding: '5px 14px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, color: '#92400e' }}>{q.projectType}</span>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.8rem' }}>
            <span>⏱</span>
            <span>Quote valid for {q.validDays} more days · Expires {q.validUntil}</span>
          </div>
        </div>

        {/* Investment card */}
        <div style={{ ...card, margin: '0 1rem 1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '16px' }}>Your Investment</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111', letterSpacing: '-0.04em', lineHeight: 1 }}>{fmt(q.total)}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '4px' }}>Total project investment</div>
            </div>
            {q.discountPct && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', padding: '5px 12px', border: `1.5px solid #86efac`, borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4' }}>{q.discountLabel} — {q.discountPct}% off</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>You save {fmt(discount)}</div>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
            {[
              { label: 'Subtotal', value: fmt(q.subtotal), color: '#374151' },
              q.discountPct ? { label: q.discountLabel!, value: `−${fmt(discount)}`, color: '#16a34a' } : null,
              { label: `Tax (${q.taxRate}%)`, value: fmt(tax), color: '#374151' },
              { label: 'Total', value: fmt(q.total), color: '#111', bold: true },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #f9fafb' : 'none', fontWeight: row!.bold ? 800 : 400, color: row!.color, fontSize: row!.bold ? '1rem' : '0.88rem' }}>
                <span>{row!.label}</span><span>{row!.value}</span>
              </div>
            ))}
          </div>

          {/* Scope accordion */}
          <button onClick={() => setScopeOpen(!scopeOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.83rem', padding: '4px 0' }}>
            <span>🗂</span>
            <span style={{ fontWeight: 600 }}>View full scope breakdown</span>
            <span style={{ marginLeft: '2px', transition: 'transform 0.2s', transform: scopeOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {scopeOpen && (
            <div style={{ marginTop: '12px', border: '1px solid #f3f4f6', borderRadius: '12px', overflow: 'hidden' }}>
              {q.lineItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < q.lineItems.length - 1 ? '1px solid #f9fafb' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLOR[item.category], flexShrink: 0, display: 'inline-block' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#374151' }}>{item.description}</div>
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.category}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financing card */}
        <div style={{ ...card, margin: '0 1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span>💳</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111' }}>Financing Options</div>
          </div>
          <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: '0.85rem' }}>Make your dream project more affordable with flexible payment plans.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {q.financingOptions.map((opt, i) => (
              <button key={i} className={`fin-btn${finTerm === i ? ' active' : ''}`} onClick={() => setFinTerm(i)}>
                {opt.months}mo @ {opt.rate}%
              </button>
            ))}
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: GOLD }}>{fmt(monthly)}</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: GOLD }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '14px' }}>
              {opt.months} months · {opt.rate}% APR · {q.downPaymentPct}% down ({fmt(downAmt)})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[['Amount Financed', fmt(financed)], ['Total Cost', fmt(totalCost)]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.72rem', color: '#d97706', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: GOLD }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#d97706', fontStyle: 'italic' }}>
              *Financing subject to credit approval. Contact us for details.
            </div>
          </div>
        </div>

        {/* Trust card */}
        <div style={{ ...card, margin: '0 1rem 1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111', marginBottom: '20px' }}>Why {q.companyName} {q.companySubtitle.split('·')[0].trim()}?</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${q.trustPoints.length}, 1fr)`, gap: '12px', textAlign: 'center' }}>
            {q.trustPoints.map((tp, i) => (
              <div key={i}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', border: `1.5px solid #fcd34d`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.2rem' }}>
                  {i === 0 ? '☆' : i === 1 ? '🛡' : '✓'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111', marginBottom: '3px' }}>{tp.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{tp.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign & Accept card */}
        <div style={{ ...card, margin: '0 1rem 1rem' }}>
          {accepted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', marginBottom: '6px' }}>Quote Accepted!</div>
              <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0 0 20px' }}>
                Thank you, {q.clientFirstName}. We&apos;ll be in touch shortly to confirm your start date.
              </p>
              <button onClick={() => window.print()} style={{ padding: '12px 28px', background: GOLD, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Download Signed PDF
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', border: `1.5px solid #fcd34d`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✏️</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111', fontSize: '1rem' }}>Sign &amp; Accept</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Authorize {q.companyName} {q.companySubtitle.split('·')[0].trim()} to proceed</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '16px 0', lineHeight: 1.6 }}>
                By signing, you authorize {q.companyName} {q.companySubtitle.split('·')[0].trim()} to proceed with the described scope of work and agree to the terms, payment schedule, and conditions outlined in this estimate. Total: <strong style={{ color: '#111' }}>{fmt(q.total)}</strong>.
              </p>
              <div style={{ marginBottom: '6px', fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>Draw your signature below</div>
              <SignatureCanvas onSign={setSigData} />
              <button className="accept-btn" style={{ marginTop: '18px' }} disabled={!sigData} onClick={handleAccept}>
                Accept &amp; Sign Quote →
              </button>
            </>
          )}
        </div>
      </div>

      {showShare && <ShareModal url={shareUrl} onClose={() => setShowShare(false)} />}
    </>
  );
}
