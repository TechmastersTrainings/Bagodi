import React, { useState } from "react";
import styles from "./ProductGallery.module.css";
import { ProductImage } from "@bagodi/shared-types";

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className={styles.galleryRoot}>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnailsList}>
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              className={`${styles.thumbButton} ${selectedIndex === idx ? styles.thumbActive : ""}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View photo ${idx + 1}`}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}

      {/* Main Focus Viewport with subtle zoom */}
      <div className={styles.mainStage}>
        {activeImage?.url ? (
          <img
            src={activeImage.url}
            alt={activeImage.altText || productName}
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.placeholderStage}>BAGODI COUTURE</div>
        )}
      </div>
    </div>
  );
};

