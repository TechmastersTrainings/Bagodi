import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./SuperAdminLayout.module.css";
import { ShieldCheck, Building2, Users, Activity, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@bagodi/authentication";
import { Button, NetworkStatusBar } from "@bagodi/shared-components";

export const SuperAdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const nav = [
    { label: "Platform Cockpit", path: "/dashboard", icon: <Activity size={18} /> },
    { label: "Merchants & Tenants", path: "/merchants", icon: <Building2 size={18} /> },
    { label: "Platform Users", path: "/platform-users", icon: <Users size={18} /> },
    { label: "Audit Logs", path: "/audit-logs", icon: <FileText size={18} /> },
    { label: "System Config", path: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className={styles.superShell}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ShieldCheck size={18} color="var(--color-champagne-gold)" />
            TECHMASTERS
          </div>
          <div className={styles.subtitle}>E-Commerce Platform Governance</div>
        </div>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${location.pathname.startsWith(item.path) ? styles.navLinkActive : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "var(--space-4)", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Button variant="ghost" size="sm" fullWidth leftIcon={<LogOut size={16} />} onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-champagne-gold)" }}>
              Platform Master Session
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", fontSize: "12px", color: "var(--color-muted-grey)" }}>
            <span>Operator: <strong style={{ color: "#FFFFFF" }}>{user?.fullName || "Super Administrator"}</strong></span>
            <span style={{ background: "rgba(60, 119, 87, 0.15)", border: "1px solid var(--status-success)", color: "var(--status-success)", padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "10px", fontWeight: 700 }}>
              PRODUCTION NODE
            </span>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </main>

      {/* Network Resilience Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};

