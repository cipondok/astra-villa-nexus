import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const containerSizes = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const logoSizes = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer flex items-center justify-center',
        containerSizes[size],
        className
      )}
      style={{ perspective: '500px' }}
    >
      {/* Single 3D Crystal Glass Ring - around logo */}
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
          animation: 'ring-spin 5s linear infinite',
          boxShadow: '0 0 12px rgba(150,120,255,0.35)',
        }}
      />

      {/* Logo - centered inside the ring, clear and visible */}
      <img
        src={logoUrl}
        alt="Logo"
        className={cn('object-contain relative z-10', logoSizes[size])}
        style={{
          imageRendering: 'crisp-edges',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
        }}
        loading="eager"
        decoding="async"
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes ring-spin {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to { transform: rotateX(70deg) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CrystalLogo3D;
