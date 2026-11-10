import React from "react";
import styles from "./States.module.css";
import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{ size?: number; label?: string }> = ({ size = 28, label }) => (
  <div className={styles.stateContainer} style={{ border: "none", background: "transparent" }}>
    <Loader2 className="animate-spin" size={size} style={{ color: "var(--accent-primary)", marginBottom: label ? 8 : 0 }} />
    {label && <p className={styles.description}>{label}</p>}
  </div>
);

export const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({
  width = "100%",
  height = "16px",
}) => <div className={styles.skeleton} style={{ width, height, marginBottom: 8 }} />;

export const SkeletonCard: React.FC<{ height?: string }> = ({ height = "220px" }) => (
  <div className={`${styles.skeleton} ${styles.skeletonCard}`} style={{ height }} />
);

