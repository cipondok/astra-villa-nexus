import { memo } from 'react';

const GoldSparkleEffect = memo(() => {
  return (
    <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden" aria-hidden="true">
      {/* CSS-based gold particles */}
      <div className="gold-sparkle-container w-full h-full relative">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="gold-sparkle"
            style={{
              left: `${5 + (i * 37 + i * i * 7) % 90}%`,
              top: `${10 + (i * 23 + i * 3) % 80}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${3 + (i % 4) * 1.2}s`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
      <style>{`
        .gold-sparkle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(45 85% 75% / 0.9), hsl(45 70% 60% / 0.4), transparent 70%);
          box-shadow: 0 0 6px 2px hsl(45 80% 65% / 0.3);
          animation: sparkle-float linear infinite;
          opacity: 0;
          will-change: transform, opacity;
        }
        @keyframes sparkle-float {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          15% { opacity: 0.8; transform: translateY(-8px) scale(1); }
          50% { opacity: 0.4; transform: translateY(-20px) scale(0.8); }
          85% { opacity: 0.7; transform: translateY(-32px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-45px) scale(0.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gold-sparkle { animation: none !important; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
});

GoldSparkleEffect.displayName = 'GoldSparkleEffect';

export default GoldSparkleEffect;
