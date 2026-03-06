'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Canvas ───────────────────────────────────────────────────────────────────
const CW  = 1820;
const CH  = 1580;

// ─── Funnel geometry ──────────────────────────────────────────────────────────
const FC  = 490;   // center x
const FTW = 272;   // top half-width
const FBW = 44;    // bottom half-width
const FSY = 312;   // funnel top y
const FRH = 110;   // row height
const NS  = 7;     // stages

function sg(i: number) {
  const t  = i / (NS - 1);
  const hw = FTW + t * (FBW - FTW);
  return { y: FSY + i * FRH, xl: FC - hw, xr: FC + hw, hw, midY: FSY + i * FRH + FRH / 2 };
}
const FUNNEL_BOT_Y = FSY + NS * FRH;

// ─── Colours ──────────────────────────────────────────────────────────────────
const w      = (a: number) => `rgba(255,255,255,${a})`;
const ACCENT = '#FE6462';
const GREEN  = '#94D96B';
const BLUE   = '#6B8EFE';
const YELLOW = '#FEB64A';

// ─── Stage data ───────────────────────────────────────────────────────────────
const stages = [
  { emotion: 'INTEREST +\nEMOTION',      touchpoint: 'FIRST CONTACT', color: ACCENT,
    items: ['20–40 page website', 'Home · Services · Service Areas', 'On-page SEO & keyword copy'] },
  { emotion: 'EMOTION +\nCONNECTION',    touchpoint: 'LANDING',       color: ACCENT,
    items: ['Service explanation', 'Portfolio & photos', 'Testimonials & trust signals'] },
  { emotion: 'EMOTION +\nCOMMITMENT',   touchpoint: 'QUALIFICATION',  color: YELLOW,
    items: ['Quiz funnel → highest conversion rate', 'Location · Budget · Scope · Interest'] },
  { emotion: 'COMMITMENT',               touchpoint: 'CTA',            color: YELLOW,
    items: ['CTA: Contact form / Call now'] },
  { emotion: 'COMMITMENT +\nEXCITEMENT',touchpoint: 'LEADS',          color: GREEN,
    items: ['Full name · Phone · Email', 'Home address · Scheduled timeslot'] },
  { emotion: 'EXCITEMENT +\nTRUST',      touchpoint: 'CONTACT',        color: GREEN,
    items: ['Email: thanks for applying', 'SMS intro · Calendar confirm', 'AI outbound · Show rate reminders'] },
  { emotion: 'COMMITMENT +\nTRUST',      touchpoint: 'APPOINTMENT',    color: BLUE,
    items: ['Sales training & close rate', 'In-home presentation & close'] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Card({ x, y, w: width, h: height, accent: ac = w(0.07), bg = '#161b22', r = 14, children }: {
  x: number; y: number; w: number; h?: number; accent?: string; bg?: string; r?: number; children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, background: bg, border: `1px solid ${ac}`, borderRadius: r, padding: 20, boxSizing: 'border-box', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

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

// ─── Main component ───────────────────────────────────────────────────────────
export default function FunnelDiagram() {
  const [zoom, setZoom]         = useState(0.68);
  const [pan, setPan]           = useState({ x: 10, y: 16 });
  const [dragging, setDrag]     = useState(false);
  const [activeStage, setActive]= useState<number | null>(null);
  const [fullscreen, setFs]     = useState(false);
  const drag    = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  // Track fullscreen changes
  useEffect(() => {
    const handler = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function toggleFs() {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

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
    setZoom(z => Math.max(0.25, Math.min(2.5, z - e.deltaY * 0.0008)));
  }
  function reset() { setZoom(0.68); setPan({ x: 10, y: 16 }); }

  // Funnel polygon
  const funnelPts = [
    ...Array.from({ length: NS }, (_, i) => `${sg(i).xl},${sg(i).y}`),
    `${FC},${FUNNEL_BOT_Y}`,
    ...Array.from({ length: NS }, (_, i) => `${sg(NS - 1 - i).xr},${sg(NS - 1 - i).y}`),
  ].join(' ');

  // Flow particle path (center of funnel)
  const flowPath = `M ${FC} ${FSY - 2} L ${FC} ${FUNNEL_BOT_Y + 4}`;

  const viewH = fullscreen ? 'calc(100vh - 48px)' : '1100px';

  return (
    <div
      ref={wrapRef}
      style={{
        background: '#0d1117', borderRadius: fullscreen ? 0 : 20,
        overflow: 'hidden', border: `1px solid ${w(0.07)}`,
        display: 'flex', flexDirection: 'column',
        height: fullscreen ? '100vh' : 'auto',
      }}
    >
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px', background: '#161b22', borderBottom: `1px solid ${w(0.06)}`,
        flexShrink: 0, height: 48,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
            RevCore Marketing System
          </span>
          <span style={{ fontSize: '0.7rem', color: w(0.35), background: w(0.05), padding: '2px 8px', borderRadius: 100 }}>
            Interactive Funnel — hover stages to explore
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: '0.7rem', color: w(0.25), marginRight: 4 }}>Scroll to zoom · Drag to pan</span>
          {([
            { lbl: '−', fn: () => setZoom(z => Math.max(0.25, z - 0.1)) },
            { lbl: `${Math.round(zoom * 100)}%`, fn: undefined },
            { lbl: '+', fn: () => setZoom(z => Math.min(2.5, z + 0.1)) },
            { lbl: 'Reset', fn: reset },
          ] as { lbl: string; fn: (() => void) | undefined }[]).map((b, i) => (
            <button key={i} onClick={b.fn} style={{
              background: w(0.06), border: `1px solid ${w(0.1)}`, borderRadius: 7,
              color: w(0.7), fontSize: '0.75rem', fontWeight: 600,
              padding: '4px 10px', cursor: b.fn ? 'pointer' : 'default',
              minWidth: b.lbl === 'Reset' ? 50 : 30,
            }}>
              {b.lbl}
            </button>
          ))}
          {/* Fullscreen button */}
          <button
            onClick={toggleFs}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            style={{
              background: fullscreen ? `${ACCENT}20` : w(0.06),
              border: `1px solid ${fullscreen ? ACCENT + '60' : w(0.1)}`,
              borderRadius: 7, color: fullscreen ? ACCENT : w(0.7),
              fontSize: '0.75rem', fontWeight: 700,
              padding: '4px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.2s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              {fullscreen ? (
                <>
                  <path d="M4.5 1.5H1.5v3M7.5 1.5h3v3M4.5 10.5H1.5v-3M7.5 10.5h3v-3" />
                </>
              ) : (
                <>
                  <path d="M1.5 4.5V1.5h3M10.5 4.5V1.5h-3M1.5 7.5v3h3M10.5 7.5v3h-3" />
                </>
              )}
            </svg>
            {fullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* ── Viewport ── */}
      <div
        ref={viewRef}
        style={{ height: viewH, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative', flexShrink: 0 }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}
      >
        <div style={{
          position: 'absolute', width: CW, height: CH,
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0', userSelect: 'none',
        }}>


          {/* ══════════════════════════════════════════════════════════
              TOP OF FUNNEL
          ══════════════════════════════════════════════════════════ */}
          <Card x={30} y={8} w={920} h={278} bg="#111820" accent={`${ACCENT}25`} r={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 2, background: ACCENT }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: 14.5, color: 'white', letterSpacing: '-0.01em' }}>
                TOP OF FUNNEL: Impressions & Digital Presence
              </span>
            </div>
            <p style={{ fontSize: 10, color: w(0.38), marginBottom: 14, lineHeight: 1.55, maxWidth: 680 }}>
              The funnel gets wider as your digital presence expands. Things that make it wider: paid ads, better SEO, social media, press releases, etc.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Sniper */}
              <div style={{ background: '#0d1117', borderRadius: 12, padding: 14, border: `1px solid ${ACCENT}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10.5, color: ACCENT, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    The Sniper — SEO / Websites
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div><p style={{ fontSize: 9, color: GREEN, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>PROS</p><p style={{ fontSize: 9.5, color: w(0.45), lineHeight: 1.5 }}>Precise · High intent · Cheaper long-term</p></div>
                  <div><p style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>CONS</p><p style={{ fontSize: 9.5, color: w(0.45), lineHeight: 1.5 }}>Slower to build · Lower initial volume</p></div>
                </div>
                <Bullets items={['20–40 page website', 'Home · Services · Service Areas', 'On-page SEO, title tags, H1s', 'Keyword-optimised copy']} color={ACCENT} size={9.5} />
              </div>
              {/* Machine gun */}
              <div style={{ background: '#0d1117', borderRadius: 12, padding: 14, border: `1px solid ${BLUE}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10.5, color: BLUE, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    The Machine Gun — Meta Ads
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div><p style={{ fontSize: 9, color: GREEN, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>PROS</p><p style={{ fontSize: 9.5, color: w(0.45), lineHeight: 1.5 }}>Fast results · Broad reach · High volume</p></div>
                  <div><p style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>CONS</p><p style={{ fontSize: 9.5, color: w(0.45), lineHeight: 1.5 }}>More expensive · Lower intent</p></div>
                </div>
                <Bullets items={['Campaigns per service', 'Ad creatives: videos & images', 'Ad copy: short, medium, long', 'Multiple ads · A/B testing']} color={BLUE} size={9.5} />
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════
              FUNNEL SVG (shape + particles + hover glows)
          ══════════════════════════════════════════════════════════ */}
          <svg style={{ position: 'absolute', inset: 0, width: CW, height: CH, pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="fgr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0.03" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Per-stage glow gradient */}
              {stages.map((s, i) => {
                return (
                  <linearGradient key={i} id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0.06" />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Connector from top-box to funnel */}
            <line x1={FC} y1={286} x2={FC} y2={FSY} stroke={`${ACCENT}50`} strokeWidth={1.5} strokeDasharray="5 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
            </line>
            <polygon points={`${FC - 5},${FSY} ${FC + 5},${FSY} ${FC},${FSY + 8}`} fill={`${ACCENT}60`} />

            {/* Main funnel fill */}
            <polygon points={funnelPts} fill="url(#fgr)" stroke={`${ACCENT}30`} strokeWidth={1.5} />

            {/* Active stage highlight */}
            {activeStage !== null && (() => {
              const s = stages[activeStage];
              const g0 = sg(activeStage);
              const g1 = activeStage < NS - 1 ? sg(activeStage + 1) : null;
              const nextXl = g1 ? g1.xl : FC - FBW;
              const nextXr = g1 ? g1.xr : FC + FBW;
              const nextY  = g1 ? g1.y : FUNNEL_BOT_Y;
              const pts = `${g0.xl},${g0.y} ${g0.xr},${g0.y} ${nextXr},${nextY} ${nextXl},${nextY}`;
              return (
                <polygon
                  points={pts}
                  fill={`url(#sg${activeStage})`}
                  stroke={`${s.color}55`}
                  strokeWidth={2}
                  filter="url(#glow)"
                  style={{ transition: 'all 0.25s' }}
                />
              );
            })()}

            {/* Stage dividers */}
            {Array.from({ length: NS - 1 }, (_, i) => {
              const g = sg(i + 1);
              return (
                <line key={i} x1={g.xl} y1={g.y} x2={g.xr} y2={g.y}
                  stroke={activeStage === i || activeStage === i + 1 ? `${stages[i].color}55` : `${ACCENT}18`}
                  strokeWidth={activeStage === i ? 2 : 1} strokeDasharray="5 4"
                  style={{ transition: 'stroke 0.3s' }}
                />
              );
            })}

            {/* Dot at each stage divider */}
            {Array.from({ length: NS - 1 }, (_, i) => {
              const g = sg(i + 1);
              const isNearActive = activeStage === i || activeStage === i + 1;
              return (
                <circle key={i} cx={FC} cy={g.y} r={isNearActive ? 5 : 3}
                  fill={isNearActive ? stages[i].color : `${ACCENT}80`}
                  style={{ transition: 'all 0.3s' }}
                />
              );
            })}

            {/* Animated flow particles */}
            <path id="fpath" d={flowPath} fill="none" />
            {[0, 1, 2, 3].map(j => (
              <circle key={j} r={3.5} fill={j % 2 === 0 ? ACCENT : BLUE} opacity={0.75} filter="url(#glow)">
                <animateMotion dur={`${5.5 + j * 1.2}s`} begin={`${j * 1.6}s`} repeatCount="indefinite" path={flowPath} />
                <animate attributeName="opacity" values="0;0.75;0.75;0" keyTimes="0;0.1;0.85;1" dur={`${5.5 + j * 1.2}s`} begin={`${j * 1.6}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="2;3.5;2" dur={`${5.5 + j * 1.2}s`} begin={`${j * 1.6}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Bottom connector arrow */}
            <line x1={FC} y1={FUNNEL_BOT_Y} x2={FC} y2={FUNNEL_BOT_Y + 40} stroke={`${BLUE}55`} strokeWidth={2}>
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
            </line>
            <polygon points={`${FC - 7},${FUNNEL_BOT_Y + 40} ${FC + 7},${FUNNEL_BOT_Y + 40} ${FC},${FUNNEL_BOT_Y + 52}`} fill={`${BLUE}55`} />
          </svg>

          {/* ══════════════════════════════════════════════════════════
              LEFT EMOTION LABELS
          ══════════════════════════════════════════════════════════ */}
          {stages.map((s, i) => {
            const g = sg(i);
            const isActive = activeStage === i;
            return (
              <div key={`em${i}`} style={{
                position: 'absolute', left: 0, top: g.y, width: 212, height: FRH,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '0 10px 0 6px',
                borderRight: `2px solid ${isActive ? s.color + '70' : s.color + '28'}`,
                transition: 'border-color 0.3s',
              }}>
                <svg width={26} height={8} viewBox="0 -4 26 8" style={{ position: 'absolute', right: -22, top: '50%', marginTop: -4, overflow: 'visible', display: 'block' }}>
                  <line x1={0} y1={0} x2={18} y2={0} stroke={isActive ? s.color : `${s.color}50`} strokeWidth={1.5} style={{ transition: 'stroke 0.3s' }} />
                  <polygon points="18,-4 25,0 18,4" fill={isActive ? s.color : `${s.color}50`} style={{ transition: 'fill 0.3s' }} />
                </svg>
                <p style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, color: isActive ? s.color : `${s.color}90`, letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'pre-wrap', lineHeight: 1.4, marginBottom: 5, transition: 'color 0.3s' }}>
                  {s.emotion}
                </p>
                {s.touchpoint && s.touchpoint !== 'CTA' && (
                  <div style={{ background: `${s.color}${isActive ? '22' : '14'}`, border: `1px solid ${s.color}${isActive ? '50' : '30'}`, borderRadius: 100, padding: '2px 8px', display: 'inline-flex', transition: 'all 0.3s' }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: s.color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      → {s.touchpoint}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* ══════════════════════════════════════════════════════════
              STAGE CONTENT — centered in funnel, hover reveals detail
          ══════════════════════════════════════════════════════════ */}
          {stages.map((s, i) => {
            const g    = sg(i);
            const iW   = g.xr - g.xl - 20;
            const isActive = activeStage === i;
            return (
              <div
                key={`sc${i}`}
                style={{
                  position: 'absolute',
                  left: g.xl + 10, top: g.y,
                  width: iW, height: FRH,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                {/* Touchpoint label */}
                {s.touchpoint && (
                  <p style={{
                    fontFamily: 'DM Sans', fontWeight: 800,
                    fontSize: Math.max(7, 13 - i * 0.9),
                    color: isActive ? 'white' : s.color,
                    textTransform: 'uppercase', letterSpacing: '-0.01em',
                    marginBottom: isActive ? 5 : 0,
                    transition: 'all 0.25s',
                    textShadow: isActive ? `0 0 20px ${s.color}90` : 'none',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}>
                    {s.touchpoint}
                  </p>
                )}

                {/* Items revealed on hover */}
                <div style={{
                  maxHeight: isActive ? '80px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center',
                }}>
                  {s.items.slice(0, i < 4 ? 3 : 2).map((item, j) => (
                    <span key={j} style={{ fontSize: Math.max(7.5, 10 - i * 0.4), color: w(0.55), lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {item}
                    </span>
                  ))}
                </div>

                {/* Hover hint dot when inactive */}
                {!isActive && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: `${s.color}60`,
                    marginTop: 4,
                    animation: 'pulse-dot 2s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`,
                  }} />
                )}
              </div>
            );
          })}

          {/* ══════════════════════════════════════════════════════════
              RIGHT — Data Tracking
          ══════════════════════════════════════════════════════════ */}
          <Card x={792} y={FSY} w={354} h={340} bg="#111820" accent={`${GREEN}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 13 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10, color: GREEN, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Data Tracking, Analysing & Iteration
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.45), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>SEO</p>
                <Bullets items={['Google Analytics', 'Keywords', 'Search terms', 'Traffic']} color={GREEN} size={9.5} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.45), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>META</p>
                <Bullets items={['A/B creative testing', 'A/B copy testing', 'Angle testing']} color={BLUE} size={9.5} />
              </div>
            </div>
            <div style={{ height: 1, background: w(0.05), margin: '12px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.45), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>WEBSITE</p>
                <Bullets items={['Heat map analysis', 'Offer testing', 'Copy testing']} color={YELLOW} size={9.5} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: w(0.45), letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 7 }}>KEY METRICS</p>
                <Bullets items={['CPA (cost/appointment)', 'CPC (cost/click)', 'CPL (cost/lead)', 'CPM (per 1,000 imp.)']} color={ACCENT} size={9} />
              </div>
            </div>
          </Card>

          {/* Scaling callout */}
          <Card x={792} y={FSY + 355} w={354} h={96} bg="#111820" accent={`${YELLOW}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: YELLOW }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 10, color: YELLOW, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Scaling Strategy
              </span>
            </div>
            <p style={{ fontSize: 10, color: w(0.48), lineHeight: 1.6 }}>
              As conversion rate improves → increase daily ad spend to flood the top of the funnel with more qualified leads.
            </p>
          </Card>

          {/* ══════════════════════════════════════════════════════════
              CONVERSION OPTIMISATION SYSTEMS
          ══════════════════════════════════════════════════════════ */}
          <Card x={30} y={FUNNEL_BOT_Y + 58} w={920} h={218} bg="#111820" accent={`${GREEN}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ background: GREEN, color: '#0d1117', borderRadius: 100, padding: '2px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                STEP 2
              </div>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 800, fontSize: 13.5, color: 'white', letterSpacing: '-0.01em' }}>
                Conversion Optimisation Systems (GHL)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Immediate',      color: ACCENT,  items: ['Email: thanks for applying', 'Training follow-up', 'SMS intro', 'Calendar confirmation'] },
                { label: 'AI Layer',       color: BLUE,    items: ['AI agent outbound call', 'In-commitment follow-up', 'Qualification check'] },
                { label: 'Reminders',      color: YELLOW,  items: ['Email & SMS confirmation', 'Show rate reminders', 'Social proof messages'] },
                { label: 'Rehash Engine™', color: GREEN,   items: ['Old lead re-engagement', 'Automated follow-up sequences', 'Win-back campaigns'] },
              ].map((col, i) => (
                <div key={i}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: col.color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{col.label}</p>
                  <Bullets items={col.items} color={col.color} size={9.5} />
                </div>
              ))}
            </div>
          </Card>

          {/* PROJECT */}
          <Card x={270} y={FUNNEL_BOT_Y + 292} w={440} h={200} bg="#111820" accent={`${BLUE}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
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
                <div style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}35`, borderRadius: 10, padding: '7px 11px', marginBottom: 7 }}>
                  <p style={{ fontSize: 8.5, fontWeight: 700, color: GREEN, letterSpacing: '0.06em', marginBottom: 2 }}>NEW CLIENTS</p>
                  <p style={{ fontSize: 10, color: w(0.55) }}>Revenue closed & tracked</p>
                </div>
                <div style={{ background: `${YELLOW}15`, border: `1px solid ${YELLOW}35`, borderRadius: 10, padding: '7px 11px' }}>
                  <p style={{ fontSize: 8.5, fontWeight: 700, color: YELLOW, letterSpacing: '0.06em', marginBottom: 2 }}>⭐ 5-STAR REVIEW</p>
                  <p style={{ fontSize: 10, color: w(0.55) }}>Automated review request</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════
              FAR RIGHT — SEO PANELS
          ══════════════════════════════════════════════════════════ */}
          <Card x={1164} y={8} w={648} h={526} bg="#111820" accent={`${BLUE}25`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 13 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: BLUE }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: BLUE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SEO-Optimised Website Page Layout
              </span>
            </div>
            {[
              { title: 'Home Page',         desc: 'Ranks when people search the company name. Primary trust & brand anchor page.', color: BLUE },
              { title: 'Service Pages',     desc: 'One page per service offered, built to rank on "near me" searches. More services = more pages needed.', color: GREEN },
              { title: 'Service Area Pages',desc: 'Ranks for geo-specific queries like "Brickell Miami Roofing". You want to rank in all service areas — not just "near me". Larger areas need more pages.', color: YELLOW },
              { title: 'The Goal',          desc: 'Pages that match popular search terms to capture full-circle SEO presence. More pages = more surface area = more leads.', color: ACCENT },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < 3 ? `1px solid ${w(0.05)}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: w(0.88) }}>{item.title}</span>
                </div>
                <p style={{ fontSize: 10.5, color: w(0.42), lineHeight: 1.65, paddingLeft: 11 }}>{item.desc}</p>
              </div>
            ))}
          </Card>


        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
