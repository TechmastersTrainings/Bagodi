import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Package, RotateCcw, Heart } from "lucide-react";
import styles from "./AccountNavTabs.module.css";

export const AccountNavTabs: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    {
      id: "profile",
      path: "/account/profile",
      label: "My Account",
      icon: <User size={16} />,
      isActive: currentPath === "/account/profile",
    },
    {
      id: "orders",
      path: "/account/orders",
      label: "My Orders",
      icon: <Package size={16} />,
      isActive: currentPath === "/account/orders",
    },
    {
      id: "wishlist",
      path: "/account/wishlist",
      label: "Wishlist",
      icon: <Heart size={16} />,
      isActive: currentPath === "/account/wishlist",
    },
    {
      id: "returns",
      path: "/account/returns",
      label: "Return & Replace",
      icon: <RotateCcw size={16} />,
      isActive: currentPath === "/account/returns",
    },
  ];

  return (
    <nav className={styles.tabsNav} aria-label="Customer Account Navigation">
      <div className={styles.tabsTrack}>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`${styles.tabLink} ${tab.isActive ? styles.tabLinkActive : ""}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

