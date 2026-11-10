import React, { useRef, useState, MouseEvent, ReactNode } from "react";
import styles from "./PerspectiveCard3D.module.css";

export interface PerspectiveCard3DProps {
  children: ReactNode;
  maxTiltDeg?: number;
  className?: string;
  onClick?: () => void;
}

export const PerspectiveCard3D: React.FC<PerspectiveCard3DProps> = ({
  children,
  maxTiltDeg = 8,
  className = "",
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("");
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ "--glare-opacity": 0 } as React.CSSProperties);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTiltDeg;
    const rotateY = ((x - centerX) / centerX) * maxTiltDeg;

    setTransformStyle(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`);
    setGlareStyle({
      "--glare-opacity": 1,
      "--glare-x": `${x}px`,
      "--glare-y": `${y}px`,
    } as React.CSSProperties);
  };

  const handleMouseLeave = () => {
    setTransformStyle("rotateX(0deg) rotateY(0deg) translateY(0px)");
    setGlareStyle({ "--glare-opacity": 0 } as React.CSSProperties);
  };

  return (
    <div className={styles.perspectiveWrapper}>
      <div
        ref={cardRef}
        className={`${styles.cardRoot} ${className}`}
        style={{ transform: transformStyle }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <div className={styles.glare} style={glareStyle} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

