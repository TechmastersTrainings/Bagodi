import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./SuperAdminLayout.module.css";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Server,
  LogOut,
  ExternalLink,
  Activity,
  Cpu,
  Shirt,
  ShoppingBag,
  RotateCcw,
  Truck,
  Tag,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@bagodi/authentication";

export interface SuperAdminLayoutProps {
  children: ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems: {
    label: string;
    path: string;
    icon: ReactNode;
    badge?: string | number;
  }[] = [
    {
      label: "Platform Cockpit",
      path: "/dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    {
      label: "User Management",
      path: "/platform-users",
      icon: <Users size={15} />,
    },
    {
      label: "Product Management",
      path: "/products",
      icon: <Shirt size={15} />,
    },
    {
      label: "Order Management",
      path: "/orders",
      icon: <ShoppingBag size={15} />,
    },
    {
      label: "Return / Exchange",
      path: "/returns",
      icon: <RotateCcw size={15} />,
    },
    {
      label: "Delivery Management",
      path: "/delivery",
      icon: <Truck size={15} />,
    },
    {
      label: "Discount & Coupons",
      path: "/coupons",
      icon: <Tag size={15} />,
    },
    {
      label: "Payment Management",
      path: "/payments",
      icon: <CreditCard size={15} />,
    },
    {
      label: "Commercial Tenants",
      path: "/merchants",
      icon: <Building2 size={15} />,
    },
    {
      label: "Security & Audit",
      path: "/audit-logs",
      icon: <ShieldCheck size={15} />,
    },
    {
      label: "System Settings",
      path: "/settings",
      icon: <Server size={15} />,
    },
  ];

  return (
    <div className={styles.superShell}>
      {/* 1. Top Operations Notification & Utility Strip */}
      <div className={styles.announcementStrip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.pulseDot} />
            <span className={styles.stripText}>
              <strong>TECHMASTERS CLOUD GOVERNANCE</strong> • Multi-Tenant Platform Cluster
            </span>
            <span className={styles.stripDivider}>|</span>
            <span className={styles.stripSubtext}>Node: India-Central (Bidar Primary)</span>
          </div>

          <div className={styles.stripRight}>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className={styles.stripLink}
              title="Open Live Customer Web Storefront"
            >
              <span>View Storefront</span>
              <ExternalLink size={12} />
            </a>
            <span className={styles.stripDivider}>|</span>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className={styles.stripLink}
              title="Open Merchant Operations Portal"
            >
              <span>Merchant Terminal</span>
              <ExternalLink size={12} />
            </a>
            <span className={styles.stripDivider}>|</span>
            <div className={styles.securityBadge}>
              <Cpu size={13} color="#C5A15B" />
              <span>Master Root Key</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Executive Header */}
      <header className={styles.mainHeader}>
        <div className={styles.headerInner}>
          {/* Left: Brand Identity matching Customer Web & Merchant Admin */}
          <div className={styles.brandContainer}>
            <Link to="/dashboard" className={styles.brandLink}>
              <div className={styles.brandWordmarkCol}>
                <span className={styles.brandWordmarkAnimated}>BAGODI</span>
                <span className={styles.brandSubtitle}>SUPER ADMIN • PLATFORM GOVERNANCE</span>
              </div>
            </Link>

            <div className={styles.nodeBadge}>
              <Server size={13} className={styles.nodeIcon} />
              <span>TechMasters Master Cluster</span>
            </div>
          </div>

          {/* Right: Telemetry, Master Admin Profile, Sign Out */}
          <div className={styles.headerRightActions}>
            <div className={styles.uptimeBadge}>
              <Activity size={14} />
              <span>99.98% Uptime</span>
            </div>

            <div className={styles.staffProfileCard}>
              <div className={styles.avatarCircle}>
                {user?.fullName?.charAt(0) || "T"}
              </div>
              <div className={styles.staffInfoCol}>
                <span className={styles.staffName}>{user?.fullName || "TechMasters Root Admin"}</span>
                <span className={styles.staffRole}>SUPER ADMIN</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.signOutBtn}
              onClick={() => logout()}
              title="Sign Out of Platform Governance Portal"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Horizontal Operations Ribbon */}
      <nav className={styles.operationsRibbon}>
        <div className={styles.ribbonScrollContainer}>
          {navItems.map((item) => {
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.ribbonButton} ${isActive ? styles.ribbonButtonActive : ""}`}
              >
                <span className={styles.buttonIconWrap}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`${styles.ribbonBadge} ${isActive ? styles.ribbonBadgeActive : ""}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 4. Main Content Canvas */}
      <main className={styles.contentShell}>
        {children}
      </main>
    </div>
  );
};
