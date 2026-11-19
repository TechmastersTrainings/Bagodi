import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { Product } from "@bagodi/shared-types";
import { Heart, Eye, Award, Sparkles } from "lucide-react";
import { formatINR } from "@bagodi/utilities";

export interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  isWishlisted = false,
  onQuickView,
}) => {
  const images = product.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const secondaryImage = images.find((img) => !img.isPrimary) || images[1] || primaryImage;

  const firstVariant = product.variants?.[0];
  const sellingPrice = firstVariant ? firstVariant.sellingPrice : product.basePrice;
  const mrp = firstVariant?.mrp;
  const discountPercent =
    mrp && mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const availableColors = Array.from(
    new Set(product.variants?.map((v) => v.colorHex).filter(Boolean) || [])
  ) as string[];

  // Determine hallmark tag
  const isSilkSaree = product.category?.slug === "sarees" || product.name.toLowerCase().includes("saree");
  const isRaymond = product.brand?.name?.toLowerCase().includes("raymond");
  const isBridal = product.category?.slug === "wedding" || product.name.toLowerCase().includes("bridal");

  return (
    <div className={styles.cardRoot}>
      {/* Top Floating Badges */}
      <div className={styles.cardTopBadges}>
        {isSilkSaree && (
          <span className={styles.hallmarkBadge}>
            <Award size={11} />
            Silk Mark Certified
          </span>
        )}
        {isRaymond && (
          <span className={`${styles.hallmarkBadge} ${styles.hallmarkBadgeRed}`}>
            <Sparkles size={11} />
            Raymond Tailored
          </span>
        )}
        {isBridal && (
          <span className={styles.hallmarkBadge}>
            <Sparkles size={11} />
            Royal Atelier Edit
          </span>
        )}
        {discountPercent > 0 && (
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        )}
      </div>

      {/* Floating Wishlist Button */}
      <button
        type="button"
        className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlistActive : ""}`}
        aria-label="Save to Wishlist"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWishlistToggle?.(product.id);
        }}
      >
        <Heart size={16} fill={isWishlisted ? "#E31B23" : "none"} />
      </button>

      {/* Product Image Canvas */}
      <Link to={`/product/${product.slug || product.id}`} className={styles.cardLink}>
        <div className={styles.imageCanvas}>
          {primaryImage?.url && (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              className={`${styles.productImage} ${styles.primaryImg}`}
              loading="lazy"
            />
          )}

          {secondaryImage?.url && secondaryImage.url !== primaryImage?.url && (
            <img
              src={secondaryImage.url}
              alt={secondaryImage.altText || product.name}
              className={`${styles.productImage} ${styles.secondaryImg}`}
              loading="lazy"
            />
          )}

          {/* Size Chips Preview on Canvas */}
          {availableSizes.length > 0 && (
            <div className={styles.sizePreviewBar}>
              {availableSizes.slice(0, 4).map((sz) => (
                <span key={sz} className={styles.sizeChip}>
                  {sz}
                </span>
              ))}
              {availableSizes.length > 4 && (
                <span className={styles.sizeChip}>+{availableSizes.length - 4}</span>
              )}
            </div>
          )}

          {/* Quick View Hover Bar */}
          {onQuickView && (
            <div className={styles.quickViewHoverBar}>
              <button
                type="button"
                className={styles.quickViewBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
              >
                <Eye size={13} />
                <span>Quick View</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className={styles.contentArea}>
          <div className={styles.brandRow}>
            <span className={styles.brandLabel}>
              {product.brand?.name || "BAGODI ROYAL ATELIER"}
            </span>
            {availableColors.length > 0 && (
              <div className={styles.colorDotsRow}>
                {availableColors.slice(0, 3).map((hex, idx) => (
                  <span
                    key={idx}
                    className={styles.colorDot}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <h3 className={styles.productTitle} title={product.name}>
            {product.name}
          </h3>

          <div className={styles.priceRow}>
            <span className={styles.sellingPrice}>{formatINR(sellingPrice)}</span>
            {mrp && mrp > sellingPrice && <span className={styles.mrp}>{formatINR(mrp)}</span>}
            {discountPercent > 0 && (
              <span className={styles.savingsTag}>Save {discountPercent}%</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
