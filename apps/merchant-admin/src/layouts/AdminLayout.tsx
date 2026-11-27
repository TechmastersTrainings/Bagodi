import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Tag,
  LogOut,
  Store,
  Barcode,
  ExternalLink,
  ShieldCheck,
  Users,
  Truck,
} from "lucide-react";
import { useAuth } from "@bagodi/authentication";
import { NetworkStatusBar } from "@bagodi/shared-components";

export interface AdminLayoutProps {
  children: ReactNode;
  onOpenBarcodeModal?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onOpenBarcodeModal }) => {
  const location = useLocation();
  const { user, activeStore, logout, hasPermission, hasRole } = useAuth();

  // Navigation module buttons
  const navItems: {
    label: string;
    path: string;
    icon: ReactNode;
    visible: boolean;
    badge?: string | number;
  }[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={15} />,
      visible: true,
    },
    {
      label: "User Management",
      path: "/users",
      icon: <Users size={15} />,
      visible: true,
    },
    {
      label: "Product Management",
      path: "/products",
      icon: <Shirt size={15} />,
      visible: true,
    },
    {
      label: "Inventory & Barcodes",
      path: "/inventory",
      icon: <Boxes size={15} />,
      visible: true,
    },
    {
      label: "Order Management",
      path: "/orders",
      icon: <ShoppingBag size={15} />,
      visible: true,
    },
    {
      label: "Return / Exchange",
      path: "/returns",
      icon: <RotateCcw size={15} />,
      visible: true,
    },
    {
      label: "Delivery Management",
      path: "/delivery",
      icon: <Truck size={15} />,
      visible: true,
    },
    {
      label: "Payment Management",
      path: "/payments",
      icon: <CreditCard size={15} />,
      visible: true,
    },
    {
      label: "Discount & Coupons",
      path: "/coupons",
      icon: <Tag size={15} />,
      visible: true,
    },
  ];

  return (
    <div className={styles.adminShell}>
      {/* 1. Top Operations Notification & Utility Strip */}
      <div className={styles.announcementStrip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.pulseDot} />
            <span className={styles.stripText}>
              <strong>BAGODI RETAIL COMMAND</strong> • Flagship Terminal 01 (Bidar Mall)
            </span>
            <span className={styles.stripDivider}>|</span>
            <span className={styles.stripSubtext}>Real-time Local Mutex Active</span>
          </div>

          <div className={styles.stripRight}>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className={styles.stripLink}
              title="Open Live Customer Web Storefront in a new tab"
            >
              <span>View Customer Storefront</span>
              <ExternalLink size={12} />
            </a>
            <span className={styles.stripDivider}>|</span>
            <div className={styles.securityBadge}>
              <ShieldCheck size={13} color="#C5A15B" />
              <span>Enterprise Guard</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Executive Header */}
      <header className={styles.mainHeader}>
        <div className={styles.headerInner}>
          {/* Left: Brand Identity matching Customer Web Storefront */}
          <div className={styles.brandContainer}>
            <Link to="/dashboard" className={styles.brandLink}>
              <div className={styles.brandWordmarkCol}>
                <span className={styles.brandWordmarkAnimated}>BAGODI</span>
                <span className={styles.brandSubtitle}>MERCHANT OPERATIONS • BIDAR MALL</span>
              </div>
            </Link>

            <div className={styles.storeLocationBadge}>
              <Store size={13} className={styles.storeIcon} />
              <span>{activeStore?.name || "Bidar Flagship (Store 01)"}</span>
            </div>
          </div>

          {/* Right: User Profile, Scan Shortcut, Sign Out */}
          <div className={styles.headerRightActions}>
            {onOpenBarcodeModal && (
              <button
                type="button"
                className={styles.barcodeScanBtn}
                onClick={onOpenBarcodeModal}
                title="Scan Item Barcode (Shortcut: ⌘B)"
              >
                <Barcode size={16} />
                <span>Quick Scan (⌘B)</span>
              </button>
            )}

            <div className={styles.staffProfileCard}>
              <div className={styles.avatarCircle}>
                {user?.fullName?.charAt(0) || "R"}
              </div>
              <div className={styles.staffInfoCol}>
                <span className={styles.staffName}>{user?.fullName || "Rajesh Sharma"}</span>
                <span className={styles.staffRole}>{user?.role?.replace("_", " ") || "STORE MANAGER"}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.signOutBtn}
              onClick={() => logout()}
              title="Sign Out of Operations Terminal"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Horizontal Operations Action Ribbon (Replaces the Sidebar) */}
      <nav className={styles.operationsRibbon}>
        <div className={styles.ribbonScrollContainer}>
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
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
                  <span className={styles.buttonLabel}>{item.label}</span>
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

      {/* 4. Full-Width Main Workspace Body */}
      <main className={styles.mainCanvas}>
        <div className={styles.canvasContainer}>{children}</div>
      </main>

      {/* Network Connectivity Status Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};
