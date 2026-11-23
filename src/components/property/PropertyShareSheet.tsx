import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, Instagram, Link2, MessageCircle, QrCode, Send, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { trackShareClick } from "@/lib/shareAnalytics";
import { shareCaption, shareIntentUrl, withUtm, type ShareChannel, type ShareTarget } from "@/lib/propertyShare";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  target: ShareTarget;
  image?: string | null;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
    <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h6.9l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.4 3.9H4.4L17.7 20Z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
    <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4Z" />
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
    <path d="M16.6 2c.3 2.3 1.6 3.9 3.9 4.1v3.1c-1.4.1-2.7-.3-3.9-1.1v6.1c0 4.1-4.3 6.7-7.9 4.7-2.3-1.3-3.3-4.1-2.4-6.6.9-2.5 3.5-3.9 6.1-3.4v3.2c-.4-.1-.8-.2-1.2-.1-1.3.1-2.2 1.2-2.1 2.5.2 1.9 2.6 2.7 3.9 1.3.4-.5.6-1.1.6-1.8V2h3Z" />
  </svg>
);

export function PropertyShareSheet({ open, onOpenChange, propertyId, target, image }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<ShareChannel | null>(null);
  const [showQr, setShowQr] = useState(false);

  const log = (channel: ShareChannel, extra?: Record<string, unknown>) =>
    trackShareClick({ channel, propertyId, metadata: { url: target.url, ...extra } });

  const openIntent = (channel: ShareChannel) => {
    const url = shareIntentUrl(channel, target);
    if (!url) return;
    log(channel);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyFor = async (channel: ShareChannel) => {
    const link = withUtm(target.url, channel);
    const text = channel === "copy_link" ? link : `${shareCaption(target)}\n${link}`;
    const ok = await copyText(text);
    if (!ok) {
      toast({ title: "Couldn't copy", description: "Please copy the link from your browser's address bar." });
      return;
    }
    log(channel);
    setCopied(channel);
    window.setTimeout(() => setCopied(null), 2500);
    if (channel === "instagram" || channel === "tiktok") {
      toast({
        title: "Caption and link copied",
        description: `Save the photo, then paste the caption in ${channel === "instagram" ? "Instagram" : "TikTok"}. Put the link in your bio or story link.`,
      });
    } else {
      toast({ title: "Link copied" });
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: target.title, text: shareCaption(target), url: withUtm(target.url, "native") });
      log("native");
    } catch {
      /* cancelled */
    }
  };

  const qrUrl = withUtm(target.url, "qr");

  const channels: { key: ShareChannel; label: string; icon: React.ReactNode; onClick: () => void }[] = [
    { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-5 w-5" />, onClick: () => openIntent("whatsapp") },
    { key: "facebook", label: "Facebook", icon: <FacebookIcon />, onClick: () => openIntent("facebook") },
    { key: "telegram", label: "Telegram", icon: <Send className="h-5 w-5" />, onClick: () => openIntent("telegram") },
    { key: "x", label: "X", icon: <XIcon />, onClick: () => openIntent("x") },
    { key: "instagram", label: "Instagram", icon: <Instagram className="h-5 w-5" />, onClick: () => copyFor("instagram") },
    { key: "tiktok", label: "TikTok", icon: <TikTokIcon />, onClick: () => copyFor("tiktok") },
    { key: "copy_link", label: "Copy link", icon: copied === "copy_link" ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />, onClick: () => copyFor("copy_link") },
    { key: "qr", label: "QR code", icon: <QrCode className="h-5 w-5" />, onClick: () => { setShowQr((v) => !v); if (!showQr) log("qr"); } },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" aria-hidden="true" /> Share this property
          </DialogTitle>
          <DialogDescription className="text-xs">
            Every link opens this exact listing, also on phones.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 gap-3 rounded-xl border border-border bg-muted/40 p-2.5">
          {image && <img src={image} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />}
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold leading-snug line-clamp-2">{target.title.replace(/\b(KABUPATEN|KOTA)\s+/g, "")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{[target.price, target.place].filter(Boolean).join(" · ")}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{target.url.replace(/^https:\/\//, "")}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {channels.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.onClick}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background/60 px-1 text-[11px] font-medium transition-colors hover:border-primary/50 hover:bg-primary/10",
                (c.key === "qr" && showQr) && "border-primary/60 bg-primary/10",
              )}
            >
              <span className="text-primary">{copied === c.key && c.key !== "copy_link" ? <Check className="h-5 w-5" /> : c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {showQr && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={qrUrl} size={168} level="M" aria-label="QR code for this property" />
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Scan to open this listing. Good for flyers and open houses.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {image && (
            <a
              href={image}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 text-xs font-medium hover:bg-muted/60"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Save photo
            </a>
          )}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Copy className="h-4 w-4" aria-hidden="true" /> More apps
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyShareSheet;
