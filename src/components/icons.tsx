
import { LucideProps } from "lucide-react";
import {
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import { LOGO_PLACEHOLDER } from "@/hooks/useBrandingLogo";
import { cn } from "@/lib/utils";

interface MetaAILogoProps extends LucideProps {
  logoUrl?: string;
}

const MetaAILogo = ({ logoUrl, ...props }: MetaAILogoProps) => (
  <div className="relative inline-flex items-center justify-center" style={{ background: 'transparent' }}>
    <img 
      src={logoUrl || LOGO_PLACEHOLDER} 
      alt="ASTRA AI" 
      width={props.size || 32}
      height={props.size || 32}
      className={cn("relative z-10 object-contain", props.className)}
      style={{ 
        width: props.size || 32, 
        height: props.size || 32,
        background: 'transparent',
        mixBlendMode: 'normal'
      }}
    />
  </div>
);

export const Icons = {
  logo: MetaAILogo,
  aiLogo: MetaAILogo,
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,
};
