
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
      <radialGradient id="metaGlow">
        <stop offset="0%" style={{ stopColor: "#A855F7", stopOpacity: 0.4 }} />
        <stop offset="100%" style={{ stopColor: "#A855F7", stopOpacity: 0 }} />
      </radialGradient>
    </defs>
    
    {/* Outer glow effect */}
    <circle
      cx="12"
      cy="12"
      r="11"
      fill="url(#metaGlow)"
    />
    
    {/* Main ring */}
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="url(#metaGradient)"
      strokeWidth="3"
      fill="none"
      opacity="0.9"
    />
    
    {/* Inner ring */}
    <circle
      cx="12"
      cy="12"
      r="5"
      stroke="url(#metaGradient)"
      strokeWidth="2"
      fill="none"
      opacity="0.6"
    />
    
    {/* Center sparkle effect */}
    <circle
      cx="12"
      cy="12"
      r="1.5"
      fill="url(#metaGradient)"
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
