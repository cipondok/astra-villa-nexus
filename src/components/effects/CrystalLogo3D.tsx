import React from 'react';
import { cn } from '@/lib/utils';

interface CrystalLogo3DProps {
  logoUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrystalLogo3D = ({ logoUrl, className = '', size = 'md' }: CrystalLogo3DProps) => {
  const containerSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const logoSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <div 
      className={cn(
        'relative cursor-pointer flex items-center justify-center',
        containerSizes[size],
        className
      )}
    >
      {/* Siri-style animated bubble background - Light Blue Water Theme */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Blob 1 - Light Sky Blue */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
            opacity: 0.7,
            filter: 'blur(2px)',
            animation: 'siri-blob-1 4s ease-in-out infinite',
          }}
        />
        
        {/* Blob 2 - Aqua/Cyan */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '90%',
            height: '90%',
            background: 'linear-gradient(225deg, #67e8f9 0%, #22d3ee 50%, #06b6d4 100%)',
            opacity: 0.6,
            filter: 'blur(1px)',
            animation: 'siri-blob-2 4s ease-in-out infinite 0.5s',
          }}
        />
        
        {/* Blob 3 - Deep Water Blue */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '95%',
            height: '95%',
            background: 'linear-gradient(45deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
            opacity: 0.5,
            animation: 'siri-blob-3 4s ease-in-out infinite 1s',
          }}
        />

        {/* Inner glow core - Light aqua center */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '75%',
            height: '75%',
            background: 'radial-gradient(circle, rgba(224,247,255,0.95) 0%, rgba(186,230,253,0.5) 40%, transparent 70%)',
            animation: 'siri-core 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Logo - centered inside, clear and visible */}
      <img
        src={logoUrl}
        alt="Logo"
        className={cn('object-contain relative z-10', logoSizes[size])}
        style={{
          imageRendering: 'crisp-edges',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
        }}
        loading="eager"
        decoding="async"
      />

      {/* CSS Animations - Siri style */}
      <style>{`
        @keyframes siri-blob-1 {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            border-radius: 50%;
          }
          25% { 
            transform: scale(1.05) rotate(90deg);
            border-radius: 45% 55% 55% 45%;
          }
          50% { 
            transform: scale(0.95) rotate(180deg);
            border-radius: 55% 45% 45% 55%;
          }
          75% { 
            transform: scale(1.02) rotate(270deg);
            border-radius: 48% 52% 52% 48%;
          }
        }
        
        @keyframes siri-blob-2 {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            border-radius: 55% 45% 50% 50%;
          }
          33% { 
            transform: scale(1.08) rotate(-120deg);
            border-radius: 45% 55% 55% 45%;
          }
          66% { 
            transform: scale(0.92) rotate(-240deg);
            border-radius: 50% 50% 45% 55%;
          }
        }
        
        @keyframes siri-blob-3 {
          0%, 100% { 
            transform: scale(1.02) rotate(0deg);
            border-radius: 48% 52% 55% 45%;
          }
          50% { 
            transform: scale(0.98) rotate(180deg);
            border-radius: 52% 48% 45% 55%;
          }
        }
        
        @keyframes siri-core {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CrystalLogo3D;
