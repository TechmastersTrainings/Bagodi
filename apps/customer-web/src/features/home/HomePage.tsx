import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { Button, SkeletonCard, EmptyState, ApiErrorCard } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, PaginatedResponse } from "@bagodi/shared-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  RotateCcw,
  Headphones,
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@bagodi/utilities";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeEditTab, setActiveEditTab] = useState<"TRENDING" | "NEW" | "BESTSELLERS" | "OFFERS">("TRENDING");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // 1. Query Real Products from Backend API
  const {
    data: rawProductsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<PaginatedResponse<Product> | Product[]>({
    queryKey: ["home-featured-products"],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<Product> | Product[]>("/products", {
        params: { pageSize: 12 },
      }),
    retry: 1,
  });

  const rawList: any[] = Array.isArray(rawProductsData)
    ? rawProductsData
    : Array.isArray(rawProductsData?.items)
    ? rawProductsData.items
    : [];

  const featuredProducts: Product[] = rawList.map((p) => ({
    ...p,
    isActive: Boolean(p.isActive ?? (p.status === "active" && p.is_published !== false)),
    isArchived: Boolean(p.isArchived ?? (p.status === "archived")),
    currency: p.currency || "INR",
    basePrice: Number(p.basePrice) || (p.variants?.[0]?.base_price ? Number(p.variants[0].base_price) : 0),
  }));

  // 2. Add to Bag Mutation
  const addToBagMutation = useMutation({
    mutationFn: async (product: Product) => {
      const variant = product.variants?.[0];
      const variantId = variant?.id || "default_variant";
      return await defaultApiClient.post("/cart/items", {
        productId: product.id,
        product_id: product.id,
        variantId,
        variant_id: variantId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  // Curated World Categories
  const worldCategories = [
    {
      name: "Men's Wear",
      href: "/catalogue?category=mens-wear",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Women's Wear",
      href: "/catalogue?category=womens-wear",
      img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Kid's Wear",
      href: "/catalogue?category=kids-wear",
      img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Sarees",
      href: "/catalogue?category=sarees",
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Blazers",
      href: "/catalogue?category=blazers",
      img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85",
    },
    {
      name: "Festive Collection",
      href: "/catalogue?offers=true",
      img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=85",
    },
  ];

  return (
    <div className={styles.homeContainer}>
      {/* ================================================================
          1. LARGE EDITORIAL CAMPAIGN HERO CAROUSEL
          ================================================================ */}
      <section className={styles.heroSection}>
        <div className={styles.heroBanner}>
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85"
            alt="Bagodi Festive Collection"
            className={styles.heroBgImg}
          />
          <div className={styles.heroGradientOverlay} />

          <div className={styles.heroContentWrapper}>
            <div className={styles.heroContent}>
              <span className={styles.heroSuperTitle}>THE NEW SEASON</span>
              <h1 className={styles.heroTitle}>Festive Collection</h1>
              <p className={styles.heroSubtitle}>Tradition Meets Modern Style</p>
              <Link to="/catalogue?offers=true" className={styles.heroCtaBtn}>
                <span>Shop The Collection</span>
                <ArrowRight size={15} />
              </Link>

              {/* Carousel Indicators */}
              <div className={styles.heroDots}>
                <span className={`${styles.dot} ${styles.dotActive}`} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            type="button"
            className={`${styles.heroNavBtn} ${styles.heroPrevBtn}`}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`${styles.heroNavBtn} ${styles.heroNextBtn}`}
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ================================================================
          2. FIVE-POINT VALUE & TRUST STRIP
          ================================================================ */}
      <section className={styles.valueStripSection}>
        <div className={styles.valueStripInner}>
          <div className={styles.valueItem}>
            <Award size={22} className={styles.valueIcon} />
            <div>
              <strong className={styles.valueTitle}>Authentic Brands</strong>
              <span className={styles.valueDesc}>Trusted & Original</span>
            </div>
          </div>

          <div className={styles.valueItem}>
            <Sparkles size={22} className={styles.valueIcon} />
            <div>
              <strong className={styles.valueTitle}>Great Value</strong>
              <span className={styles.valueDesc}>Best Prices Always</span>
            </div>
          </div>

          <div className={styles.valueItem}>
            <RotateCcw size={22} className={styles.valueIcon} />
            <div>
              <strong className={styles.valueTitle}>Easy Returns</strong>
              <span className={styles.valueDesc}>30-Day Policy</span>
            </div>
          </div>

          <div className={styles.valueItem}>
            <ShieldCheck size={22} className={styles.valueIcon} />
            <div>
              <strong className={styles.valueTitle}>Secure Payments</strong>
              <span className={styles.valueDesc}>UPI & COD</span>
            </div>
          </div>

          <div className={styles.valueItem}>
            <Headphones size={22} className={styles.valueIcon} />
            <div>
              <strong className={styles.valueTitle}>Customer Support</strong>
              <span className={styles.valueDesc}>24×7 Assistance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          3. EXPLORE THE BAGODI WORLD (CATEGORY SHOWCASE)
          ================================================================ */}
      <section className={styles.worldSection}>
        <div className={styles.sectionHeadingWrapper}>
          <div className={styles.ornamentLineLeft} />
          <h2 className={styles.sectionHeading}>Explore the Bagodi World</h2>
          <div className={styles.ornamentLineRight} />
        </div>
        <p className={styles.sectionSubtext}>Shop from a wide range of premium collections</p>

        <div className={styles.worldGrid}>
          {worldCategories.map((cat, idx) => (
            <Link key={idx} to={cat.href} className={styles.worldCard}>
              <div className={styles.worldCardImageWrapper}>
                <img src={cat.img} alt={cat.name} className={styles.worldCardImg} loading="lazy" />
                <div className={styles.worldCardOverlay} />
                <div className={styles.worldCardPill}>{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================
          4. THE BAGODI EDIT (CURATED STYLES GRID)
          ================================================================ */}
      <section className={styles.editSection}>
        <div className={styles.editHeaderRow}>
          <div className={styles.editHeaderLeft}>
            <h2 className={styles.editTitle}>The Bagodi Edit</h2>
          </div>
          <div className={styles.editHeaderCenter}>
            <span className={styles.editSubtitle}>Handpicked styles for every occasion</span>
          </div>
          <div className={styles.editHeaderRight}>
            <Link to="/catalogue" className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Edit Category Tabs */}
        <div className={styles.editTabsRow}>
          <button
            type="button"
            className={`${styles.editTabBtn} ${activeEditTab === "TRENDING" ? styles.editTabActive : ""}`}
            onClick={() => setActiveEditTab("TRENDING")}
          >
            Trending Now
          </button>
          <button
            type="button"
            className={`${styles.editTabBtn} ${activeEditTab === "NEW" ? styles.editTabActive : ""}`}
            onClick={() => setActiveEditTab("NEW")}
          >
            New Arrivals
          </button>
          <button
            type="button"
            className={`${styles.editTabBtn} ${activeEditTab === "BESTSELLERS" ? styles.editTabActive : ""}`}
            onClick={() => setActiveEditTab("BESTSELLERS")}
          >
            Bestsellers
          </button>
          <button
            type="button"
            className={`${styles.editTabBtn} ${activeEditTab === "OFFERS" ? styles.editTabActive : ""}`}
            onClick={() => setActiveEditTab("OFFERS")}
          >
            Exclusive Offers
          </button>
        </div>

        {/* Product Grid */}
        {isProductsLoading ? (
          <div className={styles.productsGrid}>
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} height="360px" />
            ))}
          </div>
        ) : productsError ? (
          <ApiErrorCard
            title="Catalogue Offline"
            message="Could not load curated garments. Please refresh."
            onRetry={() => refetchProducts()}
          />
        ) : !featuredProducts || featuredProducts.length === 0 ? (
          <EmptyState
            title="Garments Refreshing"
            description="Our retail merchandising team in Bidar is updating seasonal apparel."
            action={
              <Link to="/catalogue">
                <Button size="md">Browse Complete Catalogue</Button>
              </Link>
            }
          />
        ) : (
          <div className={styles.productsGrid}>
            {featuredProducts.slice(0, 5).map((prod) => {
              const primaryImage = prod.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85";
              const firstVariant = prod.variants?.[0];
              const sellingPrice = firstVariant?.sellingPrice || prod.basePrice;
              const mrp = firstVariant?.mrp ? Number(firstVariant.mrp) : sellingPrice * 1.35;

              return (
                <div key={prod.id} className={styles.productCard}>
                  {/* Image & Wishlist Button */}
                  <div className={styles.productImgWrapper}>
                    <img src={primaryImage} alt={prod.name} className={styles.productImg} loading="lazy" />
                    <button
                      type="button"
                      className={styles.wishlistBtn}
                      aria-label="Add to Wishlist"
                      onClick={() => navigate("/account/wishlist")}
                    >
                      <Heart size={15} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className={styles.productInfo}>
                    <Link to={`/product/${prod.slug || prod.id}`} className={styles.productTitleLink}>
                      <h3 className={styles.productTitle}>{prod.name}</h3>
                    </Link>

                    {/* Star Rating */}
                    <div className={styles.ratingRow}>
                      <Star size={12} fill="#B69A75" color="#B69A75" />
                      <span className={styles.ratingScore}>4.5</span>
                      <span className={styles.ratingCount}>(128)</span>
                    </div>

                    {/* Pricing */}
                    <div className={styles.priceRow}>
                      <span className={styles.sellingPrice}>{formatINR(sellingPrice)}</span>
                      {mrp > sellingPrice && (
                        <span className={styles.mrpPrice}>{formatINR(mrp)}</span>
                      )}
                    </div>

                    {/* Add to Bag CTA Button */}
                    <button
                      type="button"
                      className={styles.addToBagBtn}
                      onClick={() => addToBagMutation.mutate(prod)}
                      disabled={addToBagMutation.isPending}
                    >
                      <ShoppingBag size={14} />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================================================================
          5. OCCASION-LED SHOPPING COLLECTIONS (3 EDITORIAL BANNERS)
          ================================================================ */}
      <section className={styles.occasionsSection}>
        <div className={styles.occasionsGrid}>
          {/* Card 1: Wedding Essentials */}
          <div className={`${styles.occasionCard} ${styles.weddingCard}`}>
            <div className={styles.occasionTextContent}>
              <h3 className={styles.occasionTitle}>Wedding Essentials</h3>
              <p className={styles.occasionDesc}>Timeless styles for your special day</p>
              <Link to="/catalogue?category=wedding" className={styles.occasionBtn}>
                <span>Shop Wedding</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className={styles.occasionImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85"
                alt="Wedding Essentials"
                className={styles.occasionImg}
              />
            </div>
          </div>

          {/* Card 2: Everyday Elegance */}
          <div className={`${styles.occasionCard} ${styles.everydayCard}`}>
            <div className={styles.occasionTextContent}>
              <h3 className={styles.occasionTitle}>Everyday Elegance</h3>
              <p className={styles.occasionDesc}>Comfortable, stylish and versatile</p>
              <Link to="/catalogue?category=mens-wear" className={styles.occasionBtn}>
                <span>Shop Everyday</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className={styles.occasionImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85"
                alt="Everyday Elegance"
                className={styles.occasionImg}
              />
            </div>
          </div>

          {/* Card 3: Seasonal Offers */}
          <div className={`${styles.occasionCard} ${styles.offersCard}`}>
            <div className={styles.occasionTextContent}>
              <h3 className={styles.occasionTitle}>Seasonal Offers</h3>
              <p className={styles.occasionDesc}>Up to 40% Off on selected collections</p>
              <Link to="/catalogue?offers=true" className={styles.occasionBtn}>
                <span>Shop Offers</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className={styles.occasionImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=85"
                alt="Seasonal Offers"
                className={styles.occasionImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          6. WHAT OUR CUSTOMERS SAY (TESTIMONIALS)
          ================================================================ */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeadingWrapper}>
          <div className={styles.ornamentLineLeft} />
          <h2 className={styles.sectionHeading}>What Our Customers Say</h2>
          <div className={styles.ornamentLineRight} />
        </div>

        <div className={styles.testimonialsGrid}>
          {/* Testimonial 1 */}
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Rahul S."
                className={styles.customerAvatar}
              />
              <div className={styles.quoteMark}>“</div>
            </div>
            <p className={styles.testimonialText}>
              Amazing collection and great quality. Delivery was quick and hassle-free!
            </p>
            <div className={styles.customerMeta}>
              <strong className={styles.customerName}>Rahul S.</strong>
              <div className={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#B69A75" color="#B69A75" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Priya K."
                className={styles.customerAvatar}
              />
              <div className={styles.quoteMark}>“</div>
            </div>
            <p className={styles.testimonialText}>
              Loved the saree I ordered. The fabric, fit and finish are excellent!
            </p>
            <div className={styles.customerMeta}>
              <strong className={styles.customerName}>Priya K.</strong>
              <div className={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#B69A75" color="#B69A75" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Amit D."
                className={styles.customerAvatar}
              />
              <div className={styles.quoteMark}>“</div>
            </div>
            <p className={styles.testimonialText}>
              Trusted platform for the latest trends. Smooth shopping experience!
            </p>
            <div className={styles.customerMeta}>
              <strong className={styles.customerName}>Amit D.</strong>
              <div className={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#B69A75" color="#B69A75" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          7. STAY IN THE BAGODI CIRCLE (NEWSLETTER STRIP)
          ================================================================ */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterLeft}>
            <div className={styles.envelopeIconCircle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div>
              <h3 className={styles.newsletterTitle}>Stay in the Bagodi Circle</h3>
              <p className={styles.newsletterSubtitle}>Get the latest collections, exclusive offers and festive updates.</p>
            </div>
          </div>

          <div className={styles.newsletterRight}>
            {newsletterSubscribed ? (
              <div className={styles.newsletterSuccessBadge}>
                <CheckCircle2 size={16} />
                <span>Thank you for subscribing to the Bagodi Circle!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className={styles.newsletterInput}
                  required
                />
                <button type="submit" className={styles.subscribeBtn}>
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          8. STORE EXPERIENCE & HERITAGE
          ================================================================ */}
      <section id="store-experience" className={styles.storeExperienceSection}>
        <div className={styles.storeExperienceInner}>
          <div className={styles.storeExperienceText}>
            <span className={styles.storeSuperTitle}>BIDAR'S PREMIER FASHION ADDRESS</span>
            <h2 className={styles.storeTitle}>Experience Bagodi Shopping Mall</h2>
            <p className={styles.storeParagraph}>
              Rising with its distinctive architectural presence in Bidar, Karnataka, Bagodi Shopping Mall houses multiple floors of curated fashion: Raymond bespoke suiting, handpicked bridal silks, designer sarees, and celebration wear for the entire family.
            </p>
            <div className={styles.storeBadgeGroup}>
              <span className={styles.storeBadge}>ESTABLISHED IN BIDAR</span>
              <span className={styles.storeBadge}>AUTHENTIC SILK MARK</span>
              <span className={styles.storeBadge}>RAYMOND AUTHORISED</span>
            </div>
          </div>

          <div className={styles.storeInfoCard}>
            <h3 className={styles.storeCardTitle}>Store Information & Timings</h3>
            <div className={styles.storeCardRow}>
              <MapPin size={18} className={styles.storeCardIcon} />
              <div>
                <strong>Flagship Location:</strong>
                <p>Meenakshi Tower, Udgir Road, Opp. Reliance Petrol Pump, Bidar, Karnataka - 585401</p>
              </div>
            </div>
            <div className={styles.storeCardRow}>
              <Clock size={18} className={styles.storeCardIcon} />
              <div>
                <strong>Opening Hours:</strong>
                <p>Monday – Sunday: 10:00 AM – 9:30 PM (Open all 7 days)</p>
              </div>
            </div>
            <div className={styles.storeCardRow}>
              <Phone size={18} className={styles.storeCardIcon} />
              <div>
                <strong>Concierge Helpline:</strong>
                <p>+91 99720 00805 • Tailoring & Alteration services available in-store</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
