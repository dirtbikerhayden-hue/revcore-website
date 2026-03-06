'use client';

// Reusable space/galaxy background: stars, shooting stars, planet blobs.
// Parent must have position: relative (or absolute) and overflow: hidden.
export default function SpaceBackground({ opacity = 1 }: { opacity?: number }) {
  // All stars — each gets its own flicker animation derived from index
  const stars: [number, number, number][] = [
    [45,  28, 1.2], [180, 65, 0.8], [310, 18, 1.4], [480, 72, 1.0], [630, 35, 1.3],
    [790, 88, 0.9], [950, 22, 1.5], [1100,58, 1.0], [1260,14, 1.2], [1400,75, 0.8],
    [95, 155, 0.9], [240,120, 1.3], [390,175, 0.8], [555,140, 1.1], [720,110, 1.4],
    [870,168, 1.0], [1030,132, 0.9],[1190,178, 1.2], [1340,108, 1.5],[1430,155, 0.7],
    [60, 265, 1.1], [210,240, 0.8], [380,285, 1.3], [540,252, 1.0], [700,275, 0.9],
    [860,242, 1.4], [1010,290, 1.1],[1180,260, 0.8], [1320,282, 1.3],[1420,248, 1.0],
    [130,380, 0.9], [290,350, 1.2], [460,390, 1.0], [620,365, 0.8], [780,385, 1.4],
    [940,355, 1.1], [1090,395, 0.9],[1250,370, 1.5], [1390,388, 1.2],[1440,350, 0.7],
    [75, 490, 1.3], [225,468, 0.9], [395,495, 1.1], [565,475, 1.4], [730,498, 0.8],
    [895,472, 1.2], [1060,492, 1.0],[1220,468, 0.9], [1380,496, 1.3],[1440,480, 1.1],
    [50, 560, 0.8], [170,540, 1.2], [340,575, 1.0], [510,550, 0.9], [680,580, 1.4],
    [840,558, 1.1], [1000,575, 0.8],[1160,548, 1.3], [1330,572, 1.0],[1430,558, 0.9],
    // extra scattered stars for denser feel
    [280, 90, 1.3], [680, 45, 1.1], [1060, 130, 1.4], [1380, 70, 0.9],
    [140, 310, 1.2], [520, 280, 1.0], [900, 340, 1.3], [1240, 295, 1.1],
    [360, 520, 1.4], [1080, 490, 1.0],
  ];

  // Varied flicker sequences — gives each star a unique "personality"
  const flickerPatterns = [
    '0.08;0.38;0.12;0.42;0.08',
    '0.05;0.30;0.18;0.35;0.05',
    '0.12;0.45;0.08;0.40;0.12',
    '0.06;0.25;0.14;0.28;0.06',
    '0.10;0.50;0.07;0.44;0.10',
    '0.04;0.32;0.20;0.36;0.04',
    '0.09;0.42;0.11;0.38;0.09',
    '0.07;0.28;0.16;0.32;0.07',
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity }}>

      {/* ── Blurred planet blobs ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(254,100,98,0.04) 0%, transparent 50%)',
        animation: 'planet-drift-a 18s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '15%',
        width: '360px', height: '360px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,142,254,0.03) 0%, transparent 50%)',
        animation: 'planet-drift-b 24s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '-80px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(148,217,107,0.03) 0%, transparent 50%)',
        animation: 'planet-drift-c 20s ease-in-out infinite',
        willChange: 'transform',
      }} />

      {/* ── Stars SVG ─────────────────────────────────────────────────────── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 600"
      >
        {stars.map(([cx, cy, r], i) => {
          const dur = 3 + ((i * 1.37) % 6);
          const begin = (i * 0.43) % 7;
          const pattern = flickerPatterns[i % flickerPatterns.length];
          const maxOp = 0.22 + ((i * 0.19) % 0.30);
          const rMax = r * (1.3 + ((i * 0.11) % 0.5));
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={0.08}>
              <animate
                attributeName="opacity"
                values={pattern.replace(/\d+\.\d+/g, (v) => String(Math.min(parseFloat(v) * maxOp / 0.35, 0.55)))}
                dur={`${dur.toFixed(1)}s`}
                begin={`${begin.toFixed(1)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${r};${rMax.toFixed(2)};${r}`}
                dur={`${(dur * 1.2).toFixed(1)}s`}
                begin={`${begin.toFixed(1)}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* Shooting stars — rare, random positions, fast */}
        {([
          { x1: 160,  y1: 55,  x2: 400,  y2: 188,  delay: '8s',  dur: '65s' },
          { x1: 1040, y1: 38,  x2: 1275, y2: 162,  delay: '41s', dur: '72s' },
        ]).map((ss, i) => (
          <line key={`ss${i}`} x1={ss.x1} y1={ss.y1} x2={ss.x1} y2={ss.y1}
            stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0}>
            <animate attributeName="x2" values={`${ss.x1};${ss.x2};${ss.x2}`} keyTimes="0;0.04;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="y2" values={`${ss.y1};${ss.y2};${ss.y2}`} keyTimes="0;0.04;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.28;0.14;0;0" keyTimes="0;0.012;0.04;0.065;1" dur={ss.dur} begin={ss.delay} repeatCount="indefinite" />
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
