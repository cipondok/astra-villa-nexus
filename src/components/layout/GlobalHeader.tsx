import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Globe, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AstraThemeSwitcher from "@/components/theme/AstraThemeSwitcher";
import { cn } from "@/lib/utils";

interface Props {
  /** Show the universal search input. Defaults to true. */
  showSearch?: boolean;
  /** Optional brand label override. Defaults to "ASTRA Villa". */
  brand?: string;
  /** Stick to top with backdrop blur. Defaults to true. */
  sticky?: boolean;
  /** Callback fired when the user clicks the sign-in / register CTAs. */
  onAuthOpen?: (mode: "login" | "register") => void;
}

/**
 * ASTRA Design System V3 — Global Header
 *
 * Unified header for every page: logo, universal search, language selector,
 * theme switcher, notifications, and user menu. Sticky with glass effect.
 * Fully responsive (mobile hamburger drawer at < md).
 */
export default function GlobalHeader({
  showSearch = true,
  brand = "ASTRA Villa",
  sticky = true,
  onAuthOpen,
}: Props) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/properties?search=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const displayName =
    (profile as any)?.full_name || user?.email?.split("@")[0] || "Guest";

  return (
    <header
      className={cn(
        "z-50 w-full border-b border-border/60",
        "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        sticky && "sticky top-0"
      )}
    >
      <div className="container flex h-14 items-center gap-3 md:h-16 md:gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          aria-label={`${brand} home`}
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold uppercase text-primary-foreground shadow-sm"
          >
            AV
          </span>
          <span className="hidden text-sm sm:inline-block md:text-base">{brand}</span>
        </Link>

        {/* Universal search (desktop) */}
        {showSearch && (
          <form
            onSubmit={handleSearch}
            role="search"
            className="ml-2 hidden flex-1 max-w-xl items-center md:flex"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search properties, locations, agents…"
                className="h-9 rounded-full border-border/60 bg-muted/50 pl-9 pr-3 text-sm focus-visible:ring-primary"
                aria-label="Universal search"
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Language"
                className="hidden sm:inline-flex"
              >
                <Globe className="h-4 w-4 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Language
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage("id")}>
                <span className={cn("text-sm", language === "id" && "text-primary font-medium")}>
                  Bahasa Indonesia
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                <span className={cn("text-sm", language === "en" && "text-primary font-medium")}>
                  English
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme */}
          <AstraThemeSwitcher />

          {/* Notifications */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="default"
                className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[9px] leading-none text-primary-foreground"
              >
                •
              </Badge>
            </Button>
          )}

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-medium md:inline-block">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAuthOpen?.("login") ?? navigate("/auth")}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => onAuthOpen?.("register") ?? navigate("/auth?mode=register")}
              >
                Join
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl"
          >
            <div className="container space-y-3 py-4">
              {showSearch && (
                <form onSubmit={handleSearch} role="search">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search…"
                      className="h-10 rounded-full border-border/60 bg-muted/50 pl-9"
                    />
                  </div>
                </form>
              )}
              {!user && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      onAuthOpen?.("login") ?? navigate("/auth");
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      onAuthOpen?.("register") ?? navigate("/auth?mode=register");
                    }}
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
