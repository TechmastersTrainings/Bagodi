import React, { useState, useRef } from "react";
import { ProductImage } from "@bagodi/shared-types";
import { Camera, Upload, Trash2, Star, Link as LinkIcon, Sparkles } from "lucide-react";
import styles from "./ProductPhotoManager.module.css";

export interface ProductPhotoManagerProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxPhotos?: number;
}

interface SlotMeta {
  slotNumber: number;
  label: string;
  sublabel: string;
}

const SLOT_CONFIG: SlotMeta[] = [
  { slotNumber: 1, label: "Slot 1: Cover Photo", sublabel: "Primary catalog hero" },
  { slotNumber: 2, label: "Slot 2: Fabric Detail", sublabel: "Zari, weave & texture" },
  { slotNumber: 3, label: "Slot 3: Silhouette", sublabel: "Full drape & back view" },
  { slotNumber: 4, label: "Slot 4: Styling", sublabel: "Occasion & lifestyle" },
];

const LUXURY_PRESETS = [
  {
    name: "Crimson Kanjeevaram",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Rose Gold Lehenga",
    url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Raymond Fine Suit",
    url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Powder Blue Silk",
    url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
  },
];

export const ProductPhotoManager: React.FC<ProductPhotoManagerProps> = ({
  images = [],
  onChange,
  maxPhotos = 4,
}) => {
  const [urlInputSlot, setUrlInputSlot] = useState<number | null>(null);
  const [enteredUrl, setEnteredUrl] = useState<string>("");
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileUpload = (slotNumber: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      assignImageToSlot(slotNumber, result, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const assignImageToSlot = (slotNumber: number, url: string, altText?: string) => {
    const currentList = [...images];
    const existingIndex = currentList.findIndex((img) => img.displayOrder === slotNumber);

    const newImage: ProductImage = {
      id: "img-" + Date.now() + "-" + slotNumber,
      url,
      altText: altText || `Garment view ${slotNumber}`,
      isPrimary: slotNumber === 1,
      displayOrder: slotNumber,
    };

    if (existingIndex >= 0) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        url,
        altText: altText || currentList[existingIndex].altText,
      };
    } else {
      currentList.push(newImage);
    }

    // Ensure slot 1 is marked primary
    const normalized = currentList.map((img) => ({
      ...img,
      isPrimary: img.displayOrder === 1,
    }));

    onChange(normalized.sort((a, b) => a.displayOrder - b.displayOrder));
    setUrlInputSlot(null);
    setEnteredUrl("");
  };

  const handleRemoveSlot = (slotNumber: number) => {
    const filtered = images.filter((img) => img.displayOrder !== slotNumber);
    onChange(filtered);
  };

  const handleMakePrimary = (slotNumber: number) => {
    const imgAtSlot = images.find((img) => img.displayOrder === slotNumber);
    const imgAt1 = images.find((img) => img.displayOrder === 1);

    if (!imgAtSlot) return;

    const updated = images.map((img) => {
      if (img.displayOrder === slotNumber) {
        return { ...img, displayOrder: 1, isPrimary: true };
      }
      if (img.displayOrder === 1 && imgAt1) {
        return { ...img, displayOrder: slotNumber, isPrimary: false };
      }
      return img;
    });

    onChange(updated.sort((a, b) => a.displayOrder - b.displayOrder));
  };

  const handleAltTextChange = (slotNumber: number, altText: string) => {
    const updated = images.map((img) =>
      img.displayOrder === slotNumber ? { ...img, altText } : img
    );
    onChange(updated);
  };

  const activeCount = images.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>Garment Photography (1 - 4 Photos)</span>
          <span className={styles.subtitle}>
            Upload high-resolution photography. Slot 1 is the primary cover photo for storefront cards.
          </span>
        </div>
        <div className={styles.countBadge}>
          {activeCount} of {maxPhotos} Photos Added
        </div>
      </div>

      <div className={styles.slotsGrid}>
        {SLOT_CONFIG.slice(0, maxPhotos).map((slot) => {
          const slotImg = images.find((img) => img.displayOrder === slot.slotNumber);
          const isSlotFilled = Boolean(slotImg);
          const isPrimary = slot.slotNumber === 1 || slotImg?.isPrimary;
          const isUrlActive = urlInputSlot === slot.slotNumber;

          return (
            <div
              key={slot.slotNumber}
              className={`${styles.slotCard} ${isSlotFilled ? styles.slotCardFilled : ""} ${
                isPrimary && isSlotFilled ? styles.slotCardPrimary : ""
              }`}
            >
              <div className={styles.slotHeader}>
                <span className={styles.slotLabel}>{slot.label}</span>
                {isPrimary && <span className={styles.primaryPill}>Cover</span>}
              </div>

              {isUrlActive ? (
                <div className={styles.urlInputRow}>
                  <input
                    type="url"
                    className={styles.urlInputField}
                    placeholder="https://.../photo.jpg"
                    value={enteredUrl}
                    onChange={(e) => setEnteredUrl(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.urlActionRow}>
                    <button
                      type="button"
                      className={styles.urlCancelBtn}
                      onClick={() => {
                        setUrlInputSlot(null);
                        setEnteredUrl("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.urlConfirmBtn}
                      onClick={() => {
                        if (enteredUrl.trim()) {
                          assignImageToSlot(slot.slotNumber, enteredUrl.trim());
                        }
                      }}
                    >
                      Use URL
                    </button>
                  </div>
                </div>
              ) : isSlotFilled && slotImg ? (
                <>
                  <div className={styles.previewArea}>
                    <img
                      src={slotImg.url}
                      alt={slotImg.altText || slot.label}
                      className={styles.previewImg}
                    />
                    <div className={styles.overlayActions}>
                      {!isPrimary && (
                        <button
                          type="button"
                          className={`${styles.overlayBtn} ${styles.coverBtn}`}
                          onClick={() => handleMakePrimary(slot.slotNumber)}
                        >
                          <Star size={11} /> Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.overlayBtn} ${styles.replaceBtn}`}
                        onClick={() => fileInputRefs.current[slot.slotNumber]?.click()}
                      >
                        <Upload size={11} /> Replace
                      </button>
                      <button
                        type="button"
                        className={`${styles.overlayBtn} ${styles.removeBtn}`}
                        onClick={() => handleRemoveSlot(slot.slotNumber)}
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <input
                      type="text"
                      className={styles.captionInput}
                      placeholder="Caption / Alt text (optional)"
                      value={slotImg.altText || ""}
                      onChange={(e) => handleAltTextChange(slot.slotNumber, e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div
                  className={styles.emptyArea}
                  onClick={() => fileInputRefs.current[slot.slotNumber]?.click()}
                >
                  <div className={styles.uploadIconWrap}>
                    {slot.slotNumber === 1 ? <Star size={18} /> : <Camera size={18} />}
                  </div>
                  <div className={styles.emptyPrompt}>Add Photo {slot.slotNumber}</div>
                  <div className={styles.emptyHint}>{slot.sublabel}</div>
                  <button
                    type="button"
                    className={styles.urlToggleBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUrlInputSlot(slot.slotNumber);
                    }}
                  >
                    <LinkIcon size={10} style={{ display: "inline", marginRight: 3 }} />
                    Paste URL
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputRefs.current[slot.slotNumber] = el;
                }}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(slot.slotNumber, e)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.presetBar}>
        <span className={styles.presetLabel}>
          <Sparkles size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
          Sample Luxury Presets:
        </span>
        {LUXURY_PRESETS.map((preset, idx) => (
          <button
            key={preset.name}
            type="button"
            className={styles.presetPill}
            onClick={() => {
              const targetSlot = (idx % maxPhotos) + 1;
              assignImageToSlot(targetSlot, preset.url, preset.name);
            }}
          >
            + Slot {idx + 1}: {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

