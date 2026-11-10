import React from "react";
import { Link } from "react-router-dom";
import styles from "./CategoryHeroPavilion.module.css";
import { Category } from "@bagodi/shared-types";
import { CURATED_CATEGORIES } from "../data/curatedCatalogueData";
import { Award, ShieldCheck, Scissors, Truck } from "lucide-react";

interface CategoryHeroPavilionProps {
  activeCategory?: Category;
  totalGarments: number;
  onSelectCategory: (slug?: string) => void;
}

export const CategoryHeroPavilion: React.FC<CategoryHeroPavilionProps> = ({
  activeCategory,
  totalGarments,
  onSelectCategory,
}) => {
  const isAll = !activeCategory;

  // Title and subtitle dynamic copy
  let title = "Curated High Fashion & Heritage Collections";
  let subtitle =
    "Explore Bidar's premier fashion landmark — authentic Silk Mark certified sarees, Raymond master suiting, royal bridal lehengas, and contemporary family attire.";
  let bgImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85";

  if (activeCategory) {
    if (activeCategory.slug === "sarees") {
      title = "Silk Mark Certified Sarees";
      subtitle =
        "Heirloom Kanjeevarams, antique Banarasi brocades, and pure Mysore crepes — handwoven by master artisans and hallmarked with Silk Mark India certification.";
      bgImage = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "men-suiting") {
      title = "Raymond Master Suiting & Menswear";
      subtitle =
        "Precision-tailored 3-piece wool suits, Italian blazers, and royal bandhgalas crafted from pure Australian Merino wool with in-mall custom alteration services.";
      bgImage = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "wedding") {
      title = "The Royal Bridal Atelier";
      subtitle =
        "Regal hand-embroidered zardozi lehengas and royal groom sherwanis for grand wedding ceremonies, receptions, and sangeet celebrations.";
      bgImage = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "women-ethnic") {
      title = "Designer Women's Ethnic Couture";
      subtitle =
        "Chic Anarkalis, flared shararas, and silk kurta sets crafted for celebratory festivities with comfortable modern tailoring.";
      bgImage = "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "western") {
      title = "Modern Cosmopolitan Western";
      subtitle =
        "Contemporary chic dresses, luxury cashmere outerwear, and refined coordinates celebrating urban lifestyle elegance.";
      bgImage = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "fabrics") {
      title = "Unstitched Luxury Fabrics";
      subtitle =
        "Fine Raymond worsted wool lengths, pure Italian flax linens, and pure mulberry silks for bespoke tailoring.";
      bgImage = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=85";
    } else if (activeCategory.slug === "offers") {
      title = "Festive Reductions & Special Offers";
      subtitle =
        "Privileged seasonal pricing and celebratory offers across Bidar's finest multi-brand designer ensembles.";
      bgImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85";
    } else {
      title = activeCategory.name;
      subtitle = activeCategory.description || subtitle;
    }
  }

  return (
    <section className={styles.heroRoot} aria-label="Catalogue Header Pavilion">
      {/* Editorial Atmospheric Background */}
      <div className={styles.heroBackgroundAtmosphere} aria-hidden="true">
        <img src={bgImage} alt="" className={styles.heroBackgroundImage} />
        <div className={styles.heroBackgroundMask} />
      </div>

      <div className={styles.heroContent}>
        {/* Luxury Breadcrumbs */}
        <nav className={styles.breadcrumbsRow} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbDivider}>•</span>
          <Link to="/catalogue" className={styles.breadcrumbLink} onClick={() => onSelectCategory(undefined)}>
            Catalogue
          </Link>
          {activeCategory && (
            <>
              <span className={styles.breadcrumbDivider}>•</span>
              <span className={styles.breadcrumbCurrent}>{activeCategory.name}</span>
            </>
          )}
        </nav>

        {/* Dynamic Category Title */}
        <h1 className={styles.categoryTitle}>
          {title} <span className={styles.crimsonAccent}>Collection</span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className={styles.categorySubtitle}>{subtitle}</p>

        {/* Quick Category Switcher Carousel */}
        <div className={styles.categoryPillsTrack} role="tablist" aria-label="Product Categories">
          <button
            type="button"
            className={`${styles.categoryPill} ${isAll ? styles.categoryPillActive : ""}`}
            onClick={() => onSelectCategory(undefined)}
            role="tab"
            aria-selected={isAll}
          >
            <span>All Apparel</span>
            <span className={styles.pillBadgeCount}>{totalGarments}</span>
          </button>

          {CURATED_CATEGORIES.map((cat) => {
            const isCatActive = activeCategory?.slug === cat.slug || activeCategory?.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryPill} ${isCatActive ? styles.categoryPillActive : ""}`}
                onClick={() => onSelectCategory(cat.slug)}
                role="tab"
                aria-selected={isCatActive}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Trust Hallmark Pillars */}
        <div className={styles.trustPillarsRow} aria-label="Bagodi Quality Commitments">
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <Award size={18} />
            </div>
            <div className={styles.pillarText}>
              <span className={styles.pillarTitle}>Silk Mark Certified</span>
              <span className={styles.pillarDesc}>100% Genuine Natural Silk</span>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <ShieldCheck size={18} />
            </div>
            <div className={styles.pillarText}>
              <span className={styles.pillarTitle}>Raymond Flagship</span>
              <span className={styles.pillarDesc}>Authorized Suiting Landmark</span>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <Scissors size={18} />
            </div>
            <div className={styles.pillarText}>
              <span className={styles.pillarTitle}>Bespoke Alterations</span>
              <span className={styles.pillarDesc}>Complimentary In-Mall Tailoring</span>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <Truck size={18} />
            </div>
            <div className={styles.pillarText}>
              <span className={styles.pillarTitle}>Insured Delivery</span>
              <span className={styles.pillarDesc}>Safe Dispatch Across India</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

