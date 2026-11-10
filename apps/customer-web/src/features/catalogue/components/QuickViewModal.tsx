import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./QuickViewModal.module.css";
import { Product } from "@bagodi/shared-types";
import { formatINR } from "@bagodi/utilities";
import { X, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToBag: (product: Product, size: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToBag,
}) => {
  const images = product.images || [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Free Size");

  // Price calculation
  const firstVariant = product.variants?.[0];
  const sellingPrice = firstVariant ? firstVariant.sellingPrice : product.basePrice;
  const mrp = firstVariant?.mrp;
  const discountPercent =
    mrp && mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialogue"
        >
          <X size={18} />
        </button>

        <div className={styles.modalContentGrid}>
          {/* Left: Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
              <img
                src={activeImage?.url}
                alt={activeImage?.altText || product.name}
                className={styles.mainImage}
              />
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnailsRow}>
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    className={`${styles.thumbnailBtn} ${
                      idx === activeImageIndex ? styles.thumbnailBtnActive : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View photo angle ${idx + 1}`}
                  >
                    <img src={img.url} alt="" className={styles.thumbnailImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Garment Atelier Overview */}
          <div className={styles.infoSection}>
            <div>
              <div className={styles.brandBadgeRow}>
                <span className={styles.brandTag}>
                  {product.brand?.name || "BAGODI ROYAL ATELIER"}
                </span>
                <span className={styles.authenticityPill}>
                  <ShieldCheck size={12} />
                  100% Authentic
                </span>
              </div>

              <h2 className={styles.garmentTitle}>{product.name}</h2>

              <div className={styles.priceContainer}>
                <span className={styles.sellingPrice}>{formatINR(sellingPrice)}</span>
                {mrp && mrp > sellingPrice && <span className={styles.mrp}>{formatINR(mrp)}</span>}
                {discountPercent > 0 && (
                  <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                )}
              </div>

              <p className={styles.descriptionText}>{product.description}</p>

              {product.fabricDetails && (
                <div className={styles.fabricBox}>
                  <div className={styles.fabricTitle}>Craftsmanship & Material</div>
                  <div className={styles.fabricContent}>{product.fabricDetails}</div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className={styles.sizeSelectionArea}>
                  <div className={styles.sizeLabelRow}>
                    <span>Select Garment Size</span>
                    <span style={{ color: "#E31B23", cursor: "pointer", fontWeight: 600 }}>
                      Bidar In-Mall Fit Guide
                    </span>
                  </div>
                  <div className={styles.sizesTrack}>
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`${styles.sizePillBtn} ${
                          selectedSize === sz ? styles.sizePillBtnActive : ""
                        }`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className={styles.modalActionsRow}>
              <button
                type="button"
                className={styles.addToBagBtn}
                onClick={() => {
                  onAddToBag(product, selectedSize);
                  onClose();
                }}
              >
                <ShoppingBag size={16} />
                <span>Add to Shopping Bag</span>
              </button>

              <Link
                to={`/product/${product.slug || product.id}`}
                className={styles.viewDetailsLink}
                onClick={onClose}
              >
                <span>Full Atelier Story</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

