import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const logoSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };

  const ringSizes = {
    sm: 'inset-[-2px]',
    md: 'inset-[-3px]',
    lg: 'inset-[-4px]',
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer',
        sizeClasses[size],
        className
      )}
      style={{ perspective: '600px' }}
    >
      {/* 3D Crystal Glass Ring - Outer */}
      <div 
        className={cn("absolute rounded-full", ringSizes[size])}
        style={{
          background: 'conic-gradient(from 180deg, rgba(100,200,255,0.6), rgba(200,100,255,0.5), rgba(255,150,200,0.5), rgba(100,255,200,0.5), rgba(100,200,255,0.6))',
          animation: 'ring-rotate 6s linear infinite',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(75deg)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* 3D Ring - Inner glow */}
      <div 
        className={cn("absolute rounded-full", ringSizes[size])}
        style={{
          background: 'conic-gradient(from 0deg, rgba(255,255,255,0.8), rgba(200,220,255,0.4), rgba(255,255,255,0.8), rgba(220,200,255,0.4), rgba(255,255,255,0.8))',
          animation: 'ring-rotate 6s linear infinite reverse',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(75deg)',
          opacity: 0.7,
        }}
      />

      {/* Glass sphere backdrop */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 25%, rgba(200,220,255,0.15) 50%, rgba(180,200,255,0.1) 100%)',
          boxShadow: `
            inset 0 2px 15px rgba(255,255,255,0.8),
            inset 0 -3px 10px rgba(100,150,255,0.15),
            0 4px 20px rgba(100,150,255,0.15),
            0 0 30px rgba(150,100,255,0.1)
          `,
          border: '1px solid rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Top highlight reflection */}
      <div 
        className="absolute top-[8%] left-[15%] w-[35%] h-[20%] rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          filter: 'blur(1px)',
        }}
      />

      {/* Bottom subtle reflection */}
      <div 
        className="absolute bottom-[12%] right-[18%] w-[20%] h-[10%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
        }}
      />

      {/* Logo - centered and clear */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <img
          src={logoUrl}
          alt="Logo"
          className={cn('object-contain', logoSizes[size])}
          style={{
            imageRendering: 'crisp-edges',
            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.1))',
          }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Ambient glow */}
      <div 
        className="absolute inset-[-20%] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(150,180,255,0.15) 0%, transparent 60%)',
          animation: 'ambient-pulse 3s ease-in-out infinite',
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes ring-rotate {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateZ(360deg); }
        }
        @keyframes ambient-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default CrystalLogo3D;
