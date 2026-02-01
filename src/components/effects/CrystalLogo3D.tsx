import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const logoSizes = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer',
        sizeClasses[size],
        className
      )}
    >
      {/* Outer holographic glow ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-60 transition-opacity duration-500"
        style={{
          background: 'conic-gradient(from 0deg, #ff006620, #00ffff30, #ff00ff25, #ffff0020, #00ff6620, #ff006620)',
          filter: 'blur(8px)',
          animation: 'spin 8s linear infinite',
        }}
      />

      {/* Crystal bubble container */}
      <div 
        className="absolute inset-1 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: `
            inset 0 2px 20px rgba(255,255,255,0.5),
            inset 0 -2px 20px rgba(255,255,255,0.2),
            0 8px 32px rgba(0,0,0,0.1),
            0 0 60px rgba(100,200,255,0.15)
          `,
          border: '1.5px solid rgba(255,255,255,0.5)',
        }}
      >
        {/* Rainbow shimmer overlay */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden opacity-40 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, transparent 20%, rgba(255,100,150,0.3) 30%, rgba(100,200,255,0.3) 50%, rgba(150,255,150,0.3) 70%, transparent 80%)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />

        {/* Inner glass refraction effect */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 60%)',
          }}
        />

        {/* Secondary refraction */}
        <div 
          className="absolute bottom-2 right-2 w-1/3 h-1/4 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-3 right-1 w-0.5 h-0.5 bg-cyan-200 rounded-full"
          style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
        />
        <div 
          className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-pink-200 rounded-full"
          style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}
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
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) rotate(0deg); }
          50% { transform: translateX(100%) rotate(5deg); }
        }
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
