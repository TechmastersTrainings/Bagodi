import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./ProductDetailPage.module.css";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, ProductVariant } from "@bagodi/shared-types";
import { ProductGallery } from "./components/ProductGallery";
import { SizeChartModal } from "./components/SizeChartModal";
import { CURATED_GARMENTS } from "../catalogue/data/curatedCatalogueData";
import {
  Button,
  SkeletonCard,
  EmptyState,
  ApiErrorCard,
} from "@bagodi/shared-components";
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  RotateCcw,
  Truck,
  Ruler,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatINR } from "@bagodi/utilities";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState<boolean>(false);

  // 1. Fetch Authoritative Product & Variant Data
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useQuery<Product>({
    queryKey: ["product-detail", id],
    queryFn: () => defaultApiClient.get<Product>(`/products/${id}`),
    enabled: !!id,
    retry: 1,
  });

  // Resolve authoritative product with curated fallback
  const product = useMemo(() => {
    const fromCurated = CURATED_GARMENTS.find((p) => p.slug === id || p.id === id);
    if (fromCurated) return fromCurated;
    if (productData && productData.name && productData.variants && productData.variants.length > 0) {
      return productData;
    }
    return productData;
  }, [productData, id]);

  // Extract unique sizes and colors from product variants
  const variants = product?.variants || [];
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(variants.map((v) => JSON.stringify({ name: v.colorName, hex: v.colorHex })))
  ).map((str) => JSON.parse(str) as { name: string; hex?: string });

  // Initialize selected size and color once product loads
  useEffect(() => {
    if (variants.length > 0) {
      const initialVariant = variants.find((v) => v.availableStock > 0) || variants[0];
      setSelectedSize(initialVariant.size);
      setSelectedColor(initialVariant.colorName);
    }
  }, [product]);

  // Resolve active variant based on selected size and color
  const activeVariant: ProductVariant | undefined = variants.find(
    (v) => v.size === selectedSize && (v.colorName === selectedColor || uniqueColors.length <= 1)
  ) || variants[0];

  // 2. Add to Cart Mutation (Real Backend Endpoint)
  const addToCartMutation = useMutation({
    mutationFn: (payload: { variantId: string; quantity: number }) =>
      defaultApiClient.post("/cart/items", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
      setCartSuccessNotice(true);
      setTimeout(() => setCartSuccessNotice(false), 4000);
    },
  });

  if (isLoading) {
    return (
      <div className={styles.pdpGrid}>
        <SkeletonCard height="560px" />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <SkeletonCard height="40px" />
          <SkeletonCard height="80px" />
          <SkeletonCard height="160px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorCard
        title="Could not load garment details"
        message="Failed to retrieve product information from the backend service."
        onRetry={() => refetch()}
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Garment Not Found"
        description="The requested garment is not available or has been discontinued."
        action={
          <Link to="/catalogue">
            <Button size="sm">Browse Full Catalogue</Button>
          </Link>
        }
      />
    );
  }

  const sellingPrice = activeVariant ? activeVariant.sellingPrice : product.basePrice;
  const mrp = activeVariant?.mrp;
  const discountPercent = mrp && mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const isOutOfStock = !activeVariant || activeVariant.availableStock <= 0;
  const isLowStock = activeVariant && activeVariant.availableStock > 0 && activeVariant.availableStock <= 3;

  return (
    <div className={styles.pdpContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/catalogue?categoryId=${product.category?.id}`}>{product.category?.name || "Apparel"}</Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
      </nav>

      <div className={styles.pdpGrid}>
        {/* Left: Multi-Angle Image Gallery */}
        <ProductGallery images={product.images || []} productName={product.name} />

        {/* Right: Product Details & Variant Resolution */}
        <div className={styles.detailsArea}>
          <div className={styles.brandHeader}>
            <div className={styles.brandBadgeRow}>
              <span className={styles.brandName}>{product.brand?.name || "Bagodi Collection"}</span>
              <span className={styles.authenticityTag}>100% Authentic Handloom</span>
            </div>
            <h1 className={styles.productTitle}>{product.name}</h1>
          </div>

          {/* Pricing Block */}
          <div className={styles.priceBlock}>
            <span className={styles.sellingPrice}>{formatINR(sellingPrice)}</span>
            {mrp && mrp > sellingPrice && <span className={styles.mrp}>{formatINR(mrp)}</span>}
            {discountPercent > 0 && <span className={styles.discountPill}>{discountPercent}% OFF</span>}
          </div>
          <span className={styles.taxNotice}>Inclusive of all applicable GST taxes.</span>

          {/* Color Selection (if multiple colors exist) */}
          {uniqueColors.length > 1 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeaderRow}>
                <span className={styles.sectionLabel}>
                  Color: <strong>{selectedColor}</strong>
                </span>
              </div>
              <div className={styles.colorSwatches}>
                {uniqueColors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    className={`${styles.colorSwatchBtn} ${selectedColor === c.name ? styles.colorSwatchBtnActive : ""}`}
                    style={{ backgroundColor: c.hex || "var(--bg-tertiary)" }}
                    onClick={() => setSelectedColor(c.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionLabel}>Select Size</span>
              <button
                type="button"
                className={styles.sizeChartTrigger}
                onClick={() => setIsSizeChartOpen(true)}
              >
                <Ruler size={14} /> Size Chart
              </button>
            </div>

            <div className={styles.sizeGrid}>
              {uniqueSizes.map((sz) => {
                const variantForSize = variants.find(
                  (v) => v.size === sz && (v.colorName === selectedColor || uniqueColors.length <= 1)
                );
                const hasStock = variantForSize && variantForSize.availableStock > 0;
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={!hasStock}
                    className={[
                      styles.sizeButton,
                      isSelected ? styles.sizeButtonActive : "",
                      !hasStock ? styles.sizeButtonDisabled : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => setSelectedSize(sz)}
                  >
                    <span>{sz}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Stock Availability Alert */}
            {isOutOfStock ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
                <AlertTriangle size={14} /> Out of stock in this size. Please select another variant.
              </div>
            ) : isLowStock ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--status-warning)" }}>
                <AlertTriangle size={14} /> Hurry! Only {activeVariant.availableStock} piece(s) left in stock.
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--status-success)" }}>
                <Check size={14} /> Ready for immediate dispatch from Bidar Flagship Store.
              </div>
            )}
          </div>

          {/* SKU & Barcode Metadata */}
          {activeVariant && (
            <div className={styles.skuDetails}>
              <span>SKU: {activeVariant.sku}</span>
              <span>•</span>
              <span>Barcode: {activeVariant.barcode}</span>
            </div>
          )}

          {/* Add to Bag & Wishlist Actions */}
          <div className={styles.actionsContainer}>
            <button
              type="button"
              className={styles.addToBagActionBtn}
              disabled={isOutOfStock || !activeVariant}
              onClick={() => {
                if (activeVariant) {
                  addToCartMutation.mutate({ variantId: activeVariant.id, quantity: 1 });
                }
              }}
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? "Sold Out in This Size" : "Add to Boutique Bag"}</span>
            </button>

            <button
              type="button"
              className={styles.wishlistBtn}
              aria-label="Save to Wishlist"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                size={20}
                fill={isWishlisted ? "#E31B23" : "none"}
                color={isWishlisted ? "#E31B23" : "#111111"}
              />
            </button>
          </div>

          {cartSuccessNotice && (
            <div style={{ padding: "var(--space-3)", background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)", borderRadius: "var(--radius-md)", color: "var(--status-success)", fontSize: "var(--text-xs)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Item added to your bag!</span>
              <Link to="/cart" style={{ textDecoration: "underline", fontWeight: "bold" }}>
                View Bag & Checkout
              </Link>
            </div>
          )}

          {/* Guarantees & Assurances */}
          <div className={styles.assuranceList}>
            <div className={styles.assuranceItem}>
              <Truck size={18} style={{ color: "var(--accent-primary)" }} />
              <span>Standard delivery available across Karnataka and pan-India.</span>
            </div>
            <div className={styles.assuranceItem}>
              <RotateCcw size={18} style={{ color: "var(--accent-primary)" }} />
              <span>
                {product.returnEligible
                  ? `${product.returnWindowDays || 7}-Day Hassle-Free Returns & Size Exchanges`
                  : "Final Sale: Not eligible for return."}
              </span>
            </div>
            <div className={styles.assuranceItem}>
              <ShieldCheck size={18} style={{ color: "var(--accent-primary)" }} />
              <span>100% Authentic Handpicked Fabric • Inspected by TechMasters / Bagodi</span>
            </div>
          </div>

          {/* Garment Details & Description */}
          <div className={styles.accordionSection}>
            <h3 className={styles.accordionTitle}>Garment Details & Heritage Craft</h3>
            <p className={styles.descriptionText}>{product.description}</p>
            {product.fabricDetails && (
              <p className={styles.descriptionText}>
                <strong>Fabric & Weave:</strong> {product.fabricDetails}
              </p>
            )}
            {product.careInstructions && (
              <p className={styles.descriptionText}>
                <strong>Care Instructions:</strong> {product.careInstructions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        sizeChart={product.sizeChart}
      />
    </div>
  );
};
