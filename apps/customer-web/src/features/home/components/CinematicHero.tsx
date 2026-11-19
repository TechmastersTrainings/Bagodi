import React from "react";
import { Link } from "react-router-dom";
import styles from "./CinematicHero.module.css";
import { ArrowRight } from "lucide-react";

interface FashionModel {
  id: string;
  categoryName: string;
  link: string;
  imageUrl: string;
  alt: string;
}

const RUNWAY_MODELS: FashionModel[] = [
  {
    id: "silk-sarees",
    categoryName: "Silk Sarees",
    link: "/catalogue?category=sarees",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
    alt: "Bagodi Handwoven Silk Saree Collection",
  },
  {
    id: "raymond-suiting",
    categoryName: "Raymond Suiting",
    link: "/catalogue?category=men-suiting",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=85",
    alt: "Raymond Tailored Suiting & Menswear",
  },
  {
    id: "bridal-couture",
    categoryName: "Bridal Lehengas",
    link: "/catalogue?category=wedding",
    imageUrl:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
    alt: "Bagodi Royal Bridal Lehenga Atelier",
  },
  {
    id: "women-western",
    categoryName: "Modern Western",
    link: "/catalogue?category=western",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85",
    alt: "Contemporary Chic Women's Collection",
  },
  {
    id: "men-sherwani",
    categoryName: "Groom Sherwanis",
    link: "/catalogue?category=wedding",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
    alt: "Heritage Festive Sherwani for Men",
  },
  {
    id: "smart-casuals",
    categoryName: "Smart Casuals",
    link: "/catalogue?category=western",
    imageUrl:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85",
    alt: "Urban Smart Casual Apparel",
  },
  {
    id: "festive-ethnic",
    categoryName: "Festive Ethnic",
    link: "/catalogue?category=sarees",
    imageUrl:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85",
    alt: "Festive Kurta & Anarkali Ensembles",
  },
];

const BRAND_PARTNERS = [
  "RAYMOND",
  "PARK AVENUE",
  "COLORPLUS",
  "SILK MARK INDIA",
  "MANYAVAR",
  "BIBA",
  "AURELIA",
  "ALLEN SOLLY",
  "LOUIS PHILIPPE",
  "VAN HEUSEN",
  "ARROW",
  "BLACKBERRYS",
  "PETER ENGLAND",
];

const BRAND_LETTERS = ["B", "A", "G", "O", "D", "I"];
const WELCOMES_LETTERS = ["W", "E", "L", "C", "O", "M", "E", "S"];
const YOU_LETTERS = ["Y", "O", "U"];

export const CinematicHero: React.FC = () => {
  return (
    <>
      {/* ================================================================
          CARD 1: THE GRAND HERO EDITORIAL DECK (INITIAL VIEWPORT)
          Zero clothes cards visible here — pure, grand editorial presence
          ================================================================ */}
      <section className={styles.heroRoot} id="hero-pavilion" aria-label="Bagodi Hero Pavilion">
        {/* Editorial Haute-Couture Lifestyle Background */}
        <div className={styles.heroBackgroundAtmosphere} aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt=""
            className={styles.heroBackgroundImage}
            loading="eager"
          />
          <div className={styles.heroBackgroundMask} />
        </div>

        {/* Editorial Text Area */}
        <div className={styles.editorialHeader}>
          {/* Subtle Ambient Radial Glow */}
          <div className={styles.sectionGlow} aria-hidden="true" />

          {/* Main Headline — 100% Solid Obsidian Black with Red Accent */}
          <h1 className={styles.mainHeadline}>
            <span className={styles.headlineLineWrapper}>
              <span className={`${styles.headlineLine} ${styles.lineDelay1}`}>
                Family Fashion, One Destination
              </span>
            </span>
            <span className={styles.headlineLineWrapper}>
              <span className={`${styles.headlineLine} ${styles.lineDelay2}`}>
                Where Heritage Meets <span className={styles.redGradientText}>Modern Couture!</span>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <div className={styles.subHeadlineWrapper}>
            <p className={styles.subHeadline}>
              Discover Bidar's premier fashion landmark — curated with Silk Mark certified sarees,
              Raymond master suiting, royal bridal couture, and complete family attire.
            </p>
          </div>

          {/* CTA Button */}
          <div className={styles.ctaWrapper}>
            <Link to="/catalogue" className={styles.ctaButton}>
              <span>Explore Bagodi Collections</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stately Animated "B A G O D I • W E L C O M E S • Y O U" Arch with Book Writing Animation */}
          <div className={styles.heroWelcomeArch} aria-hidden="true">
            {/* Word 1: BAGODI */}
            <div className={styles.archGroup}>
              {BRAND_LETTERS.map((char, idx) => (
                <span
                  key={`b-${char}-${idx}`}
                  className={`${styles.watermarkLetter} ${styles.primaryBrandLetter}`}
                  style={{ '--char-i': idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>

            <span
              className={styles.archDot}
              style={{ '--char-i': 6 } as React.CSSProperties}
            />

            {/* Word 2: WELCOMES */}
            <div className={styles.archGroup}>
              {WELCOMES_LETTERS.map((char, idx) => (
                <span
                  key={`w-${char}-${idx}`}
                  className={styles.watermarkLetter}
                  style={{ '--char-i': 7 + idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>

            <span
              className={styles.archDot}
              style={{ '--char-i': 15 } as React.CSSProperties}
            />

            {/* Word 3: YOU */}
            <div className={styles.archGroup}>
              {YOU_LETTERS.map((char, idx) => (
                <span
                  key={`y-${char}-${idx}`}
                  className={styles.watermarkLetter}
                  style={{ '--char-i': 16 + idx } as React.CSSProperties}
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
        </div>

        {/* Tactile Switch Scroll Fold Prompt */}
        <a href="#runway-deck" className={styles.scrollFoldIndicator}>
          <span>Scroll To Reveal Collections</span>
          <div className={styles.scrollSwitchPill}>
            <div className={styles.scrollSwitchDot} />
          </div>
        </a>
      </section>

      {/* ================================================================
          CARD 2: RUNWAY SHOWCASE DECK (MOVED DOWN)
          Folds & slides smoothly over Card 1 on scroll
          ================================================================ */}
      <section className={styles.runwayDeckSection} id="runway-deck" aria-label="Curated Runway Collections">
        {/* Runway Section Header */}
        <div className={styles.runwaySectionHeader}>
          <div className={styles.runwaySuperTitle}>EXCLUSIVE RUNWAY ATELIER</div>
          <h2 className={styles.runwayTitle}>Curated Fashion Collections</h2>
          <p className={styles.runwaySubtitle}>
            Immerse yourself in authentic silk sarees, Raymond suiting, bridal couture, and modern coordinates.
          </p>
        </div>

        {/* 7-Model Panoramic Runway Lineup */}
        <div className={styles.modelLineupWrapper}>
          {RUNWAY_MODELS.map((model) => (
            <Link
              key={model.id}
              to={model.link}
              className={styles.modelCard}
              aria-label={`Explore ${model.categoryName}`}
            >
              <div className={styles.modelImageContainer}>
                <img
                  src={model.imageUrl}
                  alt={model.alt}
                  className={styles.modelImage}
                  loading="eager"
                />
                <span className={styles.modelCategoryBadge}>{model.categoryName}</span>
              </div>
              <div className={styles.modelGroundShadow} />
              <span className={styles.modelCardTitle}>{model.categoryName}</span>
            </Link>
          ))}
        </div>

        {/* Sleek Full-Width Black Brand Marquee Bar */}
        <div className={styles.brandMarqueeBar} aria-label="Featured Brands Directory">
          <div className={styles.marqueeTrack}>
            {/* First loop of brands */}
            <div className={styles.marqueeGroup}>
              {BRAND_PARTNERS.map((brand, idx) => (
                <React.Fragment key={`brand-1-${idx}`}>
                  <span className={styles.brandLogoItem}>{brand}</span>
                  <span className={styles.brandDotSeparator} />
                </React.Fragment>
              ))}
            </div>
            {/* Second identical loop for smooth infinite continuous scrolling */}
            <div className={styles.marqueeGroup}>
              {BRAND_PARTNERS.map((brand, idx) => (
                <React.Fragment key={`brand-2-${idx}`}>
                  <span className={styles.brandLogoItem}>{brand}</span>
                  <span className={styles.brandDotSeparator} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
