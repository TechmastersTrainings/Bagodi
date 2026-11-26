import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Sparkles,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@bagodi/utilities";
import heroEthnicKurtaImg from "../../assets/hero/hero-ethnic-kurta.jpg";
import heroBespokeSuitImg from "../../assets/hero/hero-bespoke-suit.webp";

interface HeroSlide {
  id: string;
  superTitle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  img: string;
  imgPosition: string;
  layout: "portrait" | "wide";
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "festive",
    superTitle: "THE NEW SEASON",
    title: "Festive Collection",
    subtitle: "Handcrafted Ethnic Prints & Contemporary Drapes",
    ctaText: "Shop The Collection",
    ctaHref: "/catalogue?offers=true",
    img: heroEthnicKurtaImg,
    imgPosition: "center top",
    layout: "portrait",
    alt: "Bagodi Festive Collection",
  },
  {
    id: "bespoke-suiting",
    superTitle: "BESPOKE TAILORING ATELIER",
    title: "Royal Menswear Edit",
    subtitle: "Precision-Crafted Suits & Custom Alterations",
    ctaText: "Shop Menswear",
    ctaHref: "/catalogue?category=mens-wear",
    img: heroBespokeSuitImg,
    imgPosition: "center top",
    layout: "portrait",
    alt: "Bagodi Bespoke Navy Suiting Collection",
  },
  {
    id: "executive-suits",
    superTitle: "SIGNATURE FORMAL WEAR",
    title: "Executive Suiting",
    subtitle: "Timeless Silhouettes for Every Milestone",
    ctaText: "Explore Formal Wear",
    ctaHref: "/catalogue?category=mens-wear",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2400&q=92",
    imgPosition: "center 26%",
    layout: "wide",
    alt: "Bagodi Executive Menswear Edit",
  },
  {
    id: "blazers",
    superTitle: "BESPOKE CEREMONIAL ATELIER",
    title: "Raymond Royal Blazers",
    subtitle: "Fine Worsted Suiting & Elegant Bandhgalas",
    ctaText: "Discover Blazers",
    ctaHref: "/catalogue?category=blazers",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=2400&q=92",
    imgPosition: "center 22%",
    layout: "portrait",
    alt: "Bagodi Royal Blazers and Suiting",
  },
];

const BRAND_LETTERS = ["B", "A", "G", "O", "D", "I"];
const WELCOMES_LETTERS = ["W", "E", "L", "C", "O", "M", "E", "S"];
const YOU_LETTERS = ["Y", "O", "U"];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeEditTab, setActiveEditTab] = useState<"TRENDING" | "NEW" | "BESTSELLERS" | "OFFERS">("TRENDING");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advancing moving carousel effect
  useEffect(() => {
    if (isAutoPlayPaused) return;
    const interval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlayPaused, activeHeroSlide]);

  const handlePrevSlide = useCallback(() => {
    setActiveHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const handleNextSlide = useCallback(() => {
    setActiveHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNextSlide();
    } else if (diff < -45) {
      handlePrevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90",
    },
    {
      name: "Women's Wear",
      href: "/catalogue?category=womens-wear",
      img: "https://pub-03ae4e5c962b409a94ad6b59adcef912.r2.dev/products/27487cc39d0b4ec780a7c09f5f17e5f0.webp",
    },
    {
      name: "Kid's Wear",
      href: "/catalogue?category=kids-wear",
      img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=1200&q=90",
    },
    {
      name: "Sarees",
      href: "/catalogue?category=sarees",
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90",
    },
    {
      name: "Blazers",
      href: "/catalogue?category=blazers",
      img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=90",
    },
    {
      name: "Festive Collection",
      href: "/catalogue?offers=true",
      img: "https://pub-03ae4e5c962b409a94ad6b59adcef912.r2.dev/products/14ead1c2d388489794c70e945413f7df.jpg",
    },
  ];

  return (
    <div className={styles.homeContainer}>
      {/* ================================================================
          1. LARGE EDITORIAL CAMPAIGN HERO CAROUSEL WITH MOVING MARQUEE
          ================================================================ */}
      <section className={styles.heroSection}>
        <div
          className={styles.heroBanner}
          onMouseEnter={() => setIsAutoPlayPaused(true)}
          onMouseLeave={() => setIsAutoPlayPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sliding Marquee Track */}
          <div
            className={styles.heroSliderTrack}
            style={{ transform: `translateX(-${activeHeroSlide * 100}%)` }}
          >
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`${styles.heroSlide} ${activeHeroSlide === idx ? styles.heroSlideActive : ""} ${slide.layout === "portrait" ? styles.heroSlidePortraitMode : ""}`}
              >
                {slide.layout === "portrait" ? (
                  <>
                    {/* Desktop Ambient Color-Matched Atmosphere */}
                    <img
                      src={slide.img}
                      alt=""
                      aria-hidden="true"
                      className={styles.heroAmbientBg}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    <div className={styles.heroGradientOverlay} />

                    {/* Mobile Full-Bleed Image (Portrait Ratio Fits Naturally) */}
                    <img
                      src={slide.img}
                      alt={slide.alt}
                      className={`${styles.heroBgImg} ${styles.heroMobileOnlyImg}`}
                      style={{ objectPosition: slide.imgPosition }}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />

                    {/* Desktop Crisp Uncropped Editorial Portrait Showcase */}
                    <div className={styles.heroPortraitShowcase}>
                      <img
                        src={slide.img}
                        alt={slide.alt}
                        className={styles.heroPortraitImg}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={slide.img}
                      alt={slide.alt}
                      className={styles.heroBgImg}
                      style={{ objectPosition: slide.imgPosition }}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    <div className={styles.heroGradientOverlay} />
                  </>
                )}

                <div className={styles.heroContentWrapper}>
                  <div className={styles.heroContent}>
                    <span className={styles.heroSuperTitle}>{slide.superTitle}</span>
                    <h1 className={styles.heroTitle}>{slide.title}</h1>
                    <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                    <Link to={slide.ctaHref} className={styles.heroCtaBtn}>
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fixed Carousel Indicators */}
          <div className={styles.heroDots} role="tablist" aria-label="Hero Carousel Slides">
            {HERO_SLIDES.map((s, dotIdx) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={activeHeroSlide === dotIdx}
                aria-label={`Go to slide ${dotIdx + 1}: ${s.title}`}
                className={`${styles.dot} ${activeHeroSlide === dotIdx ? styles.dotActive : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHeroSlide(dotIdx);
                }}
              />
            ))}
          </div>

          {/* Luxury Editorial Marquee Ticker */}
          <div className={styles.heroMarqueeStrip}>
            <div className={styles.heroMarqueeTrack}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.heroMarqueeContent}>
                  <span>ESTABLISHED 1968</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                  <span>BIDAR FLAGSHIP MALL</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                  <span>SILK MARK CERTIFIED 100% PURE SILK</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                  <span>RAYMOND MASTER TAILORING ATELIER</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                  <span>ROYAL FESTIVE PRET & BRIDAL COUTURE</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                  <span>INSURED DOORSTEP DISPATCH</span>
                  <span className={styles.marqueeSeparator}>✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. GRAND WELCOME ARCH ("BAGODI WELCOMES YOU" CALLIGRAPHY INK)
          ================================================================ */}
      <section className={styles.welcomeArchSection} aria-label="Bagodi Welcomes You">
        <div className={styles.welcomeArchCard}>
          <div className={styles.heroWelcomeArch} aria-hidden="true">
            {/* Word 1: BAGODI */}
            <div className={styles.archGroup}>
              {BRAND_LETTERS.map((char, idx) => (
                <span
                  key={`b-${char}-${idx}`}
                  className={`${styles.watermarkLetter} ${styles.primaryBrandLetter}`}
                  style={{ "--char-i": idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>

            <span
              className={styles.archDot}
              style={{ "--char-i": 6 } as React.CSSProperties}
            />

            {/* Word 2: WELCOMES */}
            <div className={styles.archGroup}>
              {WELCOMES_LETTERS.map((char, idx) => (
                <span
                  key={`w-${char}-${idx}`}
                  className={styles.watermarkLetter}
                  style={{ "--char-i": 7 + idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>

            <span
              className={styles.archDot}
              style={{ "--char-i": 15 } as React.CSSProperties}
            />

            {/* Word 3: YOU */}
            <div className={styles.archGroup}>
              {YOU_LETTERS.map((char, idx) => (
                <span
                  key={`y-${char}-${idx}`}
                  className={styles.watermarkLetter}
                  style={{ "--char-i": 16 + idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Archival Book Ruled Underline */}
          <div className={styles.bookArchivalRule} aria-hidden="true">
            <span className={styles.bookRuleLineLeft} />
            <span className={styles.bookRuleFlourish}>❖</span>
            <span className={styles.bookRuleLineRight} />
          </div>

          <p className={styles.welcomeSubtitle}>
            Bidar Flagship Atelier &bull; Established 1968 &bull; Heritage Fashion Landmark
          </p>
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
