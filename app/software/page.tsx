'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, FileText, Bell, Star, Layers, Monitor } from 'lucide-react';
import { useScrollReveal, fadeUp, scaleUp, slideFromLeft, slideFromRight } from '@/hooks/useScrollReveal';
import AnimatedText from '@/components/AnimatedText';
import IpadMockup from '@/components/iPadMockup';
import QuotingApp from '@/components/QuotingApp';
import PitchApp from '@/components/PitchApp';
import SpaceBackground from '@/components/SpaceBackground';

/* ─── Feature grid item ──────────────────────────────────────────────────── */
function Feature({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        background: `${accent}08`,
        border: `1px solid ${accent}18`,
        transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s ease, background 0.28s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 16px 40px ${accent}20`;
        e.currentTarget.style.background = `${accent}12`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.background = `${accent}08`;
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, marginBottom: '0.875rem',
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: '0.4rem' }}>
        {title}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65' }}>
        {desc}
      </p>
    </div>
  );
}

/* ─── Demo data ──────────────────────────────────────────────────────────── */
interface DemoStep { tag: string; title: string; desc: string; bullets: string[]; }
interface QuotingDemoStep extends DemoStep { tab: 'dashboard' | 'quote' | 'jobs' | 'followup'; }
interface PitchDemoStep extends DemoStep { slide: number; }

const QUOTING_STEPS: QuotingDemoStep[] = [
  { tab: 'dashboard', tag: 'Live Dashboard', title: 'Every metric,\nat a glance.', desc: 'Revenue, open quotes, follow-ups, and new reviews updated in real time — no more switching between platforms.', bullets: ['$89.3K tracked this month', '12 open quotes monitored', '7 follow-ups queued automatically'] },
  { tab: 'quote', tag: 'Quote Builder', title: 'Quote built\nbefore you leave.', desc: 'Add line items from your pre-built catalog, adjust quantities, and fire off a professional quote at the door.', bullets: ['Pre-loaded pricing catalog', 'Live total calculation', 'One-tap send via SMS or email'] },
  { tab: 'jobs', tag: 'Job Pipeline', title: 'Every job,\nevery status.', desc: 'See every active quote with its current status and dollar value. Viewed, signed, or cold — you always know.', bullets: ['Color-coded job statuses', 'Dollar value at a glance', 'Tap any job to act instantly'] },
  { tab: 'followup', tag: 'Automation', title: 'Follow-ups that\nrun while you sleep.', desc: 'When a quote goes cold, timed SMS and email sequences fire automatically. Your team focuses on closing, not chasing.', bullets: ['Multi-touch: 24h, 72h, 7-day triggers', 'Auto-fires on quote status change', 'Progress tracked per contact'] },
];

const PITCH_STEPS: PitchDemoStep[] = [
  { slide: 0, tag: 'Brand Intro', title: 'Walk in with\na presentation.', desc: 'Customers trust what they can see. Open with a branded, customer-personalized intro before you say a word.', bullets: ['Personalized per customer name', 'Your logo, brand, and photos', 'Credibility built on slide one'] },
  { slide: 2, tag: 'Your Process', title: 'Show them exactly\nwhat happens.', desc: 'A clear 4-step walkthrough eliminates objections before they\'re even asked. Transparency closes deals.', bullets: ['Step-by-step visual timeline', 'Removes friction and uncertainty', 'Sets professional expectations early'] },
  { slide: 7, tag: 'Project Gallery', title: 'Proof they\ncan see.', desc: 'Six project photos built right into the presentation. Real jobs that close deals by letting your work speak.', bullets: ['Full-bleed project photos', 'Labeled by service type', 'Always current from your portfolio'] },
  { slide: 6, tag: 'Pricing Tiers', title: 'Good, Better,\nBest pricing.', desc: 'Present three tiers so the customer picks a level — not whether to buy. Proven to increase average ticket 34%.', bullets: ['Interactive tier selection', 'Monthly pricing displayed clearly', 'No long-term contract messaging'] },
  { slide: 9, tag: 'E-Signature', title: 'Close the deal\non the spot.', desc: 'The final slide collects a digital signature and submits the contract. Signed and scheduled before you leave.', bullets: ['Tap-to-sign on the iPad', 'Full contract summary visible', 'Instant confirmation sent'] },
];

/* ─── Watch Demo button ──────────────────────────────────────────────────── */
function WatchDemoBtn({ onClick, accent }: { onClick: () => void; accent: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem' }}>
      <span style={{ position: 'absolute', inset: '-8px', borderRadius: '100px', border: `1px solid ${accent}55`, animation: 'demoPulseA 2.6s ease-out infinite', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', inset: '-8px', borderRadius: '100px', border: `1px solid ${accent}35`, animation: 'demoPulseA 2.6s ease-out 1s infinite', pointerEvents: 'none' }} />
      <button
        onClick={onClick}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '11px 22px', borderRadius: '100px', background: 'transparent', border: `1.5px solid ${accent}45`, color: accent, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.01em', transition: 'all 0.25s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}12`; e.currentTarget.style.borderColor = `${accent}80`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${accent}45`; }}
      >
        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${accent}20`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="7" height="9" viewBox="0 0 7 9" fill="none"><path d="M1 1l5 3.5L1 8V1z" fill={accent} /></svg>
        </span>
        Watch Demo
      </button>
    </div>
  );
}

/* ─── Demo overlay ───────────────────────────────────────────────────────── */
function SoftwareDemoOverlay({ open, onClose, ipadSide, accent, steps, step, onStep, ipadContent }: {
  open: boolean; onClose: () => void; ipadSide: 'left' | 'right'; accent: string;
  steps: DemoStep[]; step: number; onStep: (n: number) => void; ipadContent: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && step < steps.length - 1) onStep(step + 1);
      if (e.key === 'ArrowLeft' && step > 0) onStep(step - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, step, steps.length, onClose, onStep]);

  if (!open) return null;
  const isLeft = ipadSide === 'left';

  const textPanel = (
    <div style={{ flex: '0 0 36%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2.5rem 3rem', animation: `${isLeft ? 'demoSlideR' : 'demoSlideL'} 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both` }}>
      <div key={step} style={{ animation: 'demoStepIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: `${accent}14`, border: `1px solid ${accent}28`, marginBottom: '1.5rem' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{steps[step].tag}</span>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.12em', marginBottom: '0.6rem', textTransform: 'uppercase' as const }}>
          {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </div>
        <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.7rem, 2.4vw, 2.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 1rem', whiteSpace: 'pre-line' as const }}>
          {steps[step].title}
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.42)', lineHeight: '1.75', margin: '0 0 1.75rem' }}>
          {steps[step].desc}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '2.5rem' }}>
          {steps[step].bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: `${accent}14`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1.5 3.5L3.2 5.2L6.5 1.8" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {steps.map((_, i) => (
              <button key={i} onClick={() => onStep(i)} style={{ width: i === step ? '22px' : '6px', height: '6px', borderRadius: '100px', background: i === step ? accent : 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => step > 0 && onStep(step - 1)} disabled={step === 0} style={{ width: '36px', height: '36px', borderRadius: '50%', background: step === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: step === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.65)', cursor: step === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontSize: '1rem' }}>←</button>
            <button onClick={() => step < steps.length - 1 && onStep(step + 1)} disabled={step === steps.length - 1} style={{ width: '36px', height: '36px', borderRadius: '50%', background: step === steps.length - 1 ? 'rgba(255,255,255,0.04)' : `${accent}20`, border: `1px solid ${step === steps.length - 1 ? 'rgba(255,255,255,0.1)' : accent + '40'}`, color: step === steps.length - 1 ? 'rgba(255,255,255,0.18)' : accent, cursor: step === steps.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontSize: '1rem' }}>→</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ipadPanel = (
    <div style={{ flex: '0 0 64%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'demoIpadIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>{ipadContent}</div>
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', background: 'rgba(4,7,11,0.94)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', animation: 'demoBackdropIn 0.3s ease both' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', animation: 'demoFadeUp 0.4s ease 0.2s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, display: 'block', animation: 'demoDot 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Interactive Demo</span>
        </div>
        <button
          onClick={onClose}
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >✕</button>
      </div>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', maxWidth: '1380px', margin: '0 auto', padding: '72px 2rem 2rem' }}>
        {isLeft ? <>{ipadPanel}{textPanel}</> : <>{textPanel}{ipadPanel}</>}
      </div>
      <style>{`
        @keyframes demoBackdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes demoIpadIn { from { opacity:0; transform:scale(0.87) translateY(22px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes demoSlideR { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:translateX(0) } }
        @keyframes demoSlideL { from { opacity:0; transform:translateX(-32px) } to { opacity:1; transform:translateX(0) } }
        @keyframes demoStepIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes demoFadeUp { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes demoDot { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}

/* ─── Page sections ──────────────────────────────────────────────────────── */
function QuotingSection() {
  const { ref, inView } = useScrollReveal({ threshold: 0.08 });
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const quotingFeatures = [
    { icon: <FileText size={16} />, title: 'On-Site Quote Generation', desc: 'Build accurate, professional proposals at the door with your pricing built in. No office trips.' },
    { icon: <Layers size={16} />, title: 'Good / Better / Best Options', desc: 'Present three tiers on every job, proven to increase average ticket size by 34%.' },
    { icon: <Zap size={16} />, title: 'Job Tracking Pipeline', desc: 'See every quote\'s status at a glance: sent, viewed, followed-up, signed. Nothing slips.' },
    { icon: <Bell size={16} />, title: 'Automated Follow-Up', desc: 'Timed SMS & email sequences fire automatically when a quote goes cold. Your team focuses on selling.' },
    { icon: <Star size={16} />, title: 'Review Request Automation', desc: 'After every closed job, the system requests a Google review automatically. No awkward asks.' },
    { icon: <CheckCircle size={16} />, title: 'E-Signature Collection', desc: 'Collect digital signatures in the field. Lock in the job before you leave the driveway.' },
  ];

  return (
    <>
      <SoftwareDemoOverlay
        open={demoOpen}
        onClose={() => { setDemoOpen(false); setDemoStep(0); }}
        ipadSide="left"
        accent="#94D96B"
        steps={QUOTING_STEPS}
        step={demoStep}
        onStep={setDemoStep}
        ipadContent={
          <IpadMockup width="100%" accentGlow="rgba(148,217,107,0.6)">
            <QuotingApp controlledTab={QUOTING_STEPS[demoStep].tab} />
          </IpadMockup>
        }
      />
      <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '100px 0', background: '#0a0f0a', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackground opacity={0.18} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          {/* Left — iPad + demo button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...slideFromLeft(inView, 0) }}>
            <IpadMockup width={560} accentGlow="rgba(148,217,107,0.5)">
              <QuotingApp />
            </IpadMockup>
            <WatchDemoBtn onClick={() => { setDemoStep(0); setDemoOpen(true); }} accent="#94D96B" />
          </div>
          {/* Right — content */}
          <div style={{ ...slideFromRight(inView, 100) }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)', marginBottom: '1.25rem', ...fadeUp(inView, 0) }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94D96B', display: 'block' }} />
              <span style={{ color: '#94D96B', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>QUOTING SOFTWARE</span>
            </div>
            <AnimatedText
              as="h2"
              inView={inView}
              delay={150}
              stagger={75}
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'white', marginBottom: '1rem' }}
            >
              Quote on-site. Track every job. Never lose a follow-up.
            </AnimatedText>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '2rem', ...fadeUp(inView, 500) }}>
              Most contractors lose 40% of quotes because they never follow up. RevCore Quoting eliminates that, with a built-in pipeline, automated sequences, and review requests that run without your team lifting a finger.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {quotingFeatures.map((f, i) => (
                <div key={f.title} style={{ ...scaleUp(inView, 500 + i * 80) }}>
                  <Feature {...f} accent="#94D96B" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

function PresentationSection() {
  const { ref, inView } = useScrollReveal({ threshold: 0.08 });
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const pitchFeatures = [
    { icon: <Monitor size={16} />, title: 'Trade-Specific Decks', desc: 'Built for your exact trade, roofing, HVAC, solar, windows, siding, and more. Not a generic template.' },
    { icon: <Layers size={16} />, title: 'Before & After Comparisons', desc: 'Photo-heavy slides showing the transformation. Homeowners buy emotion, give it to them.' },
    { icon: <FileText size={16} />, title: 'Financing On-Screen', desc: 'Display monthly payment options directly in the presentation. Remove sticker shock on the spot.' },
    { icon: <Star size={16} />, title: 'Built-in Social Proof', desc: 'Reviews, photos, certifications, and warranties presented at the right moment in the pitch flow.' },
    { icon: <CheckCircle size={16} />, title: 'iPad-Ready & Offline', desc: 'Works without internet. No loading screens in the field. Looks flawless on any device.' },
    { icon: <Zap size={16} />, title: 'E-Signature Close', desc: 'Collect a signed contract before you stand up from the kitchen table.' },
  ];

  return (
    <>
      <SoftwareDemoOverlay
        open={demoOpen}
        onClose={() => { setDemoOpen(false); setDemoStep(0); }}
        ipadSide="right"
        accent="#6B8EFE"
        steps={PITCH_STEPS}
        step={demoStep}
        onStep={setDemoStep}
        ipadContent={
          <IpadMockup width="100%" accentGlow="rgba(107,142,254,0.6)">
            <PitchApp controlledSlide={PITCH_STEPS[demoStep].slide} />
          </IpadMockup>
        }
      />
      <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '100px 0', background: '#070b12', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackground opacity={0.18} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          {/* Left — content */}
          <div style={{ ...slideFromLeft(inView, 0) }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(107,142,254,0.1)', border: '1px solid rgba(107,142,254,0.2)', marginBottom: '1.25rem', ...fadeUp(inView, 0) }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6B8EFE', display: 'block' }} />
              <span style={{ color: '#6B8EFE', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>PRESENTATION SOFTWARE</span>
            </div>
            <AnimatedText
              as="h2"
              inView={inView}
              delay={150}
              stagger={75}
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'white', marginBottom: '1rem' }}
            >
              Stand out. Build trust. Win the job.
            </AnimatedText>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '2rem', ...fadeUp(inView, 500) }}>
              Your competitors are showing up with a pen and a brochure. RevCore Pitch puts you in a different category entirely, a custom interactive presentation that makes homeowners feel confident they&apos;re hiring the best.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {pitchFeatures.map((f, i) => (
                <div key={f.title} style={{ ...scaleUp(inView, 500 + i * 80) }}>
                  <Feature {...f} accent="#6B8EFE" />
                </div>
              ))}
            </div>
          </div>
          {/* Right — iPad + demo button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...slideFromRight(inView, 100) }}>
            <IpadMockup width={560} accentGlow="rgba(107,142,254,0.5)">
              <PitchApp />
            </IpadMockup>
            <WatchDemoBtn onClick={() => { setDemoStep(0); setDemoOpen(true); }} accent="#6B8EFE" />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

function IntegrationBanner() {
  const { ref, inView } = useScrollReveal({ threshold: 0.12 });
  return (
    <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '80px 0', background: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackground opacity={0.15} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0f1a10 0%, #0a0f1a 100%)',
          padding: '3.5rem',
          border: '1px solid rgba(255,255,255,0.07)',
          ...fadeUp(inView, 0),
        }}>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '3rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '2px', background: '#94D96B', display: 'block' }} />
                All Connected. All In One.
              </div>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '1rem' }}>
                Every tool routes directly<br />into your RevCore CRM.
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.75', maxWidth: '540px' }}>
                Your website, paid ads, quoting software, presentation app, follow-up sequences, and rehash engine all feed back into one centralized CRM, custom-built for your company. Instead of logging into four different platforms, you see every lead, every touchpoint, and every dollar in one place.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
              {[
                { label: 'Website leads → CRM', color: '#94D96B' },
                { label: 'Paid Ads → CRM', color: '#6B8EFE' },
                { label: 'Quoting Software → CRM', color: '#94D96B' },
                { label: 'Follow-Up Engine → CRM', color: '#FEB64A' },
                { label: 'Rehash Automation → CRM', color: '#FE6462' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom — "all in 1" value prop */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { label: '1 point of contact', sub: 'Not 3–4 vendors. One team that knows your whole business.' },
              { label: '100% custom-built', sub: 'Every pipeline, sequence, and script built for your trade and market.' },
              { label: 'Zero handoff chaos', sub: 'Your ads, software, training, and CRM all speak the same language.' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>{item.label}</div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: '1.6' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftwareCTA() {
  const { ref, inView } = useScrollReveal({ threshold: 0.2 });
  return (
    <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '120px 0', background: '#070b0f', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackground opacity={0.55} />
      <div className="container" style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        <div style={{ ...fadeUp(inView, 0) }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Ready to see it in action?
          </div>
        </div>
        <AnimatedText
          as="h2"
          inView={inView}
          delay={150}
          stagger={70}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}
        >
          Get a live demo. Built for your trade.
        </AnimatedText>
        <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.75', marginBottom: '2.5rem', ...fadeUp(inView, 600) }}>
          We&apos;ll walk you through both tools, show you how they integrate with your business, and have a custom version built for your trade before you hang up.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', ...fadeUp(inView, 750) }}>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'white', color: '#0A0A0A',
            padding: '14px 28px', borderRadius: '100px',
            fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            Book a demo <ArrowRight size={16} />
          </Link>
          <Link href="/services" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 28px', borderRadius: '100px',
            fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
          }}>
            Full growth stack <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function SoftwareHero() {
  const { ref, inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section ref={ref as React.Ref<HTMLElement>} style={{ paddingTop: '160px', paddingBottom: '100px', background: '#070b0f', position: 'relative', overflow: 'hidden' }}>
      {/* Hero background image */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69ab0072c72818a840aca676.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,11,15,0.7) 0%, rgba(7,11,15,0.45) 50%, rgba(7,11,15,0.85) 100%)' }} />
      <SpaceBackground opacity={0.22} />
      <div className="container" style={{ textAlign: 'center', maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
        <div style={{ ...fadeUp(inView, 0) }}>
          <div style={{
            display: 'inline-flex', gap: '8px', marginBottom: '1.5rem',
          }}>
            <span style={{ padding: '4px 14px', borderRadius: '100px', background: 'rgba(148,217,107,0.1)', color: '#94D96B', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(148,217,107,0.2)' }}>
              Quoting Software
            </span>
            <span style={{ padding: '4px 14px', borderRadius: '100px', background: 'rgba(107,142,254,0.1)', color: '#6B8EFE', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(107,142,254,0.2)' }}>
              Presentation Software
            </span>
          </div>
        </div>
        <div style={{ ...fadeUp(inView, 150), marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-0.03em', margin: 0, whiteSpace: 'nowrap',
            background: 'linear-gradient(110deg, #fff 0%, #fff 15%, #6B8EFE 38%, #94D96B 58%, #fff 82%, #fff 100%)',
            backgroundSize: '250% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'gradientShift 12s ease-in-out infinite',
          }}>
            Software that closes jobs.
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.1rem', lineHeight: '1.75', marginBottom: '2.5rem', ...fadeUp(inView, 600) }}>
          Two purpose-built tools that work together, from the first quote to the signed contract and the five-star review.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', ...fadeUp(inView, 750) }}>
          <a href="#quoting" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#94D96B', color: '#0A0A0A',
            padding: '13px 24px', borderRadius: '100px',
            fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            Quoting Software ↓
          </a>
          <a href="#presentation" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#6B8EFE', color: 'white',
            padding: '13px 24px', borderRadius: '100px',
            fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            Presentation Software ↓
          </a>
        </div>
      </div>
    </section>
  );
}

export default function SoftwarePage() {
  return (
    <>
      <SoftwareHero />
      <div id="quoting"><QuotingSection /></div>
      <div id="presentation"><PresentationSection /></div>
      <IntegrationBanner />
      <SoftwareCTA />

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 100% center; }
          50%       { background-position: 0% center; }
        }
        @keyframes demoPulseA {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.7); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 140px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
