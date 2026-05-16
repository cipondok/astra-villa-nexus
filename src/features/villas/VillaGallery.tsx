import { useState } from "react";

export default function VillaGallery({ images, title }: { images: string[]; title: string }) {
  const safe = images.length > 0 ? images : ["/placeholder.svg"];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        <img src={safe[active]} alt={`${title} — image ${active + 1}`} className="h-full w-full object-cover" />
      </div>
      {safe.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safe.slice(0, 10).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
