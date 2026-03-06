'use client';

import React from 'react';
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

/* ─── Page sections ──────────────────────────────────────────────────────── */
function QuotingSection() {
  const { ref, inView } = useScrollReveal({ threshold: 0.08 });
  const quotingFeatures = [
    { icon: <FileText size={16} />, title: 'On-Site Quote Generation', desc: 'Build accurate, professional proposals at the door with your pricing built in. No office trips.' },
    { icon: <Layers size={16} />, title: 'Good / Better / Best Options', desc: 'Present three tiers on every job, proven to increase average ticket size by 34%.' },
    { icon: <Zap size={16} />, title: 'Job Tracking Pipeline', desc: 'See every quote\'s status at a glance: sent, viewed, followed-up, signed. Nothing slips.' },
    { icon: <Bell size={16} />, title: 'Automated Follow-Up', desc: 'Timed SMS & email sequences fire automatically when a quote goes cold. Your team focuses on selling.' },
    { icon: <Star size={16} />, title: 'Review Request Automation', desc: 'After every closed job, the system requests a Google review automatically. No awkward asks.' },
    { icon: <CheckCircle size={16} />, title: 'E-Signature Collection', desc: 'Collect digital signatures in the field. Lock in the job before you leave the driveway.' },
  ];

  return (
    <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '100px 0', background: '#0a0f0a', position: 'relative', overflow: 'hidden' }}>
      <SpaceBackground opacity={0.18} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          {/* Left — iPad */}
          <div style={{ display: 'flex', justifyContent: 'center', ...slideFromLeft(inView, 0) }}>
            <IpadMockup width={560} accentGlow="rgba(148,217,107,0.5)">
              <QuotingApp />
            </IpadMockup>
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
  );
}

function PresentationSection() {
  const { ref, inView } = useScrollReveal({ threshold: 0.08 });
  const pitchFeatures = [
    { icon: <Monitor size={16} />, title: 'Trade-Specific Decks', desc: 'Built for your exact trade, roofing, HVAC, solar, windows, siding, and more. Not a generic template.' },
    { icon: <Layers size={16} />, title: 'Before & After Comparisons', desc: 'Photo-heavy slides showing the transformation. Homeowners buy emotion, give it to them.' },
    { icon: <FileText size={16} />, title: 'Financing On-Screen', desc: 'Display monthly payment options directly in the presentation. Remove sticker shock on the spot.' },
    { icon: <Star size={16} />, title: 'Built-in Social Proof', desc: 'Reviews, photos, certifications, and warranties presented at the right moment in the pitch flow.' },
    { icon: <CheckCircle size={16} />, title: 'iPad-Ready & Offline', desc: 'Works without internet. No loading screens in the field. Looks flawless on any device.' },
    { icon: <Zap size={16} />, title: 'E-Signature Close', desc: 'Collect a signed contract before you stand up from the kitchen table.' },
  ];

  return (
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
          {/* Right — iPad */}
          <div style={{ display: 'flex', justifyContent: 'center', ...slideFromRight(inView, 100) }}>
            <IpadMockup width={560} accentGlow="rgba(107,142,254,0.5)">
              <PitchApp />
            </IpadMockup>
          </div>
        </div>
      </div>
    </section>
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
      <SpaceBackground opacity={0.10} />
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
            animation: 'gradientShift 5s ease-in-out infinite',
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
