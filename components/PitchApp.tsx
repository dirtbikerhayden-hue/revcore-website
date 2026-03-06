'use client';

import { useState, useEffect } from 'react';

const ACCENT = '#6DBE7A';
const BG = '#0b0e0d';
const SURFACE = 'rgba(15,20,16,0.72)';
const BORDER = 'rgba(255,255,255,0.18)';

const IMAGES = {
  hero:         'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e435618c8d301f06ad52.webp',
  patio:        'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e63b618c8d0881070bf8.jpg',
  gardenBed:    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e5e9665b72d6fe8018b8.jpg',
  nightLight:   'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e573bffadf82d9b864f3.png',
  waterFeature: 'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e573fe8d7f21e17df6ec.jpg',
  lawnInstall:  'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e5e9665b7245918018b7.jpg',
  // gallery order: Patio, Garden Bed, Retaining Wall (none), Lawn Install, Water Feature, Night Lighting
  gallery: [
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e63b618c8d0881070bf8.jpg',
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e5e9665b72d6fe8018b8.jpg',
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e573fe8d7f9f5b7df6eb.jpg',
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e5e9665b7245918018b7.jpg',
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e573fe8d7f21e17df6ec.jpg',
    'https://assets.cdn.filesafe.space/NYlSya2nYSkSnnXEbY2l/media/69a9e573bffadf82d9b864f3.png',
  ],
};

/* ─── Shared components ──────────────────────────────────────────────────── */
function StatusBar({ slide, total, overlay }: { slide: number; total: number; overlay?: boolean }) {
  const dim = overlay ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)';
  return (
    <div style={{
      padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      background: overlay ? 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' : 'transparent',
    }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: overlay ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>9:41</span>
      <span style={{ fontSize: '0.58rem', color: dim, letterSpacing: '0.05em' }}>Premier Grounds</span>
      <span style={{ fontSize: '0.58rem', color: dim, fontVariantNumeric: 'tabular-nums' }}>{slide + 1}/{total}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.54rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>{children}</div>;
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</div>;
}

function SlideWrap({ children, style, bg }: { children: React.ReactNode; style?: React.CSSProperties; bg?: string }) {
  return (
    <div style={{ background: BG, height: '100%', position: 'relative', overflow: 'hidden', ...style }}>
      {bg && (
        <>
          <img src={bg} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,10,0.82)', pointerEvents: 'none', zIndex: 1 }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 2, padding: '40px 16px 14px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {children}
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ padding: '5px 11px', borderRadius: '100px', background: `${color}18`, border: `1px solid ${color}35`, fontSize: '0.57rem', color, fontWeight: 700, display: 'inline-flex' }}>
      {label}
    </div>
  );
}

function ImgBox({ src, label, style }: { src?: string; label?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, position: 'relative', ...style }}>
      {src ? (
        <img src={src} alt={label ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" opacity="0.18">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
            <path d="M21 15l-5-5L5 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {label && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', fontSize: '0.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
    </div>
  );
}

/* ─── Slide 1: Intro ─────────────────────────────────────────────────────── */
function SlideIntro({ slideIdx, total }: { slideIdx: number; total: number }) {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#080e0a' }}>
      {IMAGES.hero ? (
        <img src={IMAGES.hero} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0c1f10 0%, #0a1a0d 100%)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,14,10,0.9) 0%, rgba(8,14,10,0.6) 55%, rgba(8,14,10,0.2) 100%)' }} />
      <StatusBar slide={slideIdx} total={total} overlay />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 22px 20px' }}>
        <SectionLabel>Prepared for the Johnson Family</SectionLabel>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Welcome to<br />Premier Grounds Co.
        </div>
        <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '18px', maxWidth: '255px' }}>
          We design, build, and maintain outdoor spaces that increase your property value and your quality of life.
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Badge label="15+ Years" color={ACCENT} />
          <Badge label="Licensed & Insured" color="#94D96B" />
          <Badge label="5★ Google" color="#FEB64A" />
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 2: About ─────────────────────────────────────────────────────── */
function SlideAbout({ slideIdx, total }: { slideIdx: number; total: number }) {
  const stats = [
    { value: '15+', label: 'Years in business', color: ACCENT },
    { value: '800+', label: 'Projects completed', color: '#6B8EFE' },
    { value: '98%', label: 'Client satisfaction', color: '#FEB64A' },
    { value: '3', label: 'NALP certified crews', color: '#4FC3F7' },
  ];
  return (
    <SlideWrap bg={IMAGES.patio}>
      <StatusBar slide={slideIdx} total={total} />
      <SectionLabel>Who We Are</SectionLabel>
      <SlideHeading>About Premier Grounds</SlideHeading>
      <p style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 14px' }}>
        Founded in 2009, Premier Grounds Co. has built a reputation across the region for transforming ordinary yards into stunning outdoor living spaces, on time and on budget.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '12px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20`, borderRadius: '10px', padding: '10px 11px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Badge label="NALP Member" color={ACCENT} />
        <Badge label="BBB A+" color="#94D96B" />
        <Badge label="Fully Insured" color="rgba(255,255,255,0.4)" />
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 3: Process Overview ──────────────────────────────────────────── */
function SlideProcess({ slideIdx, total }: { slideIdx: number; total: number }) {
  const steps = [
    { n: '01', title: 'Design Consultation', desc: 'We listen to your vision and create a custom plan.', color: ACCENT },
    { n: '02', title: 'Site Assessment', desc: 'Soil testing, grading review, and utility markings.', color: '#6B8EFE' },
    { n: '03', title: 'Installation', desc: 'Our crew transforms your yard with precision.', color: '#FEB64A' },
    { n: '04', title: 'Finishing & Care Plan', desc: 'Cleanup, walkthrough, and your maintenance roadmap.', color: '#4FC3F7' },
  ];
  return (
    <SlideWrap bg={IMAGES.lawnInstall}>
      <StatusBar slide={slideIdx} total={total} />
      <SectionLabel>How It Works</SectionLabel>
      <SlideHeading>Our 4-Step Process</SlideHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
        {steps.map((s) => (
          <div key={s.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 11px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '11px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', fontWeight: 800, color: s.color, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>{s.title}</div>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 4: Step 1 — Design & Consultation ────────────────────────────── */
function SlideStepDesign({ slideIdx, total }: { slideIdx: number; total: number }) {
  const points = ['3D landscape rendering included', 'Plant and material selection guide', 'Detailed project timeline', 'Full cost breakdown before any work begins'];
  return (
    <SlideWrap bg={IMAGES.gardenBed}>
      <StatusBar slide={slideIdx} total={total} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: ACCENT }}>01</div>
        <SectionLabel>Step One</SectionLabel>
      </div>
      <SlideHeading>Design &amp; Consultation</SlideHeading>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
        {points.map((p) => (
          <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '9px 11px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: '3px' }} />
            <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '9px 11px', background: `${ACCENT}0c`, border: `1px solid ${ACCENT}20`, borderRadius: '10px' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: ACCENT, marginBottom: '2px' }}>Complimentary consultation</div>
        <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>No commitment required. We'll present your design and quote at no charge.</div>
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 5: Step 2 — Site Assessment ─────────────────────────────────── */
function SlideSiteAssessment({ slideIdx, total }: { slideIdx: number; total: number }) {
  const checks = [
    { label: 'Soil composition & pH testing', done: true },
    { label: 'Drainage & grading evaluation', done: true },
    { label: 'Utility & irrigation mapping', done: true },
    { label: 'Sun exposure & microclimate study', done: true },
    { label: 'Existing plant & tree assessment', done: true },
  ];
  return (
    <SlideWrap bg={IMAGES.patio}>
      <StatusBar slide={slideIdx} total={total} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'rgba(107,142,254,0.14)', border: '1px solid rgba(107,142,254,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: '#6B8EFE' }}>02</div>
        <SectionLabel>Step Two</SectionLabel>
      </div>
      <SlideHeading>Site Assessment</SlideHeading>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {checks.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 11px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.65)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.55 }}>
        Our assessment ensures we build the right solution for your specific property, not a generic plan.
      </p>
    </SlideWrap>
  );
}

/* ─── Slide 6: Step 3 — Installation ────────────────────────────────────── */
function SlideInstallation({ slideIdx, total }: { slideIdx: number; total: number }) {
  const services = [
    { label: 'Hardscaping', sub: 'Patios, walkways, retaining walls', color: '#FEB64A' },
    { label: 'Softscaping', sub: 'Trees, shrubs, perennials, sod', color: ACCENT },
    { label: 'Irrigation', sub: 'Smart drip & sprinkler systems', color: '#6B8EFE' },
    { label: 'Lighting', sub: 'Low-voltage landscape lighting', color: '#4FC3F7' },
  ];
  return (
    <SlideWrap bg={IMAGES.lawnInstall}>
      <StatusBar slide={slideIdx} total={total} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'rgba(254,182,74,0.14)', border: '1px solid rgba(254,182,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: '#FEB64A' }}>03</div>
        <SectionLabel>Step Three</SectionLabel>
      </div>
      <SlideHeading>Installation</SlideHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', flex: 1 }}>
        {services.map((s) => (
          <div key={s.label} style={{ padding: '11px', background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: '11px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginBottom: '8px' }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.45 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '9px', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>
        All installations use commercial-grade materials with manufacturer warranties passed directly to you.
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 7: Step 4 — Finishing & Care Plan ───────────────────────────── */
function SlideFinishing({ slideIdx, total }: { slideIdx: number; total: number }) {
  const plans = [
    { label: 'Basic', price: '$89/mo', items: 'Monthly mow & edge, seasonal cleanup', color: 'rgba(255,255,255,0.35)' },
    { label: 'Standard', price: '$149/mo', items: 'Bi-weekly service, fertilization, weed control', color: '#FEB64A' },
    { label: 'Premier', price: '$229/mo', items: 'Weekly service, irrigation monitoring, priority scheduling', color: ACCENT },
  ];
  const [selected, setSelected] = useState(1);
  return (
    <SlideWrap bg={IMAGES.nightLight}>
      <StatusBar slide={slideIdx} total={total} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'rgba(79,195,247,0.14)', border: '1px solid rgba(79,195,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: '#4FC3F7' }}>04</div>
        <SectionLabel>Step Four</SectionLabel>
      </div>
      <SlideHeading>Finishing &amp; Care Plan</SlideHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
        {plans.map((p, i) => (
          <div
            key={p.label}
            onClick={() => setSelected(i)}
            style={{ padding: '10px 12px', borderRadius: '11px', cursor: 'pointer', background: selected === i ? `${p.color}10` : SURFACE, border: `1.5px solid ${selected === i ? p.color + '45' : BORDER}`, transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected === i && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: selected === i ? p.color : 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{p.label}</div>
              <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{p.items}</div>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: selected === i ? p.color : 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em' }}>{p.price}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: '9px 0 0', fontSize: '0.57rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
        Cancel or adjust any time. No long-term contracts required.
      </p>
    </SlideWrap>
  );
}

/* ─── Slide 8: Gallery ───────────────────────────────────────────────────── */
function SlideGallery({ slideIdx, total }: { slideIdx: number; total: number }) {
  const projects = [
    { label: 'Patio Design', src: IMAGES.gallery[0] },
    { label: 'Garden Bed', src: IMAGES.gallery[1] },
    { label: 'Retaining Wall', src: IMAGES.gallery[2] },
    { label: 'Lawn Install', src: IMAGES.gallery[3] },
    { label: 'Water Feature', src: IMAGES.gallery[4] },
    { label: 'Night Lighting', src: IMAGES.gallery[5] },
  ];
  return (
    <SlideWrap bg={IMAGES.waterFeature}>
      <StatusBar slide={slideIdx} total={total} />
      <SectionLabel>Our Work</SectionLabel>
      <SlideHeading>Project Gallery</SlideHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '6px', flex: 1, minHeight: 0 }}>
        {projects.map((p) => (
          <ImgBox key={p.label} src={p.src} label={p.label} style={{ height: '100%' }} />
        ))}
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 9: Reviews ───────────────────────────────────────────────────── */
function SlideReviews({ slideIdx, total }: { slideIdx: number; total: number }) {
  const reviews = [
    { name: 'Karen L.', initials: 'KL', text: "Premier Grounds completely transformed our backyard. The patio and lighting are stunning, better than we imagined.", stars: 5 },
    { name: 'Tom & Rita M.', initials: 'TR', text: "Professional from day one. They finished two days early and left our yard spotless. We've already referred three neighbors.", stars: 5 },
    { name: 'David P.', initials: 'DP', text: "Best landscaping investment I've ever made. The maintenance plan keeps everything looking brand new year-round.", stars: 5 },
  ];
  return (
    <SlideWrap bg={IMAGES.gardenBed}>
      <StatusBar slide={slideIdx} total={total} />
      <SectionLabel>What Homeowners Say</SectionLabel>
      <SlideHeading>Real Reviews</SlideHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
        {reviews.map((r) => (
          <div key={r.name} style={{ padding: '10px 12px', background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
            <div style={{ width: '27px', height: '27px', borderRadius: '50%', background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.47rem', color: ACCENT, fontWeight: 800, flexShrink: 0 }}>{r.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{r.name}</span>
                <span style={{ fontSize: '0.58rem', color: '#FEB64A', letterSpacing: '0.04em' }}>{'★'.repeat(r.stars)}</span>
              </div>
              <p style={{ fontSize: '0.59rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0 }}>"{r.text}"</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

/* ─── Slide 10: Sign ─────────────────────────────────────────────────────── */
function SlideSign({ slideIdx, total }: { slideIdx: number; total: number }) {
  const [signed, setSigned] = useState(false);
  const rows = [
    ['Package', 'Premier Install + Standard Care'],
    ['Project Total', '$14,800'],
    ['Monthly Care', '$149/mo'],
    ['Start Date', 'Mon, April 7'],
    ['Warranty', '2-yr labor + manufacturer materials'],
  ];
  return (
    <SlideWrap bg={IMAGES.nightLight}>
      <StatusBar slide={slideIdx} total={total} />
      <SectionLabel>Ready to Get Started?</SectionLabel>
      <SlideHeading>Authorize &amp; Sign</SlideHeading>
      <div style={{ padding: '10px 12px', background: SURFACE, borderRadius: '12px', marginBottom: '10px', border: `1px solid ${BORDER}` }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.62rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>{k}</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div
        onClick={() => setSigned(true)}
        style={{ border: `1.5px dashed ${signed ? ACCENT : 'rgba(255,255,255,0.12)'}`, borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer', background: signed ? `${ACCENT}0c` : 'transparent', transition: 'all 0.3s', marginBottom: '9px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}
      >
        {signed ? (
          <>
            <div style={{ fontSize: '1.1rem', fontStyle: 'italic', color: ACCENT, fontFamily: 'Georgia, serif' }}>M. Johnson</div>
            <div style={{ fontSize: '0.54rem', color: `${ACCENT}80` }}>✓ Signed digitally</div>
          </>
        ) : (
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>Tap to sign here</div>
        )}
      </div>
      {signed && (
        <button style={{ width: '100%', padding: '11px', borderRadius: '10px', background: ACCENT, border: 'none', color: '#080e0a', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
          ✓ Submit &amp; Schedule
        </button>
      )}
    </SlideWrap>
  );
}

/* ─── Slide registry ─────────────────────────────────────────────────────── */
const SLIDE_COUNT = 10;

function renderSlide(idx: number) {
  const props = { slideIdx: idx, total: SLIDE_COUNT };
  switch (idx) {
    case 0: return <SlideIntro {...props} />;
    case 1: return <SlideAbout {...props} />;
    case 2: return <SlideProcess {...props} />;
    case 3: return <SlideStepDesign {...props} />;
    case 4: return <SlideSiteAssessment {...props} />;
    case 5: return <SlideInstallation {...props} />;
    case 6: return <SlideFinishing {...props} />;
    case 7: return <SlideGallery {...props} />;
    case 8: return <SlideReviews {...props} />;
    case 9: return <SlideSign {...props} />;
    default: return null;
  }
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function PitchApp({ controlledSlide }: { controlledSlide?: number } = {}) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const isControlled = controlledSlide !== undefined;
  useEffect(() => {
    if (controlledSlide !== undefined) {
      setDir(controlledSlide > slide ? 1 : -1);
      setSlide(controlledSlide);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledSlide]);

  const go = (idx: number) => { setDir(idx > slide ? 1 : -1); setSlide(idx); };
  const prev = () => slide > 0 && go(slide - 1);
  const next = () => slide < SLIDE_COUNT - 1 && go(slide + 1);

  return (
    <div style={{ background: BG, fontFamily: '-apple-system, "DM Sans", sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div key={slide} style={{ height: '100%', animation: `pitchSlide${dir > 0 ? 'In' : 'Back'} 0.3s cubic-bezier(0.22,1,0.36,1)` }}>
          {renderSlide(slide)}
        </div>
      </div>

      {/* Nav bar — hidden in controlled/demo mode */}
      {!isControlled && <div style={{ background: 'rgba(11,14,13,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={prev} disabled={slide === 0}
          style={{ width: '32px', height: '32px', borderRadius: '9px', background: slide === 0 ? 'rgba(255,255,255,0.02)' : SURFACE, border: `1px solid ${slide === 0 ? 'rgba(255,255,255,0.05)' : BORDER}`, color: slide === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.65)', fontSize: '0.95rem', cursor: slide === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >‹</button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i} onClick={() => go(i)}
              style={{ width: i === slide ? '18px' : '5px', height: '5px', borderRadius: '100px', background: i === slide ? ACCENT : 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          ))}
        </div>

        <button
          onClick={next} disabled={slide === SLIDE_COUNT - 1}
          style={{ width: '32px', height: '32px', borderRadius: '9px', background: slide === SLIDE_COUNT - 1 ? 'rgba(255,255,255,0.02)' : `${ACCENT}25`, border: `1px solid ${slide === SLIDE_COUNT - 1 ? 'rgba(255,255,255,0.05)' : ACCENT + '40'}`, color: slide === SLIDE_COUNT - 1 ? 'rgba(255,255,255,0.15)' : ACCENT, fontSize: '0.95rem', cursor: slide === SLIDE_COUNT - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >›</button>
      </div>}

      <style>{`
        @keyframes pitchSlideIn   { from { opacity:0; transform:translateX(18px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes pitchSlideBack { from { opacity:0; transform:translateX(-18px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}
