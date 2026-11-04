// Soft edge under the hero: three layers of uneven waves in the page color drift
// sideways at different speeds, so the line where the grid ends keeps washing in
// and out like a shoreline. Each path repeats every 600 units, so sliding the
// 1200-wide strip by half loops without a seam.

const WAVES = [
  {
    // far wave: reaches highest, mostly see-through
    d: "M0 52 C 70 18 150 8 230 34 S 360 92 430 66 S 540 22 600 52 C 670 18 750 8 830 34 S 960 92 1030 66 S 1140 22 1200 52 L1200 160 L0 160 Z",
    opacity: 0.35,
    duration: "34s",
    reverse: true,
    height: "100%",
  },
  {
    d: "M0 78 C 60 46 120 40 200 64 S 330 112 410 86 S 530 50 600 78 C 660 46 720 40 800 64 S 930 112 1010 86 S 1130 50 1200 78 L1200 160 L0 160 Z",
    opacity: 0.65,
    duration: "24s",
    reverse: false,
    height: "86%",
  },
  {
    // shore: solid, joins the page
    d: "M0 104 C 90 82 170 70 260 92 S 400 132 470 112 S 560 92 600 104 C 690 82 770 70 860 92 S 1000 132 1070 112 S 1160 92 1200 104 L1200 160 L0 160 Z",
    opacity: 1,
    duration: "17s",
    reverse: true,
    height: "72%",
  },
];

export function ShoreWaves({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden sm:h-56 ${className}`}>
      {/* a little haze so the grid fades before the water starts */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-canvas/50" />
      {WAVES.map((w, i) => (
        <svg
          key={i}
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          className="shore-wave absolute bottom-0 left-0 w-[200%] fill-canvas"
          style={{
            opacity: w.opacity,
            height: w.height,
            animationDuration: w.duration,
            animationDirection: w.reverse ? "reverse" : "normal",
          }}
        >
          <path d={w.d} />
        </svg>
      ))}
    </div>
  );
}
