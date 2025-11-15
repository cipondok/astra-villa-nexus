
import { LucideProps } from "lucide-react";
import {
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import astraLogo from "@/assets/astra-logo.png";

const MetaAILogo = (props: LucideProps) => (
  <img 
    src={astraLogo} 
    alt="ASTRA AI" 
    width={props.size || 100}
    height={props.size || 100}
    className={props.className}
    style={{ width: props.size || 100, height: props.size || 100 }}
  />
);

export const Icons = {
  logo: MetaAILogo,
  aiLogo: MetaAILogo,
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,
};
