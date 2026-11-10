import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  RotateCcw,
  Truck,
  Users,
  Settings,
  LogOut,
  Store,
  CreditCard,
  Tag,
  BarChart3,
  Sun,
  Moon,
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

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bagodi_admin_theme");
      if (saved === "dark") return "dark";
    }
    // Default to bright mode as requested by user
    return "light";
  });

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("bagodi_admin_theme", next);
  };

  // Definition of navigation items with required backend permissions
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      visible: true,
    },
    {
      label: "Products & Catalogue",
      path: "/products",
      icon: <Shirt size={18} />,
      visible: hasPermission("products:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER"]),
    },
    {
      label: "Inventory & Barcodes",
      path: "/inventory",
      icon: <Boxes size={18} />,
      visible: hasPermission("inventory:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER", "INVENTORY_STAFF"]),
    },
    {
      label: "Orders",
      path: "/orders",
      icon: <ShoppingBag size={18} />,
      visible: hasPermission("orders:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER"]),
    },
    {
      label: "Returns & Exchanges",
      path: "/returns",
      icon: <RotateCcw size={18} />,
      visible: hasPermission("returns:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER"]),
    },
    {
      label: "Payments & Ledger",
      path: "/payments",
      icon: <CreditCard size={18} />,
      visible: hasPermission("orders:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER", "SUPER_ADMIN"]),
    },
    {
      label: "Delivery Logistics",
      path: "/delivery",
      icon: <Truck size={18} />,
      visible: hasPermission("delivery:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER", "DELIVERY_STAFF"]),
    },
    {
      label: "Coupons & Discounts",
      path: "/coupons",
      icon: <Tag size={18} />,
      visible: hasPermission("orders:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER"]),
    },
    {
      label: "Operations Reports",
      path: "/reports",
      icon: <BarChart3 size={18} />,
      visible: hasPermission("reports:read") || hasRole(["MERCHANT_ADMIN", "STORE_MANAGER", "SUPER_ADMIN"]),
    },
    {
      label: "Customers & Staff",
      path: "/users",
      icon: <Users size={18} />,
      visible: hasPermission("staff:read") || hasRole(["MERCHANT_ADMIN", "SUPER_ADMIN"]),
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings size={18} />,
      visible: hasPermission("settings:read") || hasRole(["MERCHANT_ADMIN"]),
    },
  ];

  return (
    <div className={`${styles.adminShell} ${theme === "light" ? styles.brightTheme : styles.darkTheme}`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.brandTitle}>BAGODI ADMIN</span>
          <span className={styles.storePill}>
            <Store size={14} /> {activeStore?.name || "Bidar Flagship (Store 01)"}
          </span>
        </div>

        <nav className={styles.navSection}>
          {navItems
            .filter((item) => item.visible)
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${location.pathname.startsWith(item.path) ? styles.navItemActive : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userBlock}>
            <p className={styles.userName}>
              {user?.fullName || "Staff Member"}
            </p>
            <p className={styles.userRole}>{user?.role?.replace("_", " ") || "Store Operations"}</p>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={() => logout()}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className={styles.mainWorkspace}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.liveIndicatorDot} />
            <span className={styles.topBarRole}>
              Role: <strong>{user?.role?.replace("_", " ") || "Store Operations"}</strong>
            </span>
            <span className={styles.topBarDivider}>•</span>
            <span className={styles.topBarStore}>{activeStore?.name || "Bidar Flagship (Store 01)"}</span>
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to Dark Theme" : "Switch to Bright Mode"}
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === "light" ? "Dark Mode" : "Bright Mode"}</span>
            </button>

            {onOpenBarcodeModal && (
              <button
                type="button"
                className={styles.barcodeScanBtn}
                onClick={onOpenBarcodeModal}
              >
                Scan Barcode (⌘B)
              </button>
            )}

            <div className={styles.userProfilePill}>
              <div className={styles.userAvatar}>
                {user?.fullName?.charAt(0) || "S"}
              </div>
              <div className={styles.userMeta}>
                <span className={styles.userNameShort}>{user?.fullName || "Staff Member"}</span>
                <span className={styles.userRoleBadge}>{user?.role?.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.contentBody}>{children}</main>
      </div>

      {/* Network Resilience Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};
