'use client';

// Deterministic LCG — stable across SSR/CSR, computed once at module load
const _rng = (() => {
  let s = 98765;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
})();

type StarData = {
  cx: number; cy: number; r: number;
  dur: number; begin: number;
  dx: number; dy: number; dDur: number;
  sparkle: boolean;
  color: string;
  maxOp: number;
};

// 200 stars across tiers: tiny sparkle dust → medium → large sparkle focal points
const STARS: StarData[] = Array.from({ length: 200 }, () => {
  const tier = _rng();
  const r =
    tier < 0.30 ? 0.12 + _rng() * 0.18  // tiny dust: 0.12–0.30
  : tier < 0.62 ? 0.30 + _rng() * 0.35  // small: 0.30–0.65
  : tier < 0.85 ? 0.65 + _rng() * 0.75  // medium: 0.65–1.40
  : tier < 0.95 ? 1.40 + _rng() * 0.90  // large: 1.40–2.30
  :               2.30 + _rng() * 1.20;  // focal: 2.30–3.50
  const cr = _rng();
  return {
    cx: _rng() * 1440,
    cy: _rng() * 700,
    r,
    dur: 1.2 + _rng() * 7,
    begin: _rng() * 14,
    dx: (_rng() - 0.5) * 6,
    dy: (_rng() - 0.5) * 6,
    dDur: 8 + _rng() * 16,
    // only larger stars get 4-pointed sparkle treatment
    sparkle: r > 1.8 && _rng() > 0.3,
    color: cr < 0.65 ? 'white' : cr < 0.82 ? '#c6d8ff' : '#fff4d8',
    // tiny stars should be dimmer, large should flash brighter
    maxOp: r < 0.3 ? 0.15 + _rng() * 0.25
         : r < 0.65 ? 0.30 + _rng() * 0.35
         :             0.55 + _rng() * 0.40,
  };
});

// 4-pointed diamond sparkle path centered at (cx,cy)
function sparklePath(cx: number, cy: number, a: number): string {
  const w = a * 0.18;
  return [
    `M${cx},${cy - a}`,
    `L${cx + w},${cy - w}`,
    `L${cx + a},${cy}`,
    `L${cx + w},${cy + w}`,
    `L${cx},${cy + a}`,
    `L${cx - w},${cy + w}`,
    `L${cx - a},${cy}`,
    `L${cx - w},${cy - w}`,
    'Z',
  ].join(' ');
}

export default function SpaceBackground({ opacity = 1 }: { opacity?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity }}>

      {/* ── Drifting planet glows ───────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(254,100,98,0.055) 0%, transparent 55%)', animation: 'spPlanetA 20s ease-in-out infinite', willChange: 'transform' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '12%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,142,254,0.045) 0%, transparent 55%)', animation: 'spPlanetB 26s ease-in-out infinite', willChange: 'transform' }} />
      <div style={{ position: 'absolute', top: '25%', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(148,217,107,0.035) 0%, transparent 55%)', animation: 'spPlanetC 22s ease-in-out infinite', willChange: 'transform' }} />
      <div style={{ position: 'absolute', top: '55%', right: '20%', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,120,255,0.03) 0%, transparent 60%)' }} />

      {/* ── Stars SVG ───────────────────────────────────────────────────────── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 700">
        {STARS.map((st, i) => {
          // Sharp twinkle: spend most time dark, briefly flash bright
          // Two rapid flashes per cycle for authentic star twinkle
          const v1 = (st.maxOp * 0.9).toFixed(2);
          const v2 = (st.maxOp * 0.15).toFixed(2);
          const v3 = (st.maxOp * 0.75).toFixed(2);
          const opVals = `0;0;${v1};${v2};0;0;${v3};0.04;0;0`;
          const opKeys = '0;0.12;0.17;0.22;0.38;0.55;0.62;0.68;0.82;1';

          if (st.sparkle) {
            const arm = st.r * 2.8;
            return (
              <g key={i}>
                <path d={sparklePath(st.cx, st.cy, arm)} fill={st.color} opacity={0}>
                  <animate attributeName="opacity" values={opVals} keyTimes={opKeys} dur={`${st.dur.toFixed(1)}s`} begin={`${st.begin.toFixed(1)}s`} repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values={`0,0; ${(st.dx * 0.4).toFixed(1)},${(st.dy * 0.4).toFixed(1)}; 0,0`} dur={`${st.dDur.toFixed(0)}s`} repeatCount="indefinite" additive="sum" />
                </path>
                {/* small bright center dot for sparkle stars */}
                <circle cx={st.cx} cy={st.cy} r={st.r * 0.5} fill="white" opacity={0}>
                  <animate attributeName="opacity" values={opVals} keyTimes={opKeys} dur={`${st.dur.toFixed(1)}s`} begin={`${st.begin.toFixed(1)}s`} repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="translate" values={`0,0; ${(st.dx * 0.4).toFixed(1)},${(st.dy * 0.4).toFixed(1)}; 0,0`} dur={`${st.dDur.toFixed(0)}s`} repeatCount="indefinite" additive="sum" />
                </circle>
              </g>
            );
          }

          return (
            <circle key={i} cx={st.cx} cy={st.cy} r={st.r} fill={st.color} opacity={0}>
              <animate attributeName="opacity" values={opVals} keyTimes={opKeys} dur={`${st.dur.toFixed(1)}s`} begin={`${st.begin.toFixed(1)}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${st.r};${(st.r * 1.5).toFixed(2)};${st.r}`} dur={`${(st.dur * 1.3).toFixed(1)}s`} begin={`${st.begin.toFixed(1)}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values={`0,0; ${st.dx.toFixed(1)},${st.dy.toFixed(1)}; ${(st.dx * 0.3).toFixed(1)},${(-st.dy * 0.5).toFixed(1)}; 0,0`} dur={`${st.dDur.toFixed(0)}s`} begin={`${(st.begin * 0.5).toFixed(1)}s`} repeatCount="indefinite" additive="sum" />
            </circle>
          );
        })}

        {/* ── Shooting stars ──────────────────────────────────────────────── */}
        {([
          { x1: 120,  y1: 40,  x2: 380,  y2: 170, delay: '7s',  dur: '55s' },
          { x1: 960,  y1: 28,  x2: 1220, y2: 150, delay: '32s', dur: '68s' },
          { x1: 520,  y1: 15,  x2: 740,  y2: 110, delay: '18s', dur: '80s' },
          { x1: 1280, y1: 55,  x2: 1430, y2: 130, delay: '45s', dur: '62s' },
        ]).map((ss, i) => (
          <line key={`ss${i}`} x1={ss.x1} y1={ss.y1} x2={ss.x1} y2={ss.y1} stroke="white" strokeWidth={0.8} strokeLinecap="round" opacity={0}>
            <animate attributeName="x2" values={`${ss.x1};${ss.x2};${ss.x2}`} keyTimes="0;0.04;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="y2" values={`${ss.y1};${ss.y2};${ss.y2}`} keyTimes="0;0.04;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.32;0.18;0;0" keyTimes="0;0.01;0.04;0.07;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
          </line>
        ))}
      </svg>

      <style>{`
        @keyframes spPlanetA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-20px,16px) scale(1.05)} 66%{transform:translate(14px,-12px) scale(0.97)} }
        @keyframes spPlanetB { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(18px,-14px) scale(1.06)} 70%{transform:translate(-12px,20px) scale(0.95)} }
        @keyframes spPlanetC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,12px) scale(1.07)} }
      `}</style>
    </div>
  );
}
