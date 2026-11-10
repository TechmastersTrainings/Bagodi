import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  FC,
  MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./LiquidGlassNavbar.module.css";

// ============================================================================
// Types & Navigation Structure (Clean Text-Only Luxury Navigation)
// ============================================================================

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  featured?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "sarees",
    label: "Sarees",
    href: "/catalogue?category=sarees",
  },
  {
    id: "women-ethnic",
    label: "Women's Ethnic",
    href: "/catalogue?category=women-ethnic",
  },
  {
    id: "men-suiting",
    label: "Men's & Raymond",
    href: "/catalogue?category=men-suiting",
  },
  {
    id: "wedding",
    label: "Wedding Collection",
    href: "/catalogue?category=wedding",
  },
  {
    id: "fabrics",
    label: "Premium Fabrics",
    href: "/catalogue?category=fabrics",
  },
  {
    id: "kids",
    label: "Kids' Festive",
    href: "/catalogue?category=kids",
  },
  {
    id: "offers",
    label: "Festive Offers",
    href: "/catalogue?offers=true",
    featured: true,
  },
];

// ============================================================================
// WebGL Shader for Apple Liquid Glass Refraction & Ripples
// ============================================================================

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_hover;
  uniform vec4 u_ripples[6]; // x, y, startTime, intensity
  uniform int u_ripple_count;

  void main() {
    vec2 uv = v_uv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    // 1. Calculate Water Ripple Surface Normal
    float dHdx = 0.0;
    float dHdy = 0.0;
    float waveSum = 0.0;

    for (int i = 0; i < 6; i++) {
      if (i >= u_ripple_count) break;
      vec2 rOrigin = (u_ripples[i].xy - 0.5) * aspect;
      float rTime = u_time - u_ripples[i].z;
      float intensity = u_ripples[i].w;

      if (rTime > 0.0 && rTime < 1.6) {
        float dist = length(p - rOrigin);
        float waveSpeed = 0.65;
        float waveRadius = rTime * waveSpeed;
        float d = dist - waveRadius;

        float envelope = exp(-dist * 3.5) * exp(-rTime * 2.5);
        float ripple = sin(d * 48.0) * envelope * intensity * 0.035;
        waveSum += ripple;

        float grad = cos(d * 48.0) * 48.0 * envelope * intensity * 0.035;
        vec2 dir = (dist > 0.001) ? normalize(p - rOrigin) : vec2(0.0);
        dHdx += dir.x * grad;
        dHdy += dir.y * grad;
      }
    }

    // 2. Mouse Capillary Hover
    vec2 mouseP = (u_mouse - 0.5) * aspect;
    float mouseDist = length(p - mouseP);
    if (u_hover > 0.01 && mouseDist < 0.22) {
      float meniscus = exp(-pow(mouseDist / 0.14, 2.0)) * 0.018 * u_hover;
      vec2 mDir = (mouseDist > 0.001) ? normalize(p - mouseP) : vec2(0.0);
      dHdx += mDir.x * meniscus * -6.0;
      dHdy += mDir.y * meniscus * -6.0;
    }

    // 3. Normal Vector & Fresnel Specular Glints
    vec3 normal = normalize(vec3(-dHdx, -dHdy, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 lightDir = normalize(vec3(0.25, 0.65, 0.85));
    vec3 halfVec = normalize(lightDir + viewDir);

    float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);

    // Subtle transparent ruby blush caustic dispersion matching Bagodi text
    vec3 bagodiRed = vec3(0.89, 0.11, 0.14);
    vec3 rubyGlint = bagodiRed * (spec * 0.28);
    vec3 whiteHighlight = vec3(1.0, 1.0, 1.0) * (spec * 0.55 + fresnel * 0.25);

    vec3 finalLight = whiteHighlight + rubyGlint;
    float alpha = clamp(spec * 0.65 + fresnel * 0.28 + abs(waveSum) * 6.0, 0.0, 0.55);

    gl_FragColor = vec4(finalLight, alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// ============================================================================
// Droplet and Ripple State Interfaces
// ============================================================================

interface SatelliteState {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vx: number;
}

interface RippleState {
  id: number;
  x: number;
  y: number;
  startTime: number;
  intensity: number;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Main LiquidGlassNavbar Component
// ============================================================================

export const LiquidGlassNavbar: FC<{
  items?: NavItemConfig[];
  onItemSelect?: (item: NavItemConfig) => void;
}> = ({ items = NAV_ITEMS, onItemSelect }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Active Item Identification
  const activeItemId = useMemo(() => {
    const currentPath = location.pathname + location.search;
    const match = items.find((item) => {
      if (item.href === currentPath) return true;
      if (item.href.includes("?category=") && location.search.includes(item.id)) return true;
      if (item.id === "offers" && location.search.includes("offers=true")) return true;
      return false;
    });
    return match ? match.id : items[0]?.id || "sarees";
  }, [location.pathname, location.search, items]);

  // Target Bounding Box
  const targetRectRef = useRef<TargetRect>({ x: 10, y: 5, width: 90, height: 32 });
  const [activePillState, setActivePillState] = useState<TargetRect>({
    x: 10,
    y: 5,
    width: 90,
    height: 32,
  });

  // Physics State for the Real Water Drop
  const dropPosRef = useRef<{ x: number; y: number }>({ x: 50, y: 21 });
  const dropVelRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const [renderDrop, setRenderDrop] = useState<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
  }>({
    x: 50,
    y: 21,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 0,
  });

  // Gooey Satellite Droplets (separated during rapid stretching)
  const satellitesRef = useRef<SatelliteState[]>([]);
  const [renderSatellites, setRenderSatellites] = useState<SatelliteState[]>([]);

  // Concentric Ripple Waves
  const ripplesRef = useRef<RippleState[]>([]);
  const [renderRipples, setRenderRipples] = useState<RippleState[]>([]);

  // Hover Meniscus Dynamic Curvature
  const [meniscusCurve, setMeniscusCurve] = useState<string>("M 0,8 L 1000,8");
  const mouseHoverRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: 0,
    y: 0,
    isHovering: false,
  });

  // Measure and align target from active/hovered tab element
  const updateTargetFromItem = useCallback((itemId: string) => {
    const el = itemRefs.current.get(itemId);
    const pill = pillRef.current;
    if (el && pill) {
      const elRect = el.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      const x = elRect.left - pillRect.left;
      const y = elRect.top - pillRect.top;
      const width = elRect.width;
      const height = elRect.height;

      targetRectRef.current = { x, y, width, height };
      setActivePillState({ x, y, width, height });
    }
  }, []);

  // Sync on active item change or resize
  useEffect(() => {
    updateTargetFromItem(activeItemId);
    const handleResize = () => updateTargetFromItem(activeItemId);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeItemId, updateTargetFromItem]);

  // Initial target lock
  useEffect(() => {
    const timer = setTimeout(() => {
      updateTargetFromItem(activeItemId);
      const target = targetRectRef.current;
      dropPosRef.current = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
      setRenderDrop((prev) => ({
        ...prev,
        x: target.x + target.width / 2,
        y: target.y + target.height / 2,
        opacity: 1,
      }));
    }, 50);
    return () => clearTimeout(timer);
  }, [activeItemId, updateTargetFromItem]);

  // Trigger ripple shockwave
  const triggerRippleAt = useCallback((x: number, y: number, intensity = 1.0) => {
    const newRipple: RippleState = {
      id: Date.now() + Math.random(),
      x,
      y,
      startTime: performance.now() / 1000,
      intensity,
    };
    ripplesRef.current = [...ripplesRef.current.slice(-5), newRipple];
    setRenderRipples([...ripplesRef.current]);

    setTimeout(() => {
      ripplesRef.current = ripplesRef.current.filter((r) => r.id !== newRipple.id);
      setRenderRipples([...ripplesRef.current]);
    }, 800);
  }, []);

  // ==========================================================================
  // WebGL Shader Pipeline Initialization
  // ==========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
        }) || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    if (!gl) return;

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uHoverLoc = gl.getUniformLocation(program, "u_hover");
    const uRipplesLoc = gl.getUniformLocation(program, "u_ripples");
    const uRippleCountLoc = gl.getUniformLocation(program, "u_ripple_count");

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      if (!gl || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const currentTime = (performance.now() - startTime) / 1000;

      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, currentTime);

      const mouse = mouseHoverRef.current;
      gl.uniform2f(
        uMouseLoc,
        rect.width > 0 ? mouse.x / rect.width : 0.5,
        rect.height > 0 ? 1.0 - mouse.y / rect.height : 0.5
      );
      gl.uniform1f(uHoverLoc, mouse.isHovering ? 1.0 : 0.0);

      const activeRipples = ripplesRef.current.slice(0, 6);
      const rippleData = new Float32Array(24);
      activeRipples.forEach((r, idx) => {
        rippleData[idx * 4 + 0] = rect.width > 0 ? r.x / rect.width : 0.5;
        rippleData[idx * 4 + 1] = rect.height > 0 ? 1.0 - r.y / rect.height : 0.5;
        rippleData[idx * 4 + 2] = r.startTime;
        rippleData[idx * 4 + 3] = r.intensity;
      });
      gl.uniform4fv(uRipplesLoc, rippleData);
      gl.uniform1i(uRippleCountLoc, activeRipples.length);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  // ==========================================================================
  // Water Droplet Spring Physics & Splitting/Merging Loop
  // ==========================================================================
  useEffect(() => {
    let animId: number;
    let prevVx = 0;

    const physicsLoop = () => {
      const drop = dropPosRef.current;
      const target = targetRectRef.current;
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;
      const vel = dropVelRef.current;

      const dx = targetCenterX - drop.x;
      const dy = targetCenterY - drop.y;

      // Spring constants: responsive, smooth settle
      const k = 0.16;
      const damping = 0.72;

      vel.vx = (vel.vx + dx * k) * damping;
      vel.vy = (vel.vy + dy * k) * damping;

      drop.x += vel.vx;
      drop.y += vel.vy;

      const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);

      // Droplet Elastic Viscous Stretch
      const maxStretch = 1.7;
      const stretchFactor = Math.min(maxStretch, 1 + speed * 0.05);
      const compressFactor = 1 / Math.sqrt(stretchFactor);
      const angleDeg = (Math.atan2(vel.vy, vel.vx) * 180) / Math.PI;

      // Satellite Droplets Split when Moving Fast
      if (speed > 5.0 && Math.abs(dx) > 30) {
        if (satellitesRef.current.length < 2) {
          const satId = Date.now() + Math.random();
          const trailDist = -Math.sign(vel.vx) * (18 + Math.random() * 8);
          satellitesRef.current.push({
            id: satId,
            x: drop.x + trailDist,
            y: drop.y + (Math.random() - 0.5) * 4,
            radius: 4 + Math.random() * 3,
            opacity: 0.85,
            vx: vel.vx * 0.4,
          });
        }
      }

      // Update satellite physics and snap back to merge
      if (satellitesRef.current.length > 0) {
        satellitesRef.current = satellitesRef.current
          .map((sat) => {
            const pullDx = drop.x - sat.x;
            sat.vx = (sat.vx + pullDx * 0.25) * 0.7;
            sat.x += sat.vx;
            if (Math.abs(pullDx) < 10) {
              return null; // Merged back into drop
            }
            return sat;
          })
          .filter(Boolean) as SatelliteState[];
      }

      // Detect Landing / Merging Event (Emits Ripple Wave!)
      if (Math.abs(prevVx) > 2.0 && Math.abs(vel.vx) < 0.6 && Math.abs(dx) < 5) {
        triggerRippleAt(drop.x, drop.y, Math.min(1.4, Math.abs(prevVx) * 0.22));
      }
      prevVx = vel.vx;

      // Commit state
      setRenderDrop({
        x: drop.x,
        y: drop.y,
        scaleX: stretchFactor,
        scaleY: compressFactor,
        rotation: speed > 0.3 ? angleDeg : 0,
        opacity: 1,
      });

      setRenderSatellites([...satellitesRef.current]);

      animId = requestAnimationFrame(physicsLoop);
    };

    animId = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(animId);
  }, [triggerRippleAt]);

  // ==========================================================================
  // Hover Meniscus Surface Tension Calculation
  // ==========================================================================
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const pill = pillRef.current;
    if (!pill) return;
    const rect = pill.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    mouseHoverRef.current = {
      x: mouseX,
      y: mouseY,
      isHovering: true,
    };

    const w = rect.width;
    const h = 8;
    const distFromBottom = Math.max(0, rect.height - mouseY);
    const pullAmount = Math.max(0, Math.min(6, 6 * (1 - distFromBottom / 32)));

    const curve = `M 0,${h} Q ${mouseX},${h - pullAmount} ${w},${h}`;
    setMeniscusCurve(curve);

    const target = (e.target as HTMLElement)?.closest(`.${styles.navLink}`) as HTMLElement | null;
    if (target) {
      const itemRect = target.getBoundingClientRect();
      const relX = ((e.clientX - itemRect.left) / itemRect.width) * 100;
      const relY = ((e.clientY - itemRect.top) / itemRect.height) * 100;
      target.style.setProperty("--mouse-rel-x", `${relX}%`);
      target.style.setProperty("--mouse-rel-y", `${relY}%`);
    }
  };

  const handleMouseEnter = () => {
    mouseHoverRef.current.isHovering = true;
  };

  const handleMouseLeave = () => {
    mouseHoverRef.current.isHovering = false;
    const pill = pillRef.current;
    const w = pill ? pill.getBoundingClientRect().width : 1000;
    setMeniscusCurve(`M 0,8 L ${w},8`);
    updateTargetFromItem(activeItemId);
  };

  const handleItemHover = (itemId: string) => {
    updateTargetFromItem(itemId);
  };

  const handleItemClick = (
    e: ReactMouseEvent<HTMLAnchorElement>,
    item: NavItemConfig
  ) => {
    updateTargetFromItem(item.id);
    const rect = e.currentTarget.getBoundingClientRect();
    const pill = pillRef.current;
    if (pill) {
      const pillRect = pill.getBoundingClientRect();
      const clickX = rect.left - pillRect.left + rect.width / 2;
      const clickY = rect.top - pillRect.top + rect.height / 2;
      triggerRippleAt(clickX, clickY, 1.3);
    }
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <div className={styles.navWrapper} ref={containerRef}>
      {/* SVG Filter for Fluid Gooey Droplet Splitting and Merging */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id="bagodi-water-goo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Apple Liquid Glass Capsule */}
      <div
        className={styles.liquidGlassPill}
        ref={pillRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 1. WebGL Canvas Shader (Chromatic Refraction & Water Ripples) */}
        <canvas ref={canvasRef} className={styles.webglCanvas} />

        {/* 2. Top Specular Bevel Sheen */}
        <div className={styles.glassRefractionSheen} />

        {/* 3. Liquid Layer: Active Glass Pill + Real Water Droplet + Satellites */}
        <div className={styles.liquidLayer}>
          {/* Active Liquid Pill (Under active tab) */}
          <div
            className={styles.liquidActivePill}
            style={{
              left: `${activePillState.x}px`,
              top: `${activePillState.y}px`,
              width: `${activePillState.width}px`,
              height: `${activePillState.height}px`,
              transition: "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s ease",
            }}
          />

          {/* Gooey Droplet Container */}
          <div className={styles.gooeyContainer}>
            {/* Real Water Droplet Bead */}
            <div
              className={styles.crystalWaterDrop}
              style={{
                left: `${renderDrop.x}px`,
                top: `${renderDrop.y}px`,
                width: "14px",
                height: "14px",
                marginLeft: "-7px",
                marginTop: "-7px",
                transform: `rotate(${renderDrop.rotation}deg) scale(${renderDrop.scaleX}, ${renderDrop.scaleY})`,
                opacity: renderDrop.opacity,
              }}
            >
              <div className={styles.dropGlint} />
              <div className={styles.dropCaustic} />
            </div>

            {/* Gooey Satellites (Emerge during Fast Stretch) */}
            {renderSatellites.map((sat) => (
              <div
                key={sat.id}
                className={styles.satelliteDrop}
                style={{
                  left: `${sat.x}px`,
                  top: `${sat.y}px`,
                  width: `${sat.radius * 2}px`,
                  height: `${sat.radius * 2}px`,
                  marginLeft: `-${sat.radius}px`,
                  marginTop: `-${sat.radius}px`,
                  opacity: sat.opacity,
                }}
              />
            ))}
          </div>
        </div>

        {/* 4. Ripple Shockwave Rings on Drop Landing */}
        {renderRipples.map((ripple) => (
          <div
            key={ripple.id}
            className={styles.rippleWave}
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: `${48 * ripple.intensity}px`,
              height: `${48 * ripple.intensity}px`,
            }}
          />
        ))}

        {/* 5. Hover Meniscus (Liquid Surface Tension along the Glass Rim) */}
        <svg className={styles.meniscusSvg}>
          <path d={meniscusCurve} className={styles.meniscusPath} />
        </svg>

        {/* 6. Navigation Tabs & Animated Icons (Elevated cleanly above the liquid layer) */}
        <ul className={styles.navList}>
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <li key={item.id} className={styles.navItem}>
                <Link
                  to={item.href}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                    else itemRefs.current.delete(item.id);
                  }}
                  onMouseEnter={() => handleItemHover(item.id)}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${
                    item.featured ? styles.navLinkFeatured : ""
                  }`}
                >
                  <div className={styles.buttonMeniscus} />

                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
