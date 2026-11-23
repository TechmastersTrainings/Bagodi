import React, { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./CustomerLayout.module.css";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  RotateCcw,
  Package,
  Truck,
  ShieldCheck,
  Headphones,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Home,
  Grid,
} from "lucide-react";
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
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileAccountDrawerOpen, setIsMobileAccountDrawerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsAccountMenuOpen(false);
    setIsMobileAccountDrawerOpen(false);
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    setIsMobileAccountDrawerOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

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
      {/* ================================================================
          1. TOP ANNOUNCEMENT STRIP (Signature Bagodi Red #A51F27)
          ================================================================ */}
      <div className={styles.announcementStrip}>
        <div className={styles.announcementInner}>
          <div className={styles.announcementItem}>
            <Truck size={13} className={styles.announcementIcon} />
            <span>Free Shipping on Orders Above ₹999</span>
          </div>
          <span className={styles.announcementDivider}>|</span>
          <div className={styles.announcementItem}>
            <RotateCcw size={13} className={styles.announcementIcon} />
            <span>Easy Returns & Replacements</span>
          </div>
          <span className={styles.announcementDivider}>|</span>
          <div className={styles.announcementItem}>
            <ShieldCheck size={13} className={styles.announcementIcon} />
            <span>Secure Payments (UPI / COD)</span>
          </div>
          <span className={styles.announcementDivider}>|</span>
          <div className={styles.announcementItem}>
            <Headphones size={13} className={styles.announcementIcon} />
            <span>24×7 Customer Support</span>
          </div>
        </div>
      </div>

      {/* ================================================================
          2. SIGNATURE BAGODI MAIN HEADER
          ================================================================ */}
      <header className={styles.header}>
        <div className={styles.headerMainRow}>
          {/* Left: Hamburger Menu & Search Input */}
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuIconBtn}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={20} strokeWidth={1.9} />
            </button>

            <button
              type="button"
              className={styles.mobileSearchToggleBtn}
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label="Search"
              title="Search"
            >
              <Search size={19} strokeWidth={1.9} />
            </button>

            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </form>
          </div>

          {/* Center: Bagodi Wordmark & Subtitle */}
          <div className={styles.headerCenter}>
            <Link to="/" className={styles.logoContainer} aria-label="Bagodi Shopping Mall Home">
              <span className={styles.brandWordmark}>BAGODI</span>
              <span className={styles.brandSubtitle}>SHOPPING MALL • BIDAR</span>
            </Link>
          </div>

          {/* Right: Account, Wishlist, Shopping Bag */}
          <div className={styles.headerRight}>
            {user ? (
              <div className={styles.accountMenuWrapper} ref={accountMenuRef}>
                <button
                  type="button"
                  className={`${styles.headerActionBtn} ${isAccountMenuOpen ? styles.headerActionBtnActive : ""}`}
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-label="Customer Account Menu"
                  title="My Account"
                  aria-expanded={isAccountMenuOpen}
                >
                  <User size={20} strokeWidth={1.8} />
                </button>

                {isAccountMenuOpen && (
                  <div className={styles.accountDropdown} role="menu">
                    <div className={styles.accountDropdownHeader}>
                      <div className={styles.accountHeaderGreet}>Signed In As</div>
                      <div className={styles.accountHeaderName}>
                        {user.fullName || (user as any)?.display_name || "Valued Customer"}
                      </div>
                      <div className={styles.accountHeaderContact}>
                        {user.phone || (user as any)?.phone_e164 || user.email || ""}
                      </div>
                    </div>

                    <div className={styles.accountMenuList}>
                      <Link
                        to="/account/profile"
                        className={`${styles.accountMenuItem} ${location.pathname === "/account/profile" ? styles.accountMenuItemActive : ""}`}
                        role="menuitem"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <User size={15} />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/account/orders"
                        className={`${styles.accountMenuItem} ${location.pathname === "/account/orders" ? styles.accountMenuItemActive : ""}`}
                        role="menuitem"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <Package size={15} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/account/returns"
                        className={`${styles.accountMenuItem} ${location.pathname === "/account/returns" ? styles.accountMenuItemActive : ""}`}
                        role="menuitem"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        <RotateCcw size={15} />
                        <span>Return & Replace</span>
                      </Link>

                      <button
                        type="button"
                        className={`${styles.accountMenuItem} ${styles.accountMenuItemLogout}`}
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={styles.headerActionBtn}
                aria-label="Customer Account"
                title="Sign In"
              >
                <User size={20} strokeWidth={1.8} />
              </Link>
            )}

            <Link
              to="/account/wishlist"
              className={styles.headerActionBtn}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={20} strokeWidth={1.8} />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>

            <Link
              to="/cart"
              className={styles.headerActionBtn}
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile Search Expandable Field */}
        {isMobileSearchOpen && (
          <div className={styles.mobileSearchRow}>
            <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products, brands and collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.mobileSearchInput}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.mobileSearchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear Search"
                >
                  <X size={15} />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Category Navigation Pills */}
        <div className={styles.navBarWrapper}>
          <LiquidGlassNavbar onItemSelect={() => triggerHaptic("selection")} />
        </div>
      </header>

      {/* Slide-Out Navigation Drawer */}
      {isMenuOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerLogoWrap}>
                <span className={styles.brandWordmark}>BAGODI</span>
                <span className={styles.brandSubtitle}>SHOPPING MALL • BIDAR</span>
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerNav}>
              <div className={styles.drawerSectionTitle}>Store Departments</div>
              <ul className={styles.drawerLinksList}>
                <li>
                  <Link to="/catalogue?category=mens-wear" onClick={() => setIsMenuOpen(false)}>
                    Men's Wear & Raymond Suiting
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=womens-wear" onClick={() => setIsMenuOpen(false)}>
                    Women's Wear & Designer Pret
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=kids-wear" onClick={() => setIsMenuOpen(false)}>
                    Kid's Wear & Festive Sets
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=sarees" onClick={() => setIsMenuOpen(false)}>
                    Pure Silk Sarees & Kanjivaram
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue?category=blazers" onClick={() => setIsMenuOpen(false)}>
                    Blazers & Bandhgalas
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
                  Meenakshi Tower, Udgir Road,<br />
                  Opp. Reliance Petrol Pump, Near Raymond Shop,<br />
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

      {/* ================================================================
          3. MAIN CONTENT
          ================================================================ */}
      <main className={styles.mainContent}>{children}</main>

      {/* ================================================================
          4. EDITORIAL LUXURY FOOTER
          ================================================================ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            {/* Column 1: Brand & Socials */}
            <div className={styles.footerBrandCol}>
              <div className={styles.footerLogoContainer}>
                <span className={styles.footerBrandWordmark}>BAGODI</span>
                <span className={styles.footerBrandSubtitle}>SHOPPING MALL • BIDAR</span>
              </div>
              <p className={styles.footerDesc}>
                A premium multi-brand shopping destination for fashion, lifestyle and more.
              </p>
              {/* Social Channels (Unconfigured safe anchors ready for verified links) */}
              <div className={styles.footerSocialIcons}>
                <a
                  href="#instagram"
                  className={styles.socialCircle}
                  aria-label="Instagram (Unconfigured pending verified handle)"
                  title="Instagram"
                  onClick={(e) => e.preventDefault()}
                >
                  <Instagram size={14} />
                </a>
                <a
                  href="#facebook"
                  className={styles.socialCircle}
                  aria-label="Facebook (Unconfigured pending verified handle)"
                  title="Facebook"
                  onClick={(e) => e.preventDefault()}
                >
                  <Facebook size={14} />
                </a>
                <a
                  href="#youtube"
                  className={styles.socialCircle}
                  aria-label="YouTube (Unconfigured pending verified handle)"
                  title="YouTube"
                  onClick={(e) => e.preventDefault()}
                >
                  <Youtube size={14} />
                </a>
                <a
                  href="#twitter"
                  className={styles.socialCircle}
                  aria-label="X / Twitter (Unconfigured pending verified handle)"
                  title="X"
                  onClick={(e) => e.preventDefault()}
                >
                  <Twitter size={14} />
                </a>
              </div>
            </div>

            {/* Column 2: Shop */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Shop</h4>
              <ul className={styles.footerLinks}>
                <li><Link to="/catalogue?category=mens-wear">Men's Wear</Link></li>
                <li><Link to="/catalogue?category=womens-wear">Women's Wear</Link></li>
                <li><Link to="/catalogue?category=kids-wear">Kid's Wear</Link></li>
                <li><Link to="/catalogue?category=sarees">Sarees</Link></li>
                <li><Link to="/catalogue?category=blazers">Blazers</Link></li>
                <li><Link to="/catalogue?offers=true">Festive Collection</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Customer Service</h4>
              <ul className={styles.footerLinks}>
                <li><Link to="/account/orders">My Orders</Link></li>
                <li><Link to="/account/returns">Returns & Replacements</Link></li>
                <li><Link to="/account/orders">Track Order</Link></li>
                <li><Link to="/contact">FAQs</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 4: About Bagodi */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>About Bagodi</h4>
              <ul className={styles.footerLinks}>
                <li><Link to="/#store-experience">Our Story</Link></li>
                <li><Link to="/catalogue">Brands</Link></li>
                <li><Link to="/#store-experience">Store Locator</Link></li>
                <li><Link to="/contact">Careers</Link></li>
                <li><Link to="/contact">Partner With Us</Link></li>
              </ul>
            </div>

            {/* Column 5: Download Our App */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Download Our App</h4>
              <div className={styles.appBadges}>
                <div className={styles.appBadge}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a1.996 1.996 0 0 1-.22-.924V2.738c0-.342.08-.66.219-.924zM15.207 13.414l2.453-2.453-12.83-7.25 10.377 9.703zm0-2.828L4.83 20.289l12.83-7.25-2.453-2.453zm3.873 1.414l2.586-1.462a1.002 1.002 0 0 0 0-1.748L19.08 7.328l-2.166 2.166 2.166 2.166z"/>
                  </svg>
                  <div>
                    <span className={styles.appBadgeSmall}>GET IT ON</span>
                    <span className={styles.appBadgeLarge}>Google Play</span>
                  </div>
                </div>

                <div className={styles.appBadge}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-.99 1.74-.88 2.76 1.01.08 2.05-.51 2.61-1.26z"/>
                  </svg>
                  <div>
                    <span className={styles.appBadgeSmall}>Download on the</span>
                    <span className={styles.appBadgeLarge}>App Store</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streamlined Mobile-Only Footer (Hidden on Desktop) */}
          <div className={styles.mobileFooterGrid}>
            <div className={styles.mobileFooterBrand}>
              <span className={styles.footerBrandWordmark}>BAGODI</span>
              <span className={styles.footerBrandSubtitle}>SHOPPING MALL • BIDAR</span>
              <p className={styles.mobileFooterTagline}>
                Bidar Flagship Atelier • Est. 1968
              </p>
            </div>

            <div className={styles.footerSocialIcons}>
              <a
                href="#instagram"
                className={styles.socialCircle}
                aria-label="Instagram"
                title="Instagram"
                onClick={(e) => e.preventDefault()}
              >
                <Instagram size={14} />
              </a>
              <a
                href="#facebook"
                className={styles.socialCircle}
                aria-label="Facebook"
                title="Facebook"
                onClick={(e) => e.preventDefault()}
              >
                <Facebook size={14} />
              </a>
              <a
                href="#youtube"
                className={styles.socialCircle}
                aria-label="YouTube"
                title="YouTube"
                onClick={(e) => e.preventDefault()}
              >
                <Youtube size={14} />
              </a>
              <a
                href="#twitter"
                className={styles.socialCircle}
                aria-label="X"
                title="X"
                onClick={(e) => e.preventDefault()}
              >
                <Twitter size={14} />
              </a>
            </div>

            {/* Essential Quick Links */}
            <div className={styles.mobileQuickLinks}>
              <Link to="/account/orders">My Orders</Link>
              <span className={styles.mobileLinkDot}>•</span>
              <Link to="/account/returns">Returns</Link>
              <span className={styles.mobileLinkDot}>•</span>
              <Link to="/contact">Contact</Link>
              <span className={styles.mobileLinkDot}>•</span>
              <Link to="/#store-experience">Store Info</Link>
            </div>

            <div className={styles.mobileContactNote}>
              Meenakshi Tower, Udgir Road, Bidar • Helpline: +91 99720 00805
            </div>
          </div>

          {/* Sub-Footer */}
          <div className={styles.subFooter}>
            <div className={styles.subFooterLeft}>
              © 2026 Bagodi. All rights reserved.
            </div>
            <div className={styles.subFooterRight}>
              <Link to="/policies/privacy">Privacy Policy</Link>
              <span className={styles.subFooterDivider}>|</span>
              <Link to="/policies/terms">Terms of Service</Link>
              <span className={styles.subFooterDivider}>|</span>
              <Link to="/policies/refund">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================================
          5. MOBILE BOTTOM NAVIGATION BAR
          ================================================================ */}
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
          <Grid size={20} strokeWidth={1.8} />
          <span>Categories</span>
        </Link>
        <Link
          to="/account/wishlist"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname.includes("wishlist") ? styles.mobileNavItemActive : ""}`}
        >
          <div className={styles.mobileNavIconWrap}>
            <Heart size={20} strokeWidth={1.8} />
            {wishlistCount > 0 && <span className={styles.mobileNavBadge}>{wishlistCount}</span>}
          </div>
          <span>Wishlist</span>
        </Link>
        <Link
          to="/cart"
          onClick={() => triggerHaptic("selection")}
          className={`${styles.mobileNavItem} ${location.pathname === "/cart" ? styles.mobileNavItemActive : ""}`}
        >
          <div className={styles.mobileNavIconWrap}>
            <ShoppingBag size={20} strokeWidth={1.8} />
            {cartCount > 0 && <span className={styles.mobileNavBadge}>{cartCount}</span>}
          </div>
          <span>Bag</span>
        </Link>
        {user ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setIsMobileAccountDrawerOpen(true);
            }}
            className={`${styles.mobileNavItem} ${location.pathname.includes("account") ? styles.mobileNavItemActive : ""}`}
          >
            <User size={18} />
            <span>Account</span>
          </button>
        ) : (
          <Link
            to="/login"
            onClick={() => triggerHaptic("selection")}
            className={`${styles.mobileNavItem} ${location.pathname === "/login" ? styles.mobileNavItemActive : ""}`}
          >
            <User size={18} />
            <span>Account</span>
          </Link>
        )}
      </nav>

      {/* Mobile Account Bottom Sheet Drawer */}
      {isMobileAccountDrawerOpen && user && (
        <>
          <div
            className={styles.mobileAccountDrawerBackdrop}
            onClick={() => setIsMobileAccountDrawerOpen(false)}
          />
          <div className={styles.mobileAccountDrawer}>
            <div className={styles.mobileDrawerDragPill} />
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E5DED3" }}>
              <div className={styles.accountHeaderGreet}>Signed in as</div>
              <div className={styles.accountHeaderName} style={{ fontSize: 15, marginTop: 2 }}>
                {user.fullName || (user as any)?.display_name || "Valued Customer"}
              </div>
              <div className={styles.accountHeaderContact}>
                {user.phone || (user as any)?.phone_e164 || user.email || ""}
              </div>
            </div>
            <div className={styles.accountMenuList}>
              <Link
                to="/account/profile"
                className={`${styles.accountMenuItem} ${location.pathname === "/account/profile" ? styles.accountMenuItemActive : ""}`}
                onClick={() => setIsMobileAccountDrawerOpen(false)}
              >
                <User size={16} />
                <span>My Account</span>
              </Link>
              <Link
                to="/account/orders"
                className={`${styles.accountMenuItem} ${location.pathname === "/account/orders" ? styles.accountMenuItemActive : ""}`}
                onClick={() => setIsMobileAccountDrawerOpen(false)}
              >
                <Package size={16} />
                <span>My Orders</span>
              </Link>
              <Link
                to="/account/returns"
                className={`${styles.accountMenuItem} ${location.pathname === "/account/returns" ? styles.accountMenuItemActive : ""}`}
                onClick={() => setIsMobileAccountDrawerOpen(false)}
              >
                <RotateCcw size={16} />
                <span>Return & Replace</span>
              </Link>
              <button
                type="button"
                className={`${styles.accountMenuItem} ${styles.accountMenuItemLogout}`}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Offline & Network Resilience Sentinel */}
      <NetworkStatusBar />
    </div>
  );
};
