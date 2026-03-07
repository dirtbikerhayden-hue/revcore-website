'use client';

import Link from 'next/link';
import { ArrowRight, Users, Zap, BarChart3 } from 'lucide-react';
import { useScrollReveal, fadeUp, scaleUp, slideFromRight } from '@/hooks/useScrollReveal';
import AnimatedText from '@/components/AnimatedText';
import { useEffect, useState, useRef } from 'react';

const stats = [
  { num: '$28K', label: 'Avg. job value closed' },
  { num: '47%', label: 'Higher close rates' },
  { num: '98%', label: 'Appointment show-up rate' },
  { num: '28x', label: 'Average ROI for partners' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
// Kitchen/bath remodeler: $750K/yr → $3M/yr run rate over 6 months
const REVENUE = [62000, 88000, 118000, 158000, 208000, 252000];

const SERVICES = [
  { Icon: Users,    label: 'Qualified Lead Pipeline',  gain: 64000, color: '#FE6462', delay: 400 },
  { Icon: Zap,      label: 'Sales Closer + Training',  gain: 78000, color: '#94D96B', delay: 750 },
  { Icon: BarChart3,label: 'CRM & Follow-Up System',   gain: 48000, color: '#6B8EFE', delay: 1100 },
];
const TOTAL_GAIN = SERVICES.reduce((s, x) => s + x.gain, 0);

/* ── Growth Dashboard ─────────────────────────────────── */
function GrowthDashboard({ active }: { active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(1200);
  const [hovered, setHovered] = useState<number | null>(null);
  const [serviceVisible, setServiceVisible] = useState([false, false, false]);
  const [totalCount, setTotalCount] = useState(0);

  /* SVG geometry */
  const W = 300, H = 100, PAD = 18;
  const min = Math.min(...REVENUE), max = Math.max(...REVENUE);
  const pts = REVENUE.map((v, i) => ({
    x: PAD + (i / (REVENUE.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2),
  }));

  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cpx} ${pts[i - 1].y} ${cpx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    if (!active) return;

    /* staggered service cards */
    SERVICES.forEach((s, i) => {
      setTimeout(() => {
        setServiceVisible(prev => prev.map((x, j) => (j === i ? true : x)));
      }, s.delay);
    });

    /* total gain counter */
    setTimeout(() => {
      const steps = 55;
      const step = TOTAL_GAIN / steps;
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + step, TOTAL_GAIN);
        setTotalCount(Math.round(cur));
        if (cur >= TOTAL_GAIN) clearInterval(t);
      }, 25);
    }, 1400);

  }, [active]);

  return (
    <div style={{
      background: 'linear-gradient(155deg, #080e16 0%, #0b1520 55%, #0c1a18 100%)',
      borderRadius: '22px',
      padding: '26px 24px 22px',
      border: '1px solid rgba(255,255,255,0.09)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* background glow orbs */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,142,254,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,100,98,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>
            Partner Revenue Growth
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'white', lineHeight: 1 }}>
              $252k
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: '#94D96B',
              background: 'rgba(148,217,107,0.1)', border: '1px solid rgba(148,217,107,0.2)',
              borderRadius: '100px', padding: '2px 8px',
            }}>↑ 306%</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
            $62k → $3M/yr run rate
          </div>
        </div>

        {/* live pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(148,217,107,0.08)', border: '1px solid rgba(148,217,107,0.18)', borderRadius: '100px', padding: '5px 10px' }}>
          <div className="about-pulse-dot" />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94D96B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
        </div>
      </div>

      {/* ── SVG Area Chart ── */}
      <div style={{ marginBottom: '6px', position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="about-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B8EFE" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6B8EFE" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="about-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4158D0" />
              <stop offset="50%" stopColor="#6B8EFE" />
              <stop offset="100%" stopColor="#94D96B" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1].map((t, i) => (
            <line key={i}
              x1={PAD} y1={PAD + t * (H - PAD * 2)}
              x2={W - PAD} y2={PAD + t * (H - PAD * 2)}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#about-area-grad)"
            style={{ opacity: active ? 1 : 0, transition: 'opacity 0.9s ease 0.7s' }}
          />

          {/* Animated line */}
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="url(#about-line-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={active ? 0 : pathLen}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1) 0.15s' }}
          />

          {/* Data points + tooltips */}
          {pts.map((pt, i) => (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* hover hit area */}
              <circle cx={pt.x} cy={pt.y} r={12} fill="transparent" />
              {/* visible dot */}
              <circle
                cx={pt.x} cy={pt.y}
                r={hovered === i ? 5.5 : 3.5}
                fill={hovered === i ? '#6B8EFE' : '#0d1a24'}
                stroke={hovered === i ? '#6B8EFE' : 'rgba(107,142,254,0.55)'}
                strokeWidth="2"
                style={{
                  transition: 'all 0.18s ease',
                  opacity: active ? 1 : 0,
                  transitionDelay: active ? `${0.2 + i * 0.14}s` : '0s',
                }}
              />
              {/* tooltip */}
              {hovered === i && (
                <g>
                  <rect x={pt.x - 28} y={pt.y - 30} width="56" height="20" rx="5" fill="rgba(20,30,50,0.95)" stroke="rgba(107,142,254,0.3)" strokeWidth="1" />
                  <text x={pt.x} y={pt.y - 16} textAnchor="middle" fontSize="9.5" fill="white" fontWeight="700" fontFamily="DM Sans, sans-serif">
                    ${(REVENUE[i] / 1000).toFixed(0)}k/mo
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Month labels */}
          {pts.map((pt, i) => (
            <text key={i} x={pt.x} y={H + 18} textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.25)" fontFamily="sans-serif">
              {MONTHS[i]}
            </text>
          ))}
        </svg>
      </div>

      {/* ── Services stack ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
        <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '10px' }}>
          Services Activated
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SERVICES.map((s, i) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: serviceVisible[i] ? 'rgba(255,255,255,0.035)' : 'transparent',
              border: `1px solid ${serviceVisible[i] ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
              borderRadius: '10px',
              padding: '9px 11px',
              opacity: serviceVisible[i] ? 1 : 0,
              transform: serviceVisible[i] ? 'translateY(0)' : 'translateY(6px)',
              transition: 'all 0.45s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                  background: `${s.color}14`, border: `1px solid ${s.color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.Icon size={12} color={s.color} />
                </div>
                <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{s.label}</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.color, fontFamily: 'DM Sans, sans-serif' }}>
                +${Math.round(s.gain / 1000)}k/mo
              </span>
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(107,142,254,0.06)',
            border: '1px solid rgba(107,142,254,0.18)',
            borderRadius: '10px',
            padding: '11px 13px',
            marginTop: '2px',
            opacity: totalCount > 0 ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total Monthly Gain</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#6B8EFE', fontFamily: 'DM Sans, sans-serif' }}>
              ${totalCount.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .about-pulse-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #94D96B;
          animation: aboutPulse 2s ease-in-out infinite;
        }
        @keyframes aboutPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}

/* ── About section ─────────────────────────────────────── */
export default function About() {
  const { ref, inView } = useScrollReveal({ threshold: 0.08 });

  return (
    <section ref={ref as React.Ref<HTMLElement>} style={{ padding: '120px 0', background: 'var(--color-white)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

          {/* Left — animated dashboard */}
          <div style={{ position: 'relative' }}>
            <div style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <GrowthDashboard active={inView} />
            </div>

            {/* Floating star badge */}
            <div style={{
              position: 'absolute', bottom: '2rem', left: '-1.5rem',
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'var(--color-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              ...scaleUp(inView, 700),
            }}>
              ✦
            </div>
          </div>

          {/* Right — content */}
          <div style={{ ...slideFromRight(inView, 100) }}>
            <div className="section-tag" style={{ ...fadeUp(inView, 100) }}>About RevCore</div>

            <AnimatedText
              as="h2"
              inView={inView}
              delay={200}
              stagger={80}
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}
            >
              We build automated revenue systems for contractors.
            </AnimatedText>

            <p style={{ color: 'var(--color-gray)', lineHeight: '1.8', marginBottom: '1.5rem', ...fadeUp(inView, 550) }}>
              RevCore is a growth firm exclusively for home service contractors. We combine targeted lead generation, in-home sales training, proprietary follow-up automation, and custom sales software to create predictable, scalable revenue.
            </p>
            <p style={{ color: 'var(--color-gray)', lineHeight: '1.8', marginBottom: '2.5rem', ...fadeUp(inView, 650) }}>
              We offer exclusive territory protection, one contractor per trade per market, and back everything with a performance guarantee. No long-term contracts required.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  padding: '1.25rem', background: 'var(--color-bg)', borderRadius: '14px',
                  ...scaleUp(inView, 700 + i * 100),
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'DM Sans, sans-serif', color: 'var(--color-primary)' }}>{s.num}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...fadeUp(inView, 1100) }}>
              <Link href="/about" className="btn-primary">
                Our story <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
