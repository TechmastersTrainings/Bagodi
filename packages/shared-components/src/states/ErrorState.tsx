import React, { ReactNode } from "react";
import styles from "./States.module.css";
import { AlertTriangle, WifiOff, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "../button/Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  actionText?: string;
  icon?: ReactNode;
  className?: string;
}

export const ApiErrorCard: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message,
  onRetry,
  actionText = "Try Again",
  icon = <AlertTriangle size={32} />,
  className = "",
}) => {
  return (
    <div className={`${styles.stateContainer} ${className}`}>
      <div className={`${styles.iconWrapper} ${styles.iconError}`}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const NetworkUnavailableState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ApiErrorCard
    title="No Internet Connection"
    message="You appear to be offline. Please check your network connectivity and try again."
    icon={<WifiOff size={32} />}
    onRetry={onRetry}
  />
);

export const PermissionDeniedState: React.FC = () => (
  <div className={styles.stateContainer}>
    <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
      <ShieldAlert size={32} />
    </div>
    <h3 className={styles.title}>Access Denied</h3>
    <p className={styles.description}>
      Your user role does not have authorization to access this operational module. Please contact your store administrator.
    </p>
  </div>
);

export const UnauthorizedState: React.FC<{ onLoginClick?: () => void }> = ({ onLoginClick }) => (
  <div className={styles.stateContainer}>
    <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
      <KeyRound size={32} />
    </div>
    <h3 className={styles.title}>Session Expired</h3>
    <p className={styles.description}>Your session has expired. Please sign in again to continue.</p>
    {onLoginClick && (
      <Button variant="primary" size="sm" onClick={onLoginClick}>
        Sign In
      </Button>
    )}
  </div>
);

