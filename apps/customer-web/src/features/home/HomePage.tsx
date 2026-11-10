import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import { CinematicHero } from "./components/CinematicHero";
import { Button, SkeletonCard, EmptyState, ApiErrorCard } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { Product } from "@bagodi/shared-types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Award,
  Scissors,
  Truck,
  Heart,
} from "lucide-react";
import { formatINR } from "@bagodi/utilities";

export const HomePage: React.FC = () => {
  // Query Featured Products from Backend API
  const {
    data: featuredProducts,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<Product[]>({
    queryKey: ["home-featured-products"],
    queryFn: () => defaultApiClient.get<Product[]>("/products", { params: { isFeatured: true, pageSize: 8 } }),
    retry: 1,
  });

  // Authentic Categories
  const storeCategories = [
    {
      id: "sarees",
      name: "Pure Silk Sarees",
      meta: "Kanjivaram, Banarasi & Tussar",
      path: "/catalogue?category=sarees",
      tag: "Heritage Craft",
    },
    {
      id: "men-suiting",
      name: "Raymond Suiting & Menswear",
      meta: "Bespoke Fabrics, Blazers & Formalwear",
      path: "/catalogue?category=men-suiting",
      tag: "Authorised Partner",
    },
    {
      id: "wedding",
      name: "Bridal & Festive Couture",
      meta: "Lehengas, Sherwanis & Indo-Western",
      path: "/catalogue?category=wedding",
      tag: "Wedding Atelier",
    },
    {
      id: "fabrics",
      name: "Unstitched Premium Fabrics",
      meta: "Pure Wool, Linen & Royal Brocades",
      path: "/catalogue?category=fabrics",
      tag: "By the Metre",
    },
    {
      id: "western",
      name: "Western Ready-To-Wear",
      meta: "Shirts, Trousers & Modern Coordinates",
      path: "/catalogue?category=western",
      tag: "Contemporary",
    },
    {
      id: "kids",
      name: "Kids' Festive Collection",
      meta: "Traditional Kurtas & Ethnic Gowns",
      path: "/catalogue?category=kids",
      tag: "Celebration",
    },
  ];

  // Brand Directory
  const featuredBrands = [
    { name: "Raymond", specialty: "Authorised Suiting & Shirting", path: "/catalogue?brand=raymond" },
    { name: "Park Avenue", specialty: "Executive Tailored Apparel", path: "/catalogue?brand=park-avenue" },
    { name: "Parx", specialty: "Urban Casuals & Weekend Wear", path: "/catalogue?brand=parx" },
    { name: "ColorPlus", specialty: "Smart Casual Cotton & Chinos", path: "/catalogue?brand=colorplus" },
    { name: "Bagodi Heritage", specialty: "Handpicked Indian Silks", path: "/catalogue?brand=bagodi-couture" },
  ];

  return (
    <div className={styles.homepageContainer}>
      {/* 1. Cinematic Animated Luxury Hero Experience */}
      <CinematicHero />

      {/* 2. Brand Trust Strip */}
      <div className={styles.trustStrip}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <Award size={18} color="var(--color-champagne-gold)" />
            <span>Silk Mark Certified Silks</span>
          </div>
          <div className={styles.trustItem}>
            <ShieldCheck size={18} color="var(--color-champagne-gold)" />
            <span>Authorised Raymond Retailer</span>
          </div>
          <div className={styles.trustItem}>
            <Scissors size={18} color="var(--color-champagne-gold)" />
            <span>Master Tailoring & Alterations</span>
          </div>
          <div className={styles.trustItem}>
            <Truck size={18} color="var(--color-champagne-gold)" />
            <span>Insured Pan-India Dispatch</span>
          </div>
        </div>
      </div>

      {/* 3. Shop by Curated Categories — Switch Deck Card 3 */}
      <section className={`${styles.deckCard} ${styles.deckLevel3} ${styles.sectionWrapper}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionSuperTitle}>Curated Departments</div>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>
            Immerse yourself in handpicked collections designed for discerning tastes and royal Indian festivities.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {storeCategories.map((cat) => (
            <Link key={cat.id} to={cat.path} className={styles.categoryCard}>
              <div className={styles.categoryVisual}>
                <div className={styles.categoryVisualPattern} />
                <div style={{ textAlign: "center", zIndex: 1, padding: "var(--space-4)" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "var(--tracking-widest)",
                      textTransform: "uppercase",
                      color: "var(--color-royal-burgundy)",
                      fontWeight: 700,
                      background: "rgba(255, 255, 255, 0.8)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {cat.tag}
                  </span>
                </div>
              </div>
              <div className={styles.categoryInfo}>
                <div>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <p className={styles.categoryMeta}>{cat.meta}</p>
                </div>
                <div className={styles.categoryArrow}>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Multi-Brand Showcase (Raymond & Partners) — Switch Deck Card 4 */}
      <section className={`${styles.deckCard} ${styles.deckLevel4} ${styles.brandShowcaseSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionSuperTitle} style={{ color: "var(--color-champagne-gold)" }}>
            Multi-Brand Shopping Destination
          </div>
          <h2 className={styles.sectionTitle} style={{ color: "#FFFFFF" }}>
            The Brand Portfolio
          </h2>
          <p className={styles.sectionSubtitle} style={{ color: "var(--color-warm-beige)" }}>
            Bagodi Shopping Mall is proud to host distinguished national apparel labels known for fabric mastery.
          </p>
        </div>

        <div className={styles.brandGrid}>
          {featuredBrands.map((brand, idx) => (
            <Link key={idx} to={brand.path} className={styles.brandTile}>
              <div className={styles.brandTileName}>{brand.name}</div>
              <div className={styles.brandTileTag}>{brand.specialty}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Arrivals (Live Backend API Data) — Switch Deck Card 5 */}
      <section className={`${styles.deckCard} ${styles.deckLevel5} ${styles.sectionWrapper}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionSuperTitle}>Fresh From Bidar Store</div>
          <h2 className={styles.sectionTitle}>Featured Arrivals</h2>
          <p className={styles.sectionSubtitle}>
            Browse active garments currently indexed on our boutique inventory floor.
          </p>
        </div>

        {isProductsLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-6)" }}>
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} height="360px" />
            ))}
          </div>
        ) : productsError ? (
          <ApiErrorCard
            title="Catalogue Floor Offline"
            message="Could not load active arrivals. Please ensure the backend service is reachable."
            onRetry={() => refetchProducts()}
          />
        ) : !featuredProducts || featuredProducts.length === 0 ? (
          <EmptyState
            title="Catalogue Floor Refreshing"
            description="Our retail merchandising team in Bidar is updating seasonal apparel. Please explore all departments."
            action={
              <Link to="/catalogue">
                <Button size="md">Browse Complete Catalogue</Button>
              </Link>
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-6)" }}>
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all var(--duration-fast) ease",
                }}
              >
                <div style={{ height: "260px", background: "var(--color-warm-beige)", position: "relative" }}>
                  {prod.images && prod.images.length > 0 ? (
                    <img src={prod.images[0].url} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-muted-grey)" }}>
                      Bagodi Couture
                    </div>
                  )}
                  <button
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-obsidian)",
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} />
                  </button>
                </div>
                <div style={{ padding: "var(--space-5)", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", fontWeight: 700 }}>
                      {prod.brand?.name || "Bagodi"}
                    </span>
                    <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-obsidian)", marginTop: 2, marginBottom: "var(--space-2)" }}>
                      {prod.name}
                    </h3>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)", marginTop: "var(--space-3)" }}>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-obsidian)" }}>
                      {formatINR(prod.basePrice)}
                    </span>
                    <Link to={`/product/${prod.slug || prod.id}`}>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-champagne-gold)", fontWeight: 600 }}>
                        View Details →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Physical Store Experience & Brand Story — Switch Deck Card 6 */}
      <section id="store-experience" className={`${styles.deckCard} ${styles.deckLevel6} ${styles.storeStorySection}`}>
        <div className={styles.storeStoryGrid}>
          <div>
            <div className={styles.sectionSuperTitle}>Bidar's Landmark Retail Destination</div>
            <h2 className={styles.sectionTitle}>
              Experience Bagodi <br />
              Shopping Mall
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "var(--space-4)" }}>
              Rising with its distinctive dark charcoal architecture, vertical ribbing, and metallic gold signage, the Bagodi Shopping Mall stands as the premier fashion address in Bidar, Karnataka.
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "var(--space-6)" }}>
              Step inside for an expansive multi-floor shopping journey featuring Raymond certified fabrics, bespoke tailoring suites, pure silk saree counters, and curated garments for weddings and festivities.
            </p>

            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <Link to="/catalogue">
                <Button size="md" rightIcon={<ArrowRight size={16} />}>
                  Explore In-Store Inventory
                </Button>
              </Link>
            </div>
          </div>

          <div className={styles.storeDetailsCard}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", marginBottom: "var(--space-5)", color: "var(--color-obsidian)" }}>
              Store Information & Timings
            </h3>

            <div className={styles.storeInfoRow}>
              <MapPin size={20} color="var(--color-champagne-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-obsidian)" }}>Address:</strong>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                  Bagodi Shopping Mall, Near Shivaji Chowk, Main Commercial Road, Bidar, Karnataka - 585401
                </p>
              </div>
            </div>

            <div className={styles.storeInfoRow}>
              <Clock size={20} color="var(--color-champagne-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-obsidian)" }}>Store Hours:</strong>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                  Monday – Sunday: 10:00 AM – 9:30 PM (Open all 7 days)
                </p>
              </div>
            </div>

            <div className={styles.storeInfoRow}>
              <Phone size={20} color="var(--color-champagne-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-obsidian)" }}>Concierge Desk:</strong>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                  Customer Support & Bespoke Suiting Appointments available in-store
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
