'use client';

// Reusable space/galaxy background: stars, shooting stars, planet blobs.
// Parent must have position: relative (or absolute) and overflow: hidden.
export default function SpaceBackground({ opacity = 1 }: { opacity?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity }}>

      {/* ── Blurred planet blobs ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(254,100,98,0.09) 0%, transparent 65%)',
        animation: 'planet-drift-a 18s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '15%',
        width: '360px', height: '360px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,142,254,0.08) 0%, transparent 65%)',
        animation: 'planet-drift-b 24s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '-80px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(148,217,107,0.07) 0%, transparent 65%)',
        animation: 'planet-drift-c 20s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* ── Stars SVG ─────────────────────────────────────────────────────── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 600"
      >
        {/* Static stars */}
        {([
          [45,  28, 1.2, 0.38], [180, 65, 0.8, 0.24], [310, 18, 1.4, 0.44], [480, 72, 1.0, 0.30], [630, 35, 1.3, 0.40],
          [790, 88, 0.9, 0.26], [950, 22, 1.5, 0.46], [1100,58, 1.0, 0.32], [1260,14, 1.2, 0.36], [1400,75, 0.8, 0.22],
          [95, 155, 0.9, 0.25], [240,120, 1.3, 0.38], [390,175, 0.8, 0.22], [555,140, 1.1, 0.32], [720,110, 1.4, 0.42],
          [870,168, 1.0, 0.28], [1030,132, 0.9, 0.25],[1190,178, 1.2, 0.34],[1340,108, 1.5, 0.44],[1430,155, 0.7, 0.20],
          [60, 265, 1.1, 0.30], [210,240, 0.8, 0.22], [380,285, 1.3, 0.38], [540,252, 1.0, 0.28], [700,275, 0.9, 0.24],
          [860,242, 1.4, 0.40], [1010,290, 1.1, 0.30],[1180,260, 0.8, 0.22],[1320,282, 1.3, 0.37],[1420,248, 1.0, 0.28],
          [130,380, 0.9, 0.24], [290,350, 1.2, 0.34], [460,390, 1.0, 0.28], [620,365, 0.8, 0.22], [780,385, 1.4, 0.40],
          [940,355, 1.1, 0.30], [1090,395, 0.9, 0.25],[1250,370, 1.5, 0.44],[1390,388, 1.2, 0.33],[1440,350, 0.7, 0.20],
          [75, 490, 1.3, 0.37], [225,468, 0.9, 0.24], [395,495, 1.1, 0.30], [565,475, 1.4, 0.42], [730,498, 0.8, 0.22],
          [895,472, 1.2, 0.34], [1060,492, 1.0, 0.28],[1220,468, 0.9, 0.24],[1380,496, 1.3, 0.37],[1440,480, 1.1, 0.30],
          [50, 560, 0.8, 0.20], [170,540, 1.2, 0.33], [340,575, 1.0, 0.28], [510,550, 0.9, 0.24], [680,580, 1.4, 0.40],
          [840,558, 1.1, 0.30], [1000,575, 0.8, 0.22],[1160,548, 1.3, 0.37],[1330,572, 1.0, 0.28],[1430,558, 0.9, 0.24],
        ] as [number,number,number,number][]).map(([cx,cy,r,op], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={op} />
        ))}

        {/* Twinkling stars */}
        {([
          [280, 90, 1.3], [680, 45, 1.1], [1060, 130, 1.4], [1380, 70, 0.9],
          [140, 310, 1.2], [520, 280, 1.0], [900, 340, 1.3], [1240, 295, 1.1],
          [360, 520, 1.4], [1060, 490, 1.0],
        ] as [number,number,number][]).map(([cx,cy,r], i) => (
          <circle key={`tw${i}`} cx={cx} cy={cy} r={r} fill="white" opacity={0.55}>
            <animate attributeName="opacity" values="0.12;0.55;0.12" dur={`${3.5 + i * 0.8}s`} begin={`${i * 1.1}s`} repeatCount="indefinite" />
            <animate attributeName="r" values={`${r};${r * 1.6};${r}`} dur={`${3.5 + i * 0.8}s`} begin={`${i * 1.1}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Shooting stars */}
        {([
          { x1: 120,  y1: 50,  x2: 320,  y2: 160,  delay: '0s',   dur: '4s'   },
          { x1: 900,  y1: 30,  x2: 1100, y2: 140,  delay: '7s',   dur: '3.5s' },
          { x1: 400,  y1: 180, x2: 620,  y2: 310,  delay: '14s',  dur: '4.5s' },
          { x1: 1200, y1: 100, x2: 1400, y2: 220,  delay: '20s',  dur: '3.8s' },
        ]).map((ss, i) => (
          <line key={`ss${i}`} x1={ss.x1} y1={ss.y1} x2={ss.x1} y2={ss.y1}
            stroke="white" strokeWidth={0.8} strokeLinecap="round" opacity={0}>
            <animate attributeName="x2" values={`${ss.x1};${ss.x2}`} dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="y2" values={`${ss.y1};${ss.y2}`} dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.22;0.12;0" keyTimes="0;0.06;0.4;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
          </line>
        ))}
      </svg>

      <style>{`
        @keyframes planet-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-18px, 14px) scale(1.04); }
          66%       { transform: translate(12px, -10px) scale(0.97); }
        }
        @keyframes planet-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(16px, -12px) scale(1.05); }
          70%       { transform: translate(-10px, 18px) scale(0.96); }
        }
        @keyframes planet-drift-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(14px, 10px) scale(1.06); }
        }
      `}</style>
    </div>
  );
}
