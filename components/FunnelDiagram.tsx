'use client';
import { useState, useRef } from 'react';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const CW = 1820;
const CH = 1560;

// ─── Funnel geometry ──────────────────────────────────────────────────────────
const FC   = 490;   // funnel center x
const FTW  = 270;   // top half-width
const FBW  = 42;    // bottom half-width
const FSY  = 310;   // funnel top y
const FRH  = 108;   // row height
const NS   = 7;     // stages

function sg(i: number) {
  const t  = i / (NS - 1);
  const hw = FTW + t * (FBW - FTW);
  return { y: FSY + i * FRH, xl: FC - hw, xr: FC + hw, hw, midY: FSY + i * FRH + FRH / 2 };
}

const FUNNEL_BOT_Y = FSY + NS * FRH; // y below last stage

// ─── Colour helpers ───────────────────────────────────────────────────────────
const w = (a: number) => `rgba(255,255,255,${a})`;
const ACCENT  = '#FE6462';
const GREEN   = '#94D96B';
const BLUE    = '#6B8EFE';
const YELLOW  = '#FEB64A';

// ─── Stage data ───────────────────────────────────────────────────────────────
const stages = [
  {
    emotion: 'INTEREST +\nEMOTION',
    touchpoint: 'FIRST CONTACT',
    color: ACCENT,
    items: ['20–40 page website', 'Home · Services · Service Areas', 'On-page SEO & keyword copy'],
  },
  {
    emotion: 'EMOTION +\nCONNECTION',
    touchpoint: 'LANDING',
    color: ACCENT,
    items: ['Service explanation', 'Portfolio & photos', 'Testimonials & trust signals'],
  },
  {
    emotion: 'EMOTION +\nCOMMITMENT',
    touchpoint: 'QUALIFICATION',
    color: YELLOW,
    items: ['Quiz funnel → highest conversion rate', 'Location · Budget · Scope · Interest'],
  },
  {
    emotion: 'COMMITMENT',
    touchpoint: '',
    color: YELLOW,
    items: ['CTA: Contact form / Call now', 'Increase daily ad spend here →'],
  },
  {
    emotion: 'COMMITMENT +\nEXCITEMENT',
    touchpoint: 'LEADS',
    color: GREEN,
    items: ['Full name · Phone · Email', 'Home address · Scheduled timeslot'],
  },
  {
    emotion: 'EXCITEMENT +\nTRUST',
    touchpoint: 'CONTACT',
    color: GREEN,
    items: ['Email: thanks for applying', 'SMS intro · Calendar confirm', 'AI outbound call · Show rate reminders'],
  },
  {
    emotion: 'COMMITMENT +\nTRUST',
    touchpoint: 'APPOINTMENT',
    color: BLUE,
    items: ['Sales training & close rate tracking', 'In-home presentation & close'],
  },
];

// ─── Reusable card ────────────────────────────────────────────────────────────
function Card({
  x, y, w: width, h: height, accent: ac = w(0.07), bg = '#161b22', r = 14,
  children,
}: {
  x: number; y: number; w: number; h?: number;
  accent?: string; bg?: string; r?: number; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width, height,
      background: bg, border: `1px solid ${ac}`,
      borderRadius: r, padding: 20, boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Txt({
  x, y, size = 11, weight = 600, color = w(0.85), children, align = 'left', width, lh = 1.45,
}: {
  x: number; y: number; size?: number; weight?: number; color?: string;
  children: React.ReactNode; align?: 'left'|'center'|'right'; width?: number; lh?: number;
}) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, fontSize: size, fontWeight: weight,
      color, fontFamily: 'DM Sans, sans-serif', lineHeight: lh,
      textAlign: align, width, whiteSpace: 'pre-wrap',
    }}>
      {children}
    </div>
  );
}

// ─── Dot ─────────────────────────────────────────────────────────────────────
function Dot({ x, y, color = ACCENT, size = 7 }: { x: number; y: number; color?: string; size?: number }) {
  return <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: color }} />;
}

// ─── Pill ────────────────────────────────────────────────────────────────────
function Pill({ x, y, label, color = ACCENT }: { x: number; y: number; label: string; color?: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 100, padding: '3px 10px',
      color, fontSize: 9, fontWeight: 700,
      fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.09em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

// ─── Bullet list ─────────────────────────────────────────────────────────────
function Bullets({ items, color = GREEN, size = 10.5 }: { items: string[]; color?: string; size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
          <span style={{ fontSize: size, color: w(0.6), fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main diagram ─────────────────────────────────────────────────────────────
export default function FunnelDiagram() {
  const [zoom, setZoom]     = useState(0.68);
  const [pan, setPan]       = useState({ x: 10, y: 16 });
  const [dragging, setDrag] = useState(false);
  const drag = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const viewRef = useRef<HTMLDivElement>(null);

  function onDown(e: React.MouseEvent) {
    setDrag(true);
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }
  function onMove(e: React.MouseEvent) {
    if (!dragging) return;
    setPan({ x: drag.current.px + e.clientX - drag.current.sx, y: drag.current.py + e.clientY - drag.current.sy });
  }
  function onUp() { setDrag(false); }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.max(0.28, Math.min(2, z - e.deltaY * 0.0008)));
  }
  function reset() { setZoom(0.68); setPan({ x: 10, y: 16 }); }

  // Build funnel SVG polygon points
  const funnelPts = [
    ...Array.from({ length: NS }, (_, i) => { const g = sg(i); return `${g.xl},${g.y}`; }),
    `${FC},${FUNNEL_BOT_Y}`,
    ...Array.from({ length: NS }, (_, i) => { const g = sg(NS - 1 - i); return `${g.xr},${g.y}`; }),
  ].join(' ');

  const dividerLines = Array.from({ length: NS - 1 }, (_, i) => {
    const top = sg(i);
    const bot = sg(i + 1);
    return { x1: top.xl, x2: top.xr, y: bot.y };
  });

  return (
    <div style={{ background: '#0d1117', borderRadius: 20, overflow: 'hidden', border: `1px solid ${w(0.07)}` }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 20px', background: '#161b22', borderBottom: `1px solid ${w(0.06)}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dot x={8} y={8} color={ACCENT} size={8} />
          <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: '0.9rem', color: 'white', position: 'relative', left: 4 }}>
            RevCore Marketing System
          </span>
          <span style={{
            fontSize: '0.7rem', color: w(0.35), background: w(0.05),
            padding: '2px 8px', borderRadius: 100, marginLeft: 4,
          }}>
            Interactive Funnel
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: w(0.3), marginRight: 6 }}>Scroll to zoom · Drag to pan</span>
          {([
            { lbl: '−', fn: () => setZoom(z => Math.max(0.28, z - 0.1)) },
            { lbl: `${Math.round(zoom * 100)}%`, fn: undefined },
            { lbl: '+', fn: () => setZoom(z => Math.min(2, z + 0.1)) },
            { lbl: 'Reset', fn: reset },
          ] as { lbl: string; fn: (() => void) | undefined }[]).map((b, i) => (
            <button key={i} onClick={b.fn} style={{
              background: w(0.06), border: `1px solid ${w(0.1)}`,
              borderRadius: 7, color: w(0.7), fontSize: '0.75rem', fontWeight: 600,
              padding: '4px 10px', cursor: b.fn ? 'pointer' : 'default',
              minWidth: b.lbl === 'Reset' ? 50 : 30,
            }}>
              {b.lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Viewport ── */}
      <div
        ref={viewRef}
        style={{ height: 720, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}
      >
        <div style={{
          position: 'absolute', width: CW, height: CH,
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0', userSelect: 'none',
        }}>

          {/* ── Grid ── */}
          <svg style={{ position: 'absolute', inset: 0, width: CW, height: CH, pointerEvents: 'none' }}>
            {Array.from({ length: Math.ceil(CW / 56) }, (_, i) => (
              <line key={`v${i}`} x1={i * 56} y1={0} x2={i * 56} y2={CH} stroke={w(0.028)} strokeWidth={1} />
            ))}
            {Array.from({ length: Math.ceil(CH / 56) }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 56} x2={CW} y2={i * 56} stroke={w(0.028)} strokeWidth={1} />
            ))}
          </svg>

          {/* ══════════════════════════════════════════════════════════════════
              TOP OF FUNNEL BOX
          ══════════════════════════════════════════════════════════════════ */}
          <Card x={220} y={8} w={920} h={280} bg="#131820" accent={`${ACCENT}22`} r={16}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 2, background: ACCENT }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.01em' }}>
                TOP OF FUNNEL: Impressions & Digital Presence
              </span>
            </div>
            <p style={{ fontSize: 10.5, color: w(0.4), marginBottom: 16, lineHeight: 1.5, maxWidth: 680 }}>
              This part of the funnel gets wider as your digital presence expands. Things that make it wider: paid ads, better SEO, social media presence, press releases, etc.
            </p>

            {/* Two channel cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* SEO / Website */}
              <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, border: `1px solid ${w(0.06)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    THE SNIPER — SEO / Websites
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 9, color: GREEN, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>PROS</p>
                    <p style={{ fontSize: 9.5, color: w(0.5), lineHeight: 1.5 }}>Precise · High intent · More "damage" · Cheaper long-term</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>CONS</p>
                    <p style={{ fontSize: 9.5, color: w(0.5), lineHeight: 1.5 }}>Slower to build · Lower initial volume</p>
                  </div>
                </div>
                <Bullets items={['20–40 page website', 'Home · Services · Service Areas', 'On-page SEO, title tags, H1s', 'Keyword-optimised copy']} color={ACCENT} size={9.5} />
              </div>

              {/* Meta Ads */}
              <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, border: `1px solid ${w(0.06)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: BLUE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    THE MACHINE GUN — Meta Ads
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 9, color: GREEN, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>PROS</p>
                    <p style={{ fontSize: 9.5, color: w(0.5), lineHeight: 1.5 }}>Fast results · Broad reach · Higher volume</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>CONS</p>
                    <p style={{ fontSize: 9.5, color: w(0.5), lineHeight: 1.5 }}>More expensive · Lower intent · Bullet impact varies</p>
                  </div>
                </div>
                <Bullets items={['Campaigns per service', 'Ad creatives: videos & images', 'Ad copy: short, medium, long', 'Multiple ads · A/B testing']} color={BLUE} size={9.5} />
              </div>
            </div>
          </Card>

          {/* Connector lines from top-of-funnel box to funnel */}
          <svg style={{ position: 'absolute', inset: 0, width: CW, height: CH, pointerEvents: 'none' }}>
            <line x1={FC} y1={288} x2={FC} y2={FSY} stroke={`${ACCENT}40`} strokeWidth={1.5} strokeDasharray="5 4" />
          </svg>

          {/* ══════════════════════════════════════════════════════════════════
              LEFT EMOTION LABELS
          ══════════════════════════════════════════════════════════════════ */}
          {stages.map((s, i) => {
            const g = sg(i);
            return (
              <div key={`em${i}`} style={{
                position: 'absolute',
                left: 0, top: g.y,
                width: 210, height: FRH,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '0 8px 0 4px',
                borderRight: `2px solid ${s.color}30`,
              }}>
                {/* Connector arrow */}
                <svg style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}>
                  <line x1={0} y1={0} x2={16} y2={0} stroke={`${s.color}50`} strokeWidth={1.5} />
                  <polygon points="16,-3 22,0 16,3" fill={`${s.color}50`} />
                </svg>

                <p style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'pre-wrap', lineHeight: 1.4, marginBottom: 4 }}>
                  {s.emotion}
                </p>
                {s.touchpoint && (
                  <div style={{
                    background: `${s.color}14`, border: `1px solid ${s.color}35`,
                    borderRadius: 100, padding: '2px 8px', display: 'inline-flex',
                  }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: s.color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      → {s.touchpoint}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════════
              FUNNEL SVG
          ══════════════════════════════════════════════════════════════════ */}
          <svg style={{ position: 'absolute', inset: 0, width: CW, height: CH, pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.13" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Main funnel shape */}
            <polygon points={funnelPts} fill="url(#fg)" stroke={`${ACCENT}35`} strokeWidth={1.5} />

            {/* Stage dividers */}
            {dividerLines.map((d, i) => (
              <line key={i} x1={d.x1} y1={d.y} x2={d.x2} y2={d.y} stroke={`${ACCENT}18`} strokeWidth={1} strokeDasharray="5 4" />
            ))}
          </svg>

          {/* ══════════════════════════════════════════════════════════════════
              STAGE CONTENT (inside funnel)
          ══════════════════════════════════════════════════════════════════ */}
          {stages.map((s, i) => {
            const g = sg(i);
            const innerW = g.xr - g.xl - 24;
            return (
              <div key={`sc${i}`} style={{
                position: 'absolute',
                left: g.xl + 12, top: g.y + 6,
                width: innerW, height: FRH - 12,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                {s.touchpoint && (
                  <p style={{
                    fontFamily: 'DM Sans', fontWeight: 800, fontSize: Math.max(8.5, 12 - i * 0.5),
                    color: s.color, letterSpacing: '-0.01em', marginBottom: 4,
                    textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {s.touchpoint}
                  </p>
                )}
                {i < 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {s.items.slice(0, i < 3 ? 3 : 2).map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: `${s.color}70`, flexShrink: 0, marginTop: 3 }} />
                        <span style={{ fontSize: Math.max(8, 10 - i), color: w(0.45), lineHeight: 1.4, fontFamily: 'DM Sans' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT PANEL — Data Tracking
          ══════════════════════════════════════════════════════════════════ */}
          <Card x={790} y={FSY} w={350} h={340} bg="#131820" accent={`${GREEN}22`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10, color: GREEN, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Data Tracking, Analysing & Iteration
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* SEO column */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.5), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>SEO</p>
                <Bullets items={['Google Analytics', 'Keywords', 'Search terms', 'Traffic']} color={GREEN} size={9.5} />
              </div>
              {/* Meta column */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.5), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>META</p>
                <Bullets items={['A/B creative testing', 'A/B copy testing', 'Angle testing']} color={BLUE} size={9.5} />
              </div>
            </div>

            <div style={{ height: 1, background: w(0.06), margin: '14px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Website */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.5), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>WEBSITE</p>
                <Bullets items={['Heat map analysis', 'Offer testing', 'Copy testing']} color={YELLOW} size={9.5} />
              </div>
              {/* Key metrics */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.5), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>KEY METRICS</p>
                <Bullets items={['CPA (cost per appointment)', 'CPC (cost per click)', 'CPL (cost per lead)', 'CPM (cost per 1,000 impressions)']} color={ACCENT} size={9} />
              </div>
            </div>
          </Card>

          {/* Adspend callout */}
          <Card x={790} y={FSY + 355} w={350} h={100} bg="#131820" accent={`${YELLOW}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: YELLOW }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10, color: YELLOW, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Scaling Strategy
              </span>
            </div>
            <p style={{ fontSize: 10, color: w(0.5), lineHeight: 1.6 }}>
              As conversion rate improves → increase daily ad spend to flood the top of the funnel with more qualified leads.
            </p>
          </Card>

          {/* ══════════════════════════════════════════════════════════════════
              FUNNEL BOTTOM POINT CONNECTOR
          ══════════════════════════════════════════════════════════════════ */}
          <svg style={{ position: 'absolute', inset: 0, width: CW, height: CH, pointerEvents: 'none' }}>
            <line x1={FC} y1={FUNNEL_BOT_Y} x2={FC} y2={FUNNEL_BOT_Y + 36} stroke={`${BLUE}50`} strokeWidth={2} />
            <polygon points={`${FC - 7},${FUNNEL_BOT_Y + 36} ${FC + 7},${FUNNEL_BOT_Y + 36} ${FC},${FUNNEL_BOT_Y + 46}`} fill={`${BLUE}50`} />
          </svg>

          {/* ══════════════════════════════════════════════════════════════════
              CONVERSION OPTIMISATION SYSTEMS
          ══════════════════════════════════════════════════════════════════ */}
          <Card x={220} y={FUNNEL_BOT_Y + 54} w={920} h={220} bg="#131820" accent={`${GREEN}22`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ background: GREEN, color: '#0d1117', borderRadius: 100, padding: '2px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                STEP 2
              </div>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: 14, color: 'white', letterSpacing: '-0.01em' }}>
                Conversion Optimisation Systems (GHL)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Immediate', color: ACCENT, items: ['Email: thanks for applying', 'Training for applying', 'SMS intro', 'Calendar confirmation'] },
                { label: 'AI Layer', color: BLUE, items: ['AI agent outbound call', 'In-commitment follow-up', 'Qualification check'] },
                { label: 'Reminders', color: YELLOW, items: ['Email & SMS confirmation', 'Show rate reminders', 'Social proof messages'] },
                { label: 'Rehash Engine™', color: GREEN, items: ['Old lead re-engagement', 'Automated follow-up sequences', 'Win-back campaigns'] },
              ].map((col, i) => (
                <div key={i}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: col.color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{col.label}</p>
                  <Bullets items={col.items} color={col.color} size={9.5} />
                </div>
              ))}
            </div>
          </Card>

          {/* PROJECT / NEW CLIENTS */}
          <Card x={220} y={FUNNEL_BOT_Y + 290} w={440} h={140} bg="#131820" accent={`${BLUE}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ background: BLUE, color: '#0d1117', borderRadius: 100, padding: '2px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                STEP 3
              </div>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: 13, color: 'white' }}>
                Project & Onboarding
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Bullets items={['Feedback form', 'Thanks for booking page', 'Intro call / project start']} color={BLUE} size={10} />
              <div>
                <div style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}35`, borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: GREEN, letterSpacing: '0.06em', marginBottom: 3 }}>NEW CLIENTS</p>
                  <p style={{ fontSize: 10, color: w(0.6) }}>Revenue closed & tracked</p>
                </div>
                <div style={{ background: `${YELLOW}15`, border: `1px solid ${YELLOW}35`, borderRadius: 10, padding: '8px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: YELLOW, letterSpacing: '0.06em', marginBottom: 3 }}>⭐ 5-STAR REVIEW</p>
                  <p style={{ fontSize: 10, color: w(0.6) }}>Automated review request</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════════
              FAR RIGHT — SEO INFO PANELS
          ══════════════════════════════════════════════════════════════════ */}
          <Card x={1162} y={8} w={650} h={530} bg="#131820" accent={`${BLUE}22`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: BLUE }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: BLUE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SEO-Optimised Website Page Layout
              </span>
            </div>

            {[
              {
                title: 'Home Page',
                desc: 'Ranks on search when people search the company name directly. Primary trust and brand anchor page.',
                color: BLUE,
              },
              {
                title: 'Service Pages',
                desc: 'One page per service offered, built to rank on "near me" searches. The more services your client has, the more pages needed.',
                color: GREEN,
              },
              {
                title: 'Service Area Pages',
                desc: 'Ranks on search for geo-specific queries like "Brickell Miami Roofing" or "Miami Beach Roofing". You want to rank in all service areas — not just the "near me" area. Larger areas need more pages.',
                color: YELLOW,
              },
              {
                title: 'The Goal',
                desc: 'Pages that match lots of popular search terms to capture full-circle SEO presence. More pages = more surface area = more leads.',
                color: ACCENT,
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < 3 ? `1px solid ${w(0.05)}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: w(0.9) }}>{item.title}</span>
                </div>
                <p style={{ fontSize: 10.5, color: w(0.45), lineHeight: 1.65, paddingLeft: 12 }}>{item.desc}</p>
              </div>
            ))}
          </Card>

          <Card x={1162} y={550} w={650} h={200} bg="#131820" accent={`${ACCENT}22`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SEO Simulator Tool
              </span>
            </div>
            <p style={{ fontSize: 11, color: w(0.5), lineHeight: 1.65, marginBottom: 14 }}>
              Use this site to simulate how your client appears in search results. Screenshot the results and use them in the sales presentation to show the gap between them and competitors.
            </p>
            <div style={{ background: w(0.04), border: `1px solid ${w(0.08)}`, borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: w(0.35), letterSpacing: '0.06em', marginBottom: 4 }}>TOOL URL</p>
              <p style={{ fontSize: 10.5, color: BLUE, fontWeight: 600 }}>
                totheweb.com/learning-center/tools-search-engine-simulator
              </p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
