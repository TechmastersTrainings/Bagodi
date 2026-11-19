import React, { useState, useEffect } from "react";
import styles from "./NetworkStatusBar.module.css";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export interface NetworkStatusBarProps {
  onReconnect?: () => void;
}

export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ onReconnect }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      if (onReconnect) onReconnect();
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onReconnect]);

  if (isOnline && !showReconnectedBanner) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className={`${styles.networkBar} ${styles.offline}`} role="alert" aria-live="assertive">
        <WifiOff size={16} />
        <span>Working Offline: Cached store state active. Online payment and live sync are paused.</span>
        <button
          className={styles.retryBtn}
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.onLine) {
              setIsOnline(true);
              if (onReconnect) onReconnect();
            }
          }}
        >
          <RefreshCw size={12} style={{ display: "inline", marginRight: 4 }} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.networkBar} ${styles.online}`} role="status" aria-live="polite">
      <Wifi size={16} />
      <span>Network Reconnected: Synchronized with Bagodi Cloud Platform.</span>
    </div>
  );
};

