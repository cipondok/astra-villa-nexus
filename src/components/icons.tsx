
import { LucideProps } from "lucide-react";
import {
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react";

const MetaAILogo = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    className={props.className}
    {...props}
  >
    <defs>
      <linearGradient id="metaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#0081FB", stopOpacity: 1 }} />
        <stop offset="25%" style={{ stopColor: "#0D91FF", stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: "#A855F7", stopOpacity: 1 }} />
        <stop offset="75%" style={{ stopColor: "#E879F9", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#7C3AED", stopOpacity: 1 }} />
      </linearGradient>
      
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#FFFFFF", stopOpacity: 0.8 }} />
        <stop offset="50%" style={{ stopColor: "#FFFFFF", stopOpacity: 0.2 }} />
        <stop offset="100%" style={{ stopColor: "#FFFFFF", stopOpacity: 0 }} />
      </linearGradient>
      
      <radialGradient id="metaGlow">
        <stop offset="0%" style={{ stopColor: "#A855F7", stopOpacity: 0.6 }} />
        <stop offset="100%" style={{ stopColor: "#A855F7", stopOpacity: 0 }} />
      </radialGradient>
      
      <filter id="glass" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
        <feOffset dx="0" dy="0.5" result="offsetblur"/>
        <feFlood floodColor="#FFFFFF" floodOpacity="0.3"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer glow effect */}
    <circle
      cx="12"
      cy="12"
      r="11"
      fill="url(#metaGlow)"
    />
    
    {/* Main crystal ring */}
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="url(#metaGradient)"
      strokeWidth="3.5"
      fill="none"
      opacity="0.95"
      filter="url(#glass)"
      strokeLinecap="round"
    />
    
    {/* Glass highlight on top */}
    <path
      d="M 12 4 A 8 8 0 0 1 18 8"
      stroke="url(#shimmer)"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
      strokeLinecap="round"
    />
    
    {/* Inner crystal ring */}
    <circle
      cx="12"
      cy="12"
      r="5"
      stroke="url(#metaGradient)"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
      filter="url(#glass)"
    />
    
    {/* Inner highlight */}
    <path
      d="M 12 7 A 5 5 0 0 1 15.5 9"
      stroke="url(#shimmer)"
      strokeWidth="1.5"
      fill="none"
      opacity="0.5"
      strokeLinecap="round"
    />
    
    {/* Center sparkle */}
    <circle
      cx="12"
      cy="12"
      r="1.5"
      fill="url(#metaGradient)"
      filter="url(#glass)"
    />
  </svg>
);

export const Icons = {
  logo: MetaAILogo,
  aiLogo: MetaAILogo,
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,
};
