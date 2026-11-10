import React, { ReactNode } from "react";
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
  Barcode,
  LogOut,
  Store,
  CreditCard,
  Tag,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@bagodi/authentication";
import { Button, NetworkStatusBar } from "@bagodi/shared-components";

export interface AdminLayoutProps {
  children: ReactNode;
  onOpenBarcodeModal?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onOpenBarcodeModal }) => {
  const location = useLocation();
  const { user, activeStore, logout, hasPermission, hasRole } = useAuth();

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
    <div className={styles.adminShell}>
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

        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ marginBottom: "var(--space-3)", padding: "0 var(--space-2)" }}>
            <p style={{ fontSize: "var(--text-xs)", fontWeight: "bold", color: "var(--text-primary)" }}>
              {user?.fullName || "Staff Member"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" fullWidth leftIcon={<LogOut size={16} />} onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              Role: <strong style={{ color: "var(--text-primary)" }}>{user?.role?.replace("_", " ") || "Store Operations"}</strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {onOpenBarcodeModal && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Barcode size={16} />}
                onClick={onOpenBarcodeModal}
              >
                Scan Barcode
              </Button>
            )}
          </div>
        </header>

        <main className={styles.contentWrapper}>{children}</main>
      </div>

      {/* Network Resilience Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};
