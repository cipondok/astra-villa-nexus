import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const containerSizes = {
    sm: 'h-10 gap-1',
    md: 'h-12 gap-1.5',
    lg: 'h-14 gap-2',
  };

  const logoSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const ringSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };

  return (
    <div 
      className={cn(
        'flex items-center cursor-pointer',
        containerSizes[size],
        className
      )}
    >
      {/* Logo - clear and visible */}
      <img
        src={logoUrl}
        alt="Logo"
        className={cn('object-contain flex-shrink-0', logoSizes[size])}
        style={{
          imageRendering: 'crisp-edges',
          filter: 'drop-shadow(0 2px 8px rgba(214,182,126,0.3))',
        }}
        loading="eager"
        decoding="async"
      />

      {/* Single 3D Crystal Glass Ring - next to logo */}
      <div 
        className={cn('relative flex-shrink-0', ringSizes[size])}
        style={{ perspective: '400px' }}
      >
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid transparent',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #34d399, #60a5fa) border-box',
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(70deg)',
            animation: 'ring-spin 4s linear infinite',
            boxShadow: '0 0 15px rgba(150,120,255,0.4)',
          }}
        />

        {/* Ring glow */}
        <div 
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(150,120,255,0.2) 0%, transparent 70%)',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ring-spin {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CrystalLogo3D;
