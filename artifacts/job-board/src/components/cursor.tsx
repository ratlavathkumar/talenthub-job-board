import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const styleTag = document.createElement("style");
    styleTag.id = "custom-cursor-hide";
    styleTag.textContent = "* { cursor: none !important; }";
    document.head.appendChild(styleTag);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;
    let hovering = false;
    let clicking = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      const target = e.target as HTMLElement;
      const isClickable = !!target.closest("a, button, [role=button], input, select, textarea, label, [data-testid]");
      if (isClickable !== hovering) {
        hovering = isClickable;
        ring.style.width = isClickable ? "52px" : "36px";
        ring.style.height = isClickable ? "52px" : "36px";
        ring.style.borderColor = isClickable
          ? "hsl(var(--primary))"
          : "hsl(var(--primary) / 0.45)";
        ring.style.opacity = isClickable ? "0.75" : "0.5";
        ring.style.background = isClickable ? "hsl(var(--primary) / 0.06)" : "transparent";
      }
    };

    const onDown = () => {
      clicking = true;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(0.6)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) scale(0.85)`;
    };

    const onUp = () => {
      clicking = false;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.11;
      ringY += (mouseY - ringY) * 0.11;
      const w = parseFloat(ring.style.width) || 36;
      const h = parseFloat(ring.style.height) || 36;
      if (!clicking) {
        ring.style.transform = `translate(${ringX - w / 2}px, ${ringY - h / 2}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
      document.getElementById("custom-cursor-hide")?.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          marginLeft: "-4px",
          marginTop: "-4px",
          background: "hsl(var(--primary))",
          transition: "transform 0.08s ease",
          boxShadow: "0 0 6px 2px hsl(var(--primary) / 0.35)",
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform rounded-full"
        style={{
          width: "36px",
          height: "36px",
          border: "2px solid hsl(var(--primary) / 0.45)",
          opacity: "0.5",
          transition: "width 0.22s ease, height 0.22s ease, border-color 0.22s ease, opacity 0.22s ease, background 0.22s ease",
        }}
      />
    </>
  );
}
