import React, { ReactNode } from "react";
import styles from "./States.module.css";
import { PackageOpen } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <PackageOpen size={32} />,
  action,
  className = "",
}) => {
  return (
    <div className={`${styles.stateContainer} ${className}`}>
      <div className={styles.iconWrapper}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  );
};

