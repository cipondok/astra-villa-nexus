import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const logoSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer',
        sizeClasses[size],
        className
      )}
    >
      {/* Outer holographic glow ring - tight around logo */}
      <div 
        className="absolute inset-0.5 rounded-full opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, #ff006620, #00ffff30, #ff00ff25, #ffff0020, #00ff6620, #ff006620)',
          filter: 'blur(4px)',
          animation: 'spin 8s linear infinite',
        }}
      />

      {/* Crystal bubble container - tight */}
      <div 
        className="absolute inset-0.5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: `
            inset 0 1px 10px rgba(255,255,255,0.5),
            inset 0 -1px 10px rgba(255,255,255,0.2),
            0 4px 16px rgba(0,0,0,0.08)
          `,
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        {/* Static rainbow gradient overlay - no animation */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,100,150,0.2) 0%, rgba(100,200,255,0.2) 50%, rgba(150,255,150,0.2) 100%)',
          }}
        />

        {/* Inner glass refraction effect */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)',
          }}
        />

        {/* Secondary refraction */}
        <div 
          className="absolute bottom-1 right-1 w-1/4 h-1/5 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Floating particles - smaller */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-white rounded-full"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-1.5 right-0.5 w-0.5 h-0.5 bg-cyan-200 rounded-full"
          style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
        />
      </div>

      {/* Logo - perfectly centered and clear */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <img
          src={logoUrl}
          alt="Logo"
          className={cn(
            'object-contain',
            logoSizes[size]
          )}
          style={{
            imageRendering: 'crisp-edges',
            filter: 'drop-shadow(0 2px 8px rgba(214,182,126,0.4))',
          }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Subtle pulsing glow behind logo */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ animation: 'pulse-glow 2.5s ease-in-out infinite' }}
      >
        <div 
          className={cn('rounded-full bg-amber-400/20 blur-md', logoSizes[size])}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-4px) scale(1.2); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CrystalLogo3D;
