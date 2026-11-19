import React, { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./CustomerLayout.module.css";
import { ShoppingBag, Heart, User, Search, MapPin, Home, Grid, Menu, X } from "lucide-react";
import { useAuth } from "@bagodi/authentication";
import { NetworkStatusBar } from "@bagodi/shared-components";
import {
  configureNativeStatusBar,
  setupHardwareBackButton,
  setupDeepLinkListener,
  triggerHaptic,
} from "@bagodi/utilities";
import { LiquidGlassNavbar } from "../components/navigation/LiquidGlassNavbar";

export interface CustomerLayoutProps {
  children: ReactNode;
  cartCount?: number;
  wishlistCount?: number;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  cartCount = 0,
  wishlistCount = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Native Android Shell & Hardware Lifecycle
  useEffect(() => {
    configureNativeStatusBar("dark");

    const cleanupBackBtn = setupHardwareBackButton(
      (delta) => navigate(delta as any),
      () => location.pathname !== "/"
    );

    const cleanupDeepLinks = setupDeepLinkListener((path) => {
      navigate(path);
    });

    return () => {
      cleanupBackBtn();
      cleanupDeepLinks();
    };
  }, [navigate, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Main Luxury Header (Snitch-Style Clean Architecture) */}
      <header className={styles.header}>
        <div className={styles.headerMainRow}>
          {/* Left: Minimalist Hamburger Menu */}
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuIconBtn}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={22} strokeWidth={1.8} />
            </button>
          </div>

          {/* Center: Animated Red Brand Wordmark */}
          <div className={styles.headerCenter}>
            <Link to="/" className={styles.logoContainer} aria-label="Bagodi Shopping Mall Home">
              <div className={styles.brandTextCol}>
                <span className={styles.brandWordmarkAnimated}>BAGODI</span>
                <span className={styles.brandSubtitleRed}>SHOPPING MALL • BIDAR</span>
              </div>
            </Link>
          </div>

          {/* Right: Minimalist Action Icons (Search, Bag, Wishlist, Account) */}
          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.headerActionLink}
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                if (!isSearchOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 80);
                }
              }}
              aria-label="Search Products"
              title="Search"
            >
              <Search size={21} strokeWidth={1.75} />
            </button>

            <Link to="/cart" className={styles.headerActionLink} aria-label="Shopping Bag" title="Shopping Bag">
              <ShoppingBag size={21} strokeWidth={1.75} />
              {cartCount > 0 && <span className={styles.actionBadge}>{cartCount}</span>}
            </Link>

            <Link to="/account/wishlist" className={styles.headerActionLink} aria-label="Wishlist" title="Wishlist">
              <Heart size={21} strokeWidth={1.75} />
              {wishlistCount > 0 && <span className={styles.actionBadge}>{wishlistCount}</span>}
            </Link>

            <Link
              to={user ? "/account/profile" : "/login"}
              className={styles.headerActionLink}
              aria-label="Customer Account"
              title={user ? "My Account" : "Sign In"}
            >
              <User size={21} strokeWidth={1.75} />
            </Link>
          </div>
        </div>

        {/* Expandable Luxury Search Bar */}
        {isSearchOpen && (
          <div className={styles.searchBarDropdown}>
            <form onSubmit={handleSearchSubmit} className={styles.searchDropdownForm}>
              <Search size={18} className={styles.searchDropdownIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pure silk sarees, Raymond suiting, bridal lehengas, festive ethnic wear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchDropdownInput}
              />
              <button
                type="button"
                className={styles.searchCloseBtn}
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close Search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}

        {/* 3. Liquid Glass Category Navigation Bar with Water Drop */}
        <div className={styles.navBar}>
          <LiquidGlassNavbar onItemSelect={() => triggerHaptic("selection")} />
        </div>
      </header>

      {/* Slide-Out Navigation Drawer */}
      {isMenuOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerLogoWrap}>
                <img src="/bagodi-logo.jpg" alt="Bagodi Shopping Mall" className={styles.drawerLogoImg} />
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className={styles.drawerNav}>
              <div className={styles.drawerSectionTitle}>Store Departments</div>
              <ul className={styles.drawerLinksList}>
                <li>
                  <Link to="/catalogue?category=sarees" onClick={() => setIsMenuOpen(false)}>
                    Pure Silk Sarees & Kanjivaram
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=women-ethnic" onClick={() => setIsMenuOpen(false)}>
                    Women's Ethnic & Designer Lehengas
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=men-suiting" onClick={() => setIsMenuOpen(false)}>
                    Men's Fashion & Raymond Suiting
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=wedding" onClick={() => setIsMenuOpen(false)}>
                    Wedding & Bridal Heritage
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=fabrics" onClick={() => setIsMenuOpen(false)}>
                    Unstitched Luxury Fabrics
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=kids" onClick={() => setIsMenuOpen(false)}>
                    Kids' Traditional & Festive Wear
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?offers=true" onClick={() => setIsMenuOpen(false)} className={styles.drawerFeaturedLink}>
                    Festive Offers & Exclusive Deals
                  </Link>
                </li>
              </ul>

              <div className={styles.drawerDivider} />

              <div className={styles.drawerSectionTitle}>Flagship Shopping Mall</div>
              <div className={styles.drawerStoreCard}>
                <div className={styles.drawerStoreTitle}>Bagodi Shopping Mall</div>
                <div className={styles.drawerStoreText}>
                  Near Shivaji Chowk, Main Commercial Road,<br />
                  Bidar, Karnataka - 585401
                </div>
                <div className={styles.drawerStoreHours}>
                  Open All 7 Days: 10:00 AM – 9:30 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Page Body */}
      <main className={styles.mainContent}>{children}</main>

      {/* 5. Luxury Multi-Brand Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          {/* Brand & Store Presentation */}
          <div className={styles.footerBrandColumn}>
            <div className={styles.footerLogoContainer}>
              <img
                src="/bagodi-logo.jpg"
                alt="Bagodi Shopping Mall"
                className={styles.footerLogoImg}
              />
            </div>
            <div className={styles.footerTagline}>Family Fashion. One Destination.</div>
            <p className={styles.footerDescription}>
              Bidar’s landmark multi-brand fashion mall, housing luxury apparel, Raymond bespoke suiting, handpicked bridal silks, and festive ethnic couture.
            </p>
            <div className={styles.footerStoreCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-champagne-gold)", fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: 4 }}>
                <MapPin size={14} /> Flagship Shopping Mall
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-muted-grey)", lineHeight: 1.6 }}>
                Near Shivaji Chowk, Main Commercial Road,<br />
                Bidar, Karnataka - 585401
              </div>
            </div>
          </div>

          {/* Curated Categories */}
          <div>
            <h4 className={styles.footerColumnTitle}>Departments</h4>
            <ul className={styles.footerList}>
              <li><Link to="/catalogue?category=sarees" className={styles.footerLink}>Pure Kanjivaram & Banarasi Sarees</Link></li>
              <li><Link to="/catalogue?category=men-suiting" className={styles.footerLink}>Raymond Suiting & Shirting</Link></li>
              <li><Link to="/catalogue?category=wedding" className={styles.footerLink}>Bridal Lehengas & Sherwanis</Link></li>
              <li><Link to="/catalogue?category=fabrics" className={styles.footerLink}>Unstitched Luxury Fabrics</Link></li>
              <li><Link to="/catalogue?category=kids" className={styles.footerLink}>Kids Traditional Festive Wear</Link></li>
            </ul>
          </div>

          {/* Premium Multi-Brand Portfolio */}
          <div>
            <h4 className={styles.footerColumnTitle}>Featured Brands</h4>
            <ul className={styles.footerList}>
              <li><Link to="/catalogue?brand=raymond" className={styles.footerLink}>Raymond</Link></li>
              <li><Link to="/catalogue?brand=park-avenue" className={styles.footerLink}>Park Avenue</Link></li>
              <li><Link to="/catalogue?brand=parx" className={styles.footerLink}>Parx</Link></li>
              <li><Link to="/catalogue?brand=colorplus" className={styles.footerLink}>ColorPlus</Link></li>
              <li><Link to="/catalogue?brand=bagodi-couture" className={styles.footerLink}>Bagodi Heritage Silks</Link></li>
            </ul>
            <div className={styles.brandPills}>
              <span className={styles.brandPill}>Raymond Authorised</span>
              <span className={styles.brandPill}>Silk Mark Certified</span>
            </div>
          </div>

          {/* Store Care & Policies */}
          <div>
            <h4 className={styles.footerColumnTitle}>Customer Services</h4>
            <ul className={styles.footerList}>
              <li><Link to="/account/orders" className={styles.footerLink}>Track Store Delivery</Link></li>
              <li><Link to="/account/returns" className={styles.footerLink}>Returns & Exchanges Policy</Link></li>
              <li><Link to="/policies/shipping" className={styles.footerLink}>Pan-India Insured Shipping</Link></li>
              <li><Link to="/contact" className={styles.footerLink}>Boutique Concierge & Alterations</Link></li>
              <li><Link to="/policies/terms" className={styles.footerLink}>Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} Bagodi Shopping Mall. All rights reserved. Developed by <strong>TechMasters Innovations Private Limited</strong>.
          </div>
          <div>
            Bidar Flagship • Store 01 • GST Compliant Retail Platform
          </div>
        </div>
      </footer>

      {/* 6. Mobile Bottom Navigation Bar (Capacitor & Android Mobile) */}
      <nav className={styles.mobileBottomNav}>
        <Link
          to="/"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname === "/" ? styles.mobileNavItemActive : ""}`}
        >
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link
          to="/catalogue"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname.startsWith("/catalogue") ? styles.mobileNavItemActive : ""}`}
        >
          <Grid size={18} />
          <span>Catalogue</span>
        </Link>
        <Link
          to="/account/wishlist"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname.includes("wishlist") ? styles.mobileNavItemActive : ""}`}
        >
          <Heart size={18} />
          <span>Wishlist</span>
        </Link>
        <Link
          to="/cart"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname === "/cart" ? styles.mobileNavItemActive : ""}`}
        >
          <ShoppingBag size={18} />
          <span>Bag {cartCount > 0 ? `(${cartCount})` : ""}</span>
        </Link>
        <Link
          to={user ? "/account/profile" : "/login"}
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname.includes("account") || location.pathname === "/login" ? styles.mobileNavItemActive : ""}`}
        >
          <User size={18} />
          <span>Account</span>
        </Link>
      </nav>

      {/* Offline & Network Resilience Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};
