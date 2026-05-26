/**
 * LuxeAmbient — site-wide ambient mesh background.
 * Decorative only. Pointer events disabled.
 */
export function LuxeAmbient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full luxe-mesh-a opacity-70"
        style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.10), transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full luxe-mesh-a opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(79,178,134,0.08), transparent 70%)", filter: "blur(80px)", animationDelay: "-9s" }}
      />
      <div className="absolute inset-0 luxe-grain" />
    </div>
  );
}
