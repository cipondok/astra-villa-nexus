import { Link } from "react-router-dom";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import brandLogoFallback from "@/assets/astra-logo-optimized.png";

const FOOTER_COLUMNS: [string, [string, string][]][] = [
  ["Discover", [["Villas","/properties"],["Collections","/properties?collection=curated"],["Destinations","/area-guides"],["Editorial","/community"]]],
  ["Platform", [["Investor OS","/investment"],["3D Tours","/vr-tour"],["Concierge","/wealth-advisor"],["Analytics","/market-heatmap"]]],
  ["Astra",    [["About","/about"],["Press","/community"],["Careers","/contact"],["Contact","/contact"]]],
];

export function LuxeFooter() {
  const { logoUrl: footerLogo } = useBrandingLogo("footerLogo", brandLogoFallback);
  return (
    <footer className="relative pt-20 pb-32 md:pb-16 border-t border-luxe">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full grid place-items-center overflow-hidden"
                style={{ background: "linear-gradient(135deg,#C8A96B,#8C6B2F)" }}>
                <img src={footerLogo} alt="Astra Villa" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-serif-l text-[18px]">Astra<span className="text-luxe-gold"> Villa</span></span>
            </div>
            <p className="mt-5 text-[12px] text-luxe-mut max-w-xs leading-relaxed">
              The AI Property Operating System for Bali. Quiet luxury, told in code and light.
            </p>
          </div>
          {FOOTER_COLUMNS.map(([h, items]) => (
            <div key={h}>
              <div className="luxe-eyebrow mb-5">{h}</div>
              <ul className="space-y-3 text-[13px] text-luxe-fg/75">
                {items.map(([label, to]) => (
                  <li key={label}><Link to={to} className="hover:text-luxe-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-6 border-t border-luxe flex flex-col md:flex-row justify-between gap-3 text-[11px] text-luxe-mut font-mono-l">
          <span>© MMXXVI ASTRA VILLA · Denpasar · Bali</span>
          <span>Crafted with intention. Powered by AI.</span>
        </div>
      </div>
    </footer>
  );
}
