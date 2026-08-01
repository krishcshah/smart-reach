export default function Loading() {
  return (
    <div className="flex min-h-[62vh] items-center justify-center">
      <div className="relative flex flex-col items-center gap-6">
        {/* soft glow behind */}
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* orbit loader */}
        <div className="relative h-24 w-24">
          {/* outer gradient ring, counter-clockwise dash-chase */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 90deg, transparent 0%, rgba(99,102,241,0.18) 25%, #6366f1 50%, transparent 75%)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
              animation: "appSpin 1.4s linear infinite",
              filter: "drop-shadow(0 0 10px rgba(99,102,241,0.55))",
            }}
          />
          {/* inner ring, opposite direction */}
          <div
            className="absolute inset-[16%] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(217,70,239,0.16) 30%, #d946ef 65%, transparent 95%)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              animation: "appSpinRev 1.1s linear infinite",
              filter: "drop-shadow(0 0 8px rgba(217,70,239,0.5))",
            }}
          />
          {/* glowing core */}
          <div
            className="absolute inset-[38%] rounded-full bg-indigo-400"
            style={{
              boxShadow:
                "0 0 14px 3px rgba(99,102,241,0.9), 0 0 30px 8px rgba(217,70,239,0.35)",
              animation: "appPulse 1.2s ease-in-out infinite",
            }}
          />
          {/* orbiting dots */}
          {[
            { delay: "0s", color: "#818cf8", size: 5 },
            { delay: "-0.45s", color: "#e879f9", size: 4 },
            { delay: "-0.9s", color: "#a5b4fc", size: 3 },
          ].map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                inset: 0,
                background: "transparent",
                animation: `appSpin 1.8s linear infinite`,
                animationDelay: d.delay,
              } as React.CSSProperties}
            >
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: d.size,
                  height: d.size,
                  background: d.color,
                  boxShadow: `0 0 8px 2px ${d.color}66`,
                  animation: "appFadeIn 0.6s ease-out both",
                }}
              />
            </span>
          ))}
        </div>

        {/* caption */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
            style={{ animation: "appFadeIn 0.5s ease-out both" }}
          >
            Loading
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-indigo-400"
                style={{ animation: `appDot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes appSpin { to { transform: rotate(360deg) } }
          @keyframes appSpinRev { to { transform: rotate(-360deg) } }
          @keyframes appPulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(0.8); opacity: 0.75 } }
          @keyframes appFadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
          @keyframes appDot { 0%,100% { opacity: .25; transform: scale(1) } 50% { opacity: 1; transform: scale(1.5) } }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
