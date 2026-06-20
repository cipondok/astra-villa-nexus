import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Cookie, ShieldCheck, BarChart3, Megaphone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const PREFS_KEY = "astra-villa-cookie-preferences";

type Prefs = { necessary: true; analytics: boolean; marketing: boolean };

const defaultPrefs: Prefs = { necessary: true, analytics: false, marketing: false };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {}
  return defaultPrefs;
}

export default function CookiePreferences() {
  const { hasConsented, acceptCookies, rejectCookies, resetConsent } = useCookieConsent();
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setPrefs(loadPrefs()); }, []);

  const save = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    if (prefs.analytics || prefs.marketing) acceptCookies();
    else rejectCookies();
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const Toggle = ({ icon: Icon, title, desc, value, onChange, disabled }: any) => (
    <div className="reos-card p-4 flex items-start gap-3">
      <Icon className="h-5 w-5 text-[var(--gold)] mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium text-[14px]">{title}</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-10 h-5 bg-muted peer-checked:bg-[var(--gold)] rounded-full transition-colors peer-disabled:opacity-60" />
            <div className="absolute left-0.5 top-0.5 bg-background w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
        <p className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="reos min-h-screen">
      <SEOHead title="Cookie Preferences" description="Manage your cookie preferences for ASTRA Villa Property." />
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-3xl mx-auto px-6 py-14 text-center">
          <Cookie className="h-8 w-8 mx-auto mb-4 text-[var(--gold)]" />
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Cookie Preferences</h1>
          <p className="mt-3 text-sm text-[var(--text-2)] max-w-xl mx-auto">
            Control how ASTRA Villa Property uses cookies on this device. For details, read our{" "}
            <Link to="/cookies" className="text-[var(--gold)] hover:underline inline-flex items-center gap-1">
              Cookie Policy <ExternalLink className="h-3 w-3" />
            </Link>.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-10 space-y-3">
        <Toggle
          icon={ShieldCheck}
          title="Necessary (always on)"
          desc="Required for authentication, security, and core Platform functionality. Cannot be disabled."
          value={true}
          disabled
          onChange={() => {}}
        />
        <Toggle
          icon={BarChart3}
          title="Analytics"
          desc="Help us understand how visitors interact with the Platform to improve performance."
          value={prefs.analytics}
          onChange={(v: boolean) => setPrefs({ ...prefs, analytics: v })}
        />
        <Toggle
          icon={Megaphone}
          title="Marketing"
          desc="Used to measure campaign effectiveness and personalize property recommendations on partner sites."
          value={prefs.marketing}
          onChange={(v: boolean) => setPrefs({ ...prefs, marketing: v })}
        />

        <div className="flex flex-wrap gap-2 pt-4">
          <button onClick={save} className="btn-titanium text-xs px-4 py-2 rounded-lg font-medium">
            Save preferences
          </button>
          <button
            onClick={() => { setPrefs({ necessary: true, analytics: true, marketing: true }); }}
            className="text-xs px-4 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)]"
          >
            Accept all
          </button>
          <button
            onClick={() => { setPrefs(defaultPrefs); }}
            className="text-xs px-4 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)]"
          >
            Reject all
          </button>
          <button
            onClick={resetConsent}
            className="text-xs px-4 py-2 rounded-lg text-[var(--text-2)] hover:text-foreground"
          >
            Reset & show banner
          </button>
        </div>

        {saved && (
          <p className="text-xs text-[var(--gold)] mt-2">Your preferences have been saved.</p>
        )}
        <p className="text-[11px] text-[var(--text-2)] pt-4">
          Current consent status:{" "}
          <span className="font-medium">
            {hasConsented === true ? "Accepted" : hasConsented === false ? "Rejected" : "Not set"}
          </span>
        </p>
      </section>
    </div>
  );
}
