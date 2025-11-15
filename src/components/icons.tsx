
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
        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: "hsl(280, 100%, 60%)", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "hsl(200, 100%, 60%)", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="url(#metaGradient)"
      strokeWidth="2.5"
      fill="none"
    />
    <circle
      cx="12"
      cy="12"
      r="5"
      stroke="url(#metaGradient)"
      strokeWidth="2"
      fill="none"
    />
    <circle
      cx="12"
      cy="8"
      r="1.5"
      fill="url(#metaGradient)"
    />
    <circle
      cx="12"
      cy="16"
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
