
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
    <img 
      src={astraLogo} 
      alt="ASTRA AI" 
      width={props.size || 32}
      height={props.size || 32}
      className={cn("relative z-10 object-contain", props.className)}
      style={{ width: props.size || 32, height: props.size || 32 }}
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
