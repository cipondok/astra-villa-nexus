
import { LucideProps } from "lucide-react";
import {
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import astraLogo from "@/assets/astra-logo.png";
import { cn } from "@/lib/utils";

const MetaAILogo = (props: LucideProps) => (
  <div className="relative inline-flex items-center justify-center">
    <div className="absolute inset-0 rounded-full" style={{ 
      width: props.size || 55, 
      height: props.size || 55,
      backgroundColor: '#4a3c31'
    }}></div>
    <img 
      src={astraLogo} 
      alt="ASTRA AI" 
      width={props.size || 55}
      height={props.size || 55}
      className={cn("relative z-10", props.className)}
      style={{ width: props.size || 55, height: props.size || 55 }}
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
