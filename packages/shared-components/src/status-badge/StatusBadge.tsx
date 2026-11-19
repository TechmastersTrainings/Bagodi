import React, { ReactNode } from "react";
import styles from "./StatusBadge.module.css";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  icon?: ReactNode;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = "neutral",
  label,
  icon,
  showDot = true,
  className = "",
}) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {showDot && <span className={styles.dot} />}
      {icon}
      <span>{label}</span>
    </span>
  );
};

