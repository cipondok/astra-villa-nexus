
import { LucideProps } from "lucide-react";
import {
  User,
  Settings,
  LogOut,
  Home,
  Crown,
} from "lucide-react";

export const Icons = {
  logo: (props: LucideProps) => <Crown {...props} />,
  user: User,
  settings: Settings,
  logout: LogOut,
  home: Home,
};
