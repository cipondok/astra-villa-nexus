
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
    <div className="absolute inset-0 bg-gray-900 dark:bg-gray-950 rounded-full" style={{ 
      width: props.size || 100, 
      height: props.size || 100 
    }}></div>
    <img 
      src={astraLogo} 
      alt="ASTRA AI" 
      width={props.size || 100}
      height={props.size || 100}
      className={cn("relative z-10", props.className)}
      style={{ width: props.size || 100, height: props.size || 100 }}
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
