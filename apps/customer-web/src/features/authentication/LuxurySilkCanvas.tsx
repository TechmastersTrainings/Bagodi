import React, { useEffect, useRef } from "react";

interface LuxurySilkCanvasProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const LuxurySilkCanvas: React.FC<LuxurySilkCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse tracking with smooth lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };

    resize();
    window.addEventListener("resize", resize);

    // Observe parent element for fluid responsiveness on any container dimension change
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize golden zari micro-particles
    const particleCount = 42;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 900),
        radius: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.45 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    // Multi-layer royal silk ribbon wave configurations
    const ribbons = [
      {
        yBaseRatio: 0.88,
        amplitude: 65,
        frequency: 0.0022,
        speed: 0.008,
        colorStart: "rgba(110, 10, 25, 0.95)",
        colorEnd: "rgba(35, 4, 10, 0.98)",
        highlight: "rgba(227, 27, 35, 0.35)",
        blur: 0,
      },
      {
        yBaseRatio: 0.76,
        amplitude: 80,
        frequency: 0.0028,
        speed: 0.012,
        colorStart: "rgba(165, 18, 38, 0.85)",
        colorEnd: "rgba(60, 6, 16, 0.95)",
        highlight: "rgba(255, 75, 90, 0.3)",
        blur: 0,
      },
      {
        yBaseRatio: 0.62,
        amplitude: 95,
        frequency: 0.0024,
        speed: 0.015,
        colorStart: "rgba(195, 24, 45, 0.72)",
        colorEnd: "rgba(95, 10, 24, 0.88)",
        highlight: "rgba(227, 27, 35, 0.45)",
        blur: 0,
      },
      {
        yBaseRatio: 0.48,
        amplitude: 110,
        frequency: 0.0031,
        speed: 0.018,
        colorStart: "rgba(145, 15, 32, 0.55)",
        colorEnd: "rgba(45, 5, 12, 0.85)",
        highlight: "rgba(212, 175, 55, 0.35)", // Shimmering Gold Zari Weave Accent
        blur: 0,
      },
      {
        yBaseRatio: 0.35,
        amplitude: 125,
        frequency: 0.0026,
        speed: 0.021,
        colorStart: "rgba(85, 8, 20, 0.45)",
        colorEnd: "rgba(20, 2, 6, 0.82)",
        highlight: "rgba(235, 200, 110, 0.25)", // Subtle Champagne Gold Filament
        blur: 0,
      },
    ];

    const render = () => {
      if (!ctx || width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      time += 0.016;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Deep Midnight Velvet Canvas Base
      const bgGradient = ctx.createLinearGradient(0, 0, width * 0.6, height);
      bgGradient.addColorStop(0, "#13080B");
      bgGradient.addColorStop(0.45, "#1B090F");
      bgGradient.addColorStop(0.85, "#0F0508");
      bgGradient.addColorStop(1, "#070204");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient Floating Royal Glow Orbs (Soft Diffusion)
      const orb1X = width * 0.35 + Math.sin(time * 0.6) * 50 + mouseX * 40;
      const orb1Y = height * 0.38 + Math.cos(time * 0.5) * 45 + mouseY * 40;
      const rad1 = Math.max(width, height) * 0.55;
      const orb1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, rad1);
      orb1.addColorStop(0, "rgba(227, 27, 35, 0.22)");
      orb1.addColorStop(0.45, "rgba(140, 15, 30, 0.12)");
      orb1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, width, height);

      // Ambient Champagne Gold Accent Glow
      const orb2X = width * 0.72 + Math.cos(time * 0.4) * 40 - mouseX * 30;
      const orb2Y = height * 0.68 + Math.sin(time * 0.55) * 40 - mouseY * 30;
      const rad2 = Math.max(width, height) * 0.45;
      const orb2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, rad2);
      orb2.addColorStop(0, "rgba(212, 175, 55, 0.16)");
      orb2.addColorStop(0.5, "rgba(180, 130, 40, 0.06)");
      orb2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, width, height);

      // 3. Render Flowing Silk Ribbons
      ribbons.forEach((ribbon, idx) => {
        ctx.save();

        const yBase = height * ribbon.yBaseRatio + mouseY * 45;
        const wavePhase = time * ribbon.speed * 45 + idx * 1.35;
        const mouseShift = mouseX * 55;

        // Draw Ribbon Body
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, yBase);

        const segments = 24;
        const segmentWidth = width / segments;

        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const normalX = x / width;

          // Sinusoidal wave harmonics for natural organic silk draping
          const w1 = Math.sin(x * ribbon.frequency + wavePhase) * ribbon.amplitude;
          const w2 = Math.cos(x * ribbon.frequency * 1.8 - wavePhase * 0.8) * (ribbon.amplitude * 0.4);
          const w3 = Math.sin((x + mouseShift) * ribbon.frequency * 0.5 + wavePhase * 0.5) * (ribbon.amplitude * 0.25);

          // Subtle wave taper at edges
          const edgeCurve = Math.sin(normalX * Math.PI) * 1.15;
          const y = yBase + (w1 + w2 + w3) * edgeCurve;

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            const prevX = (i - 1) * segmentWidth;
            const cX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, y, cX, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Ribbon Fill Gradient
        const ribbonGrad = ctx.createLinearGradient(0, yBase - ribbon.amplitude, width * 0.7, height);
        ribbonGrad.addColorStop(0, ribbon.colorStart);
        ribbonGrad.addColorStop(1, ribbon.colorEnd);
        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Delicate Silk Edge Highlight Line
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = ribbon.highlight;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Render Golden Zari Micro-Stardust Particles
      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.25;
        p.x += p.vx + mouseX * 0.3;
        p.y += p.vy;

        // Wrap around gracefully
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        // Warm golden sparkle with radial glow
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);
        pGrad.addColorStop(0, `rgba(245, 220, 140, ${Math.max(0, Math.min(1, p.alpha))})`);
        pGrad.addColorStop(0.6, `rgba(212, 175, 55, ${Math.max(0, Math.min(1, p.alpha * 0.6))})`);
        pGrad.addColorStop(1, "rgba(212, 175, 55, 0)");

        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
};

