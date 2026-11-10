import React from "react";
import styles from "./FilterSidebar.module.css";
import { Category, Brand } from "@bagodi/shared-types";
import { SlidersHorizontal, Check } from "lucide-react";

export interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  selectedCategoryId?: string;
  selectedBrandId?: string;
  selectedSizes: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onCategorySelect: (id?: string) => void;
  onBrandSelect: (id?: string) => void;
  onSizeToggle: (size: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onInStockToggle: (inStock: boolean) => void;
  onClearAll: () => void;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const TAILORED_SIZES = ["36", "38", "40", "42", "44", "46"];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  selectedCategoryId,
  selectedBrandId,
  selectedSizes,
  minPrice,
  maxPrice,
  inStockOnly,
  onCategorySelect,
  onBrandSelect,
  onSizeToggle,
  onPriceChange,
  onInStockToggle,
  onClearAll,
}) => {
  // Predefined price brackets
  const isBracketActive = (min?: number, max?: number) => minPrice === min && maxPrice === max;

  return (
    <aside className={styles.sidebarRoot} aria-label="Product Refinements">
      {/* Header */}
      <div className={styles.filterHeader}>
        <div className={styles.filterTitleRow}>
          <SlidersHorizontal size={15} className={styles.filterIcon} />
          <span className={styles.filterTitle}>Refine Atelier</span>
        </div>
        <button type="button" className={styles.clearButton} onClick={onClearAll}>
          Reset All
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionHeading}>Category</h3>
        <div className={styles.categoryList}>
          <div
            className={`${styles.categoryItem} ${!selectedCategoryId ? styles.categoryItemActive : ""}`}
            onClick={() => onCategorySelect(undefined)}
          >
            <span>All Masterpieces</span>
          </div>
          {categories.map((cat) => {
            const isCatActive = selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
            return (
              <div
                key={cat.id}
                className={`${styles.categoryItem} ${isCatActive ? styles.categoryItemActive : ""}`}
                onClick={() => onCategorySelect(cat.slug || cat.id)}
              >
                <span>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Official Brand Partners */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionHeading}>Official Brands</h3>
        <div className={styles.brandsGrid}>
          {brands.map((brand) => {
            const isBrandActive = selectedBrandId === brand.id || selectedBrandId === brand.slug;
            return (
              <div
                key={brand.id}
                className={`${styles.brandCheckItem} ${isBrandActive ? styles.brandCheckItemActive : ""}`}
                onClick={() => onBrandSelect(isBrandActive ? undefined : brand.id)}
              >
                <span>{brand.name}</span>
                {isBrandActive && <Check size={14} color="#E31B23" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Price Bracket Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionHeading}>Price Range (INR)</h3>
        <div className={styles.priceBracketsTrack}>
          <button
            type="button"
            className={`${styles.priceBracketPill} ${isBracketActive(undefined, 10000) ? styles.priceBracketPillActive : ""}`}
            onClick={() =>
              isBracketActive(undefined, 10000) ? onPriceChange(undefined, undefined) : onPriceChange(undefined, 10000)
            }
          >
            <span>Under ₹10,000</span>
          </button>
          <button
            type="button"
            className={`${styles.priceBracketPill} ${isBracketActive(10000, 20000) ? styles.priceBracketPillActive : ""}`}
            onClick={() =>
              isBracketActive(10000, 20000) ? onPriceChange(undefined, undefined) : onPriceChange(10000, 20000)
            }
          >
            <span>₹10,000 – ₹20,000</span>
          </button>
          <button
            type="button"
            className={`${styles.priceBracketPill} ${isBracketActive(20000, 35000) ? styles.priceBracketPillActive : ""}`}
            onClick={() =>
              isBracketActive(20000, 35000) ? onPriceChange(undefined, undefined) : onPriceChange(20000, 35000)
            }
          >
            <span>₹20,000 – ₹35,000</span>
          </button>
          <button
            type="button"
            className={`${styles.priceBracketPill} ${isBracketActive(35000, undefined) ? styles.priceBracketPillActive : ""}`}
            onClick={() =>
              isBracketActive(35000, undefined) ? onPriceChange(undefined, undefined) : onPriceChange(35000, undefined)
            }
          >
            <span>Royal Couture (₹35,000+)</span>
          </button>
        </div>

        {/* Custom Min - Max inputs */}
        <div className={styles.priceInputsRow}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice !== undefined ? minPrice : ""}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : undefined, maxPrice)}
            className={styles.priceInputBox}
          />
          <span className={styles.priceSeparator}>to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice !== undefined ? maxPrice : ""}
            onChange={(e) => onPriceChange(minPrice, e.target.value ? Number(e.target.value) : undefined)}
            className={styles.priceInputBox}
          />
        </div>
      </div>

      {/* 4. Garment Sizes */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionHeading}>Garment Size</h3>

        <div className={styles.sizeGroupLabel}>Apparel & Dresses</div>
        <div className={styles.sizesGrid}>
          {APPAREL_SIZES.map((size) => {
            const isActive = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                className={`${styles.sizeChipBtn} ${isActive ? styles.sizeChipBtnActive : ""}`}
                onClick={() => onSizeToggle(size)}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div className={styles.sizeGroupLabel}>Tailored Suiting & Men's</div>
        <div className={styles.sizesGrid}>
          {TAILORED_SIZES.map((size) => {
            const isActive = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                className={`${styles.sizeChipBtn} ${isActive ? styles.sizeChipBtnActive : ""}`}
                onClick={() => onSizeToggle(size)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. In-Stock Switch */}
      <div className={styles.filterSection}>
        <div className={styles.stockRow} onClick={() => onInStockToggle(!inStockOnly)}>
          <span className={styles.stockLabel}>In-Stock / Ready to Ship</span>
          <button
            type="button"
            className={`${styles.iosToggle} ${inStockOnly ? styles.iosToggleChecked : ""}`}
            role="switch"
            aria-checked={inStockOnly}
          >
            <div className={styles.iosThumb} />
          </button>
        </div>
      </div>
    </aside>
  );
};
