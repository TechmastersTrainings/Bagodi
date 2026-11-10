import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styles from "./CataloguePage.module.css";
import { defaultApiClient } from "@bagodi/api-client";
import {
  Product,
  Category,
  Brand,
  PaginatedResponse,
} from "@bagodi/shared-types";
import { FilterSidebar } from "./components/FilterSidebar";
import { ProductCard } from "./components/ProductCard";
import { QuickViewModal } from "./components/QuickViewModal";
import {
  CURATED_GARMENTS,
  CURATED_CATEGORIES,
  CURATED_BRANDS,
  getCategoryBySlug,
} from "./data/curatedCatalogueData";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Grid3X3,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@bagodi/utilities";

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters (supporting both category slug and categoryId)
  const categoryParam = searchParams.get("category") || searchParams.get("categoryId") || undefined;
  const brandId = searchParams.get("brandId") || undefined;
  const sizesParam = searchParams.get("sizes") || "";
  const selectedSizes = useMemo(() => (sizesParam ? sizesParam.split(",") : []), [sizesParam]);
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const sortBy = (searchParams.get("sortBy") as "newest" | "price_asc" | "price_desc" | "popular") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const initialSearch = searchParams.get("search") || "";

  // UI States
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [gridCols, setGridCols] = useState<"four" | "three">("four");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      const nextParams = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        nextParams.set("search", debouncedSearch);
      } else {
        nextParams.delete("search");
      }
      nextParams.set("page", "1");
      setSearchParams(nextParams);
    }
  }, [debouncedSearch]);

  // Query Categories from API with fallback
  const { data: serverCategories = [] } = useQuery<Category[]>({
    queryKey: ["catalogue-categories"],
    queryFn: () => defaultApiClient.get<Category[]>("/categories"),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const categories = serverCategories.length > 0 ? serverCategories : CURATED_CATEGORIES;

  // Query Brands from API with fallback
  const { data: serverBrands = [] } = useQuery<Brand[]>({
    queryKey: ["catalogue-brands"],
    queryFn: () => defaultApiClient.get<Brand[]>("/brands"),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const brands = serverBrands.length > 0 ? serverBrands : CURATED_BRANDS;

  // Active Category resolution
  const activeCategory = useMemo(() => {
    if (!categoryParam) return undefined;
    return getCategoryBySlug(categoryParam) || categories.find((c) => c.id === categoryParam || c.slug === categoryParam);
  }, [categoryParam, categories]);

  // Query Server Products
  const {
    data: serverProductData,
    isError: isServerError,
  } = useQuery<PaginatedResponse<Product>>({
    queryKey: [
      "catalogue-products",
      categoryParam,
      brandId,
      sizesParam,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<Product>>("/products", {
        params: {
          categoryId: activeCategory?.id || categoryParam,
          brandId,
          sizes: sizesParam ? sizesParam : undefined,
          minPrice,
          maxPrice,
          inStockOnly: inStockOnly ? true : undefined,
          sortBy,
          search: debouncedSearch || undefined,
          page,
          pageSize: 16,
        },
      }),
    retry: false,
  });

  // Client-Side Curated Fallback Filtering Engine (Active when backend is offline/empty)
  const filteredCuratedProducts = useMemo(() => {
    let result = [...CURATED_GARMENTS];

    // Filter by Category
    if (activeCategory) {
      result = result.filter(
        (p) =>
          p.category.slug === activeCategory.slug ||
          p.category.id === activeCategory.id ||
          (activeCategory.slug === "offers" && p.variants.some((v) => (v.discountPercentage || 0) >= 15))
      );
    }

    // Filter by Brand
    if (brandId) {
      result = result.filter((p) => p.brand.id === brandId || p.brand.slug === brandId);
    }

    // Filter by Selected Sizes
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size) || selectedSizes.includes("Free Size"))
      );
    }

    // Filter by Price
    if (minPrice !== undefined) {
      result = result.filter((p) => {
        const price = p.variants?.[0]?.sellingPrice ?? p.basePrice;
        return price >= minPrice;
      });
    }
    if (maxPrice !== undefined) {
      result = result.filter((p) => {
        const price = p.variants?.[0]?.sellingPrice ?? p.basePrice;
        return price <= maxPrice;
      });
    }

    // Filter by Stock
    if (inStockOnly) {
      result = result.filter((p) => p.variants.some((v) => v.availableStock > 0));
    }

    // Filter by Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q) ||
          (p.fabricDetails && p.fabricDetails.toLowerCase().includes(q))
      );
    }

    // Sort Products
    if (sortBy === "price_asc") {
      result.sort((a, b) => {
        const priceA = a.variants?.[0]?.sellingPrice ?? a.basePrice;
        const priceB = b.variants?.[0]?.sellingPrice ?? b.basePrice;
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => {
        const priceA = a.variants?.[0]?.sellingPrice ?? a.basePrice;
        const priceB = b.variants?.[0]?.sellingPrice ?? b.basePrice;
        return priceB - priceA;
      });
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else {
      // Default: Newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [activeCategory, brandId, selectedSizes, minPrice, maxPrice, inStockOnly, debouncedSearch, sortBy]);

  // Choose server data if available and non-empty, otherwise use curated dataset
  const usingCurated = isServerError || !serverProductData || serverProductData.items.length === 0;
  const products: Product[] = usingCurated ? filteredCuratedProducts : serverProductData.items;
  const totalCount = usingCurated ? filteredCuratedProducts.length : serverProductData.total;
  const totalPages = usingCurated ? Math.ceil(filteredCuratedProducts.length / 16) : serverProductData.totalPages;

  // Helper to update searchParams
  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== "") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleCategorySelect = (slug?: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set("category", slug);
      next.delete("categoryId");
    } else {
      next.delete("category");
      next.delete("categoryId");
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSizeToggle = (size: string) => {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    updateParam("sizes", nextSizes.length > 0 ? nextSizes.join(",") : undefined);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    const next = new URLSearchParams(searchParams);
    if (min !== undefined) next.set("minPrice", String(min));
    else next.delete("minPrice");

    if (max !== undefined) next.set("maxPrice", String(max));
    else next.delete("maxPrice");

    next.set("page", "1");
    setSearchParams(next);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
  };

  const handleWishlistToggle = (id: string) => {
    setWishlistedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleAddToBag = (product: Product, size: string) => {
    console.log("Added to shopping bag:", product.name, "Size:", size);
  };

  // Active filters calculation
  const activeBrandName = brands.find((b) => b.id === brandId || b.slug === brandId)?.name;
  const hasActiveFilters =
    Boolean(activeCategory) ||
    Boolean(activeBrandName) ||
    selectedSizes.length > 0 ||
    inStockOnly ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    Boolean(debouncedSearch);

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activeBrandName ? 1 : 0) +
    selectedSizes.length +
    (inStockOnly ? 1 : 0) +
    (minPrice !== undefined || maxPrice !== undefined ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  return (
    <div className={styles.catalogueRoot}>
      <div className={styles.mainContentContainer}>
        {/* Compact Luxury Editorial Category Title */}
        <div className={styles.categoryTitleHeader}>
          <div className={styles.categoryTitleLeft}>
            <nav className={styles.breadcrumbsRow} aria-label="Breadcrumb">
              <span className={styles.breadcrumbLink}>Home</span>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbLink}>Catalogue</span>
              {activeCategory && (
                <>
                  <span className={styles.breadcrumbDivider}>/</span>
                  <span className={styles.breadcrumbCurrent}>{activeCategory.name}</span>
                </>
              )}
            </nav>
            <h1 className={styles.pageCategoryTitle}>
              {activeCategory ? activeCategory.name : "All Collections"}
            </h1>
          </div>
          <div className={styles.categoryTitleRight}>
            <span className={styles.curatedCounterPill}>
              <Sparkles size={13} color="#E31B23" />
              <span>{totalCount} Curated Masterpieces</span>
            </span>
          </div>
        </div>

        {/* 2. Luxury Interactive Toolbar */}
        <div className={styles.topToolbar} role="toolbar" aria-label="Catalogue Controls">
          <div className={styles.toolbarLeft}>
            <span className={styles.itemCountText}>
              Showing <span>{totalCount}</span> Luxury Masterpieces
            </span>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              className={styles.mobileFilterBtn}
              onClick={() => setIsMobileFilterOpen(true)}
              aria-label="Open Filter Refinements"
            >
              <SlidersHorizontal size={14} />
              <span>Refine</span>
              {activeFilterCount > 0 && <span className={styles.filterBadgeCount}>{activeFilterCount}</span>}
            </button>
          </div>

          <div className={styles.toolbarRight}>
            {/* Search Input */}
            <div className={styles.searchWrapper}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search silk, suiting, bridal..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
                aria-label="Search garments in catalogue"
              />
              {searchInput && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className={styles.sortContainer}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => updateParam("sortBy", e.target.value)}
                aria-label="Sort garments"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Curated Bestsellers</option>
                <option value="price_asc">Price: Accessible to Royal</option>
                <option value="price_desc">Price: Royal to Accessible</option>
              </select>
              <ChevronDown size={14} className={styles.sortChevron} />
            </div>

            {/* Grid View Switcher */}
            <div className={styles.viewSwitcher} aria-label="Grid density switcher">
              <button
                type="button"
                className={`${styles.viewBtn} ${gridCols === "four" ? styles.viewBtnActive : ""}`}
                onClick={() => setGridCols("four")}
                aria-label="4-Column Compact Grid"
                title="4-Column Grid"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${gridCols === "three" ? styles.viewBtnActive : ""}`}
                onClick={() => setGridCols("three")}
                aria-label="3-Column Editorial Grid"
                title="3-Column Editorial Grid"
              >
                <Grid3X3 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className={styles.activeFiltersBar}>
            <span className={styles.filterPrefix}>Refinements:</span>

            {activeCategory && (
              <span className={styles.filterPill}>
                Category: {activeCategory.name}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => handleCategorySelect(undefined)}
                  aria-label={`Remove ${activeCategory.name} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {activeBrandName && (
              <span className={styles.filterPill}>
                Brand: {activeBrandName}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => updateParam("brandId", undefined)}
                  aria-label={`Remove ${activeBrandName} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedSizes.map((sz) => (
              <span key={sz} className={styles.filterPill}>
                Size: {sz}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => handleSizeToggle(sz)}
                  aria-label={`Remove size ${sz} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {inStockOnly && (
              <span className={styles.filterPill}>
                In-Stock Only
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => updateParam("inStockOnly", undefined)}
                  aria-label="Remove in-stock only filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className={styles.filterPill}>
                Price: ₹{minPrice || 0} – ₹{maxPrice || "Max"}
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => handlePriceChange(undefined, undefined)}
                  aria-label="Remove price filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {debouncedSearch && (
              <span className={styles.filterPill}>
                Search: "{debouncedSearch}"
                <button
                  type="button"
                  className={styles.removeFilterBtn}
                  onClick={() => setSearchInput("")}
                  aria-label="Remove search query"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button type="button" className={styles.clearAllFiltersBtn} onClick={handleClearAll}>
              Clear All
            </button>
          </div>
        )}

        {/* 4. Two-Column Layout (Sidebar + Product Grid) */}
        <div className={styles.mainLayout}>
          {/* Desktop Filter Sidebar */}
          <div className={styles.sidebarDesktop}>
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategoryId={activeCategory?.slug || activeCategory?.id}
              selectedBrandId={brandId}
              selectedSizes={selectedSizes}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onCategorySelect={handleCategorySelect}
              onBrandSelect={(id) => updateParam("brandId", id)}
              onSizeToggle={handleSizeToggle}
              onPriceChange={handlePriceChange}
              onInStockToggle={(val) => updateParam("inStockOnly", val ? "true" : undefined)}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Product Grid Area */}
          <div className={styles.productGridArea}>
            {products.length === 0 ? (
              <div className={styles.emptyAtelierCard}>
                <div className={styles.emptyIconWrapper}>
                  <Sparkles size={28} />
                </div>
                <h2 className={styles.emptyTitle}>No Matching Garments Found</h2>
                <p className={styles.emptyDesc}>
                  We could not find garments matching your active filter criteria. Try adjusting your price bracket,
                  clearing selected sizes, or exploring our entire heritage collection.
                </p>
                <button type="button" className={styles.emptyResetBtn} onClick={handleClearAll}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={gridCols === "four" ? styles.gridFourCol : styles.gridThreeCol}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistedIds.includes(product.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={styles.paginationRow} aria-label="Pagination Navigation">
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={page <= 1}
                      onClick={() => updateParam("page", String(page - 1))}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <span className={styles.pageText}>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={page >= totalPages}
                      onClick={() => updateParam("page", String(page + 1))}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Interactive Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToBag={handleAddToBag}
        />
      )}

      {/* 6. Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setIsMobileFilterOpen(false)}>
          <div className={styles.mobileDrawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerCloseHeader}>
              <span className={styles.drawerTitle}>Refine Catalogue</span>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategoryId={activeCategory?.slug || activeCategory?.id}
              selectedBrandId={brandId}
              selectedSizes={selectedSizes}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onCategorySelect={(slug) => {
                handleCategorySelect(slug);
                setIsMobileFilterOpen(false);
              }}
              onBrandSelect={(id) => updateParam("brandId", id)}
              onSizeToggle={handleSizeToggle}
              onPriceChange={handlePriceChange}
              onInStockToggle={(val) => updateParam("inStockOnly", val ? "true" : undefined)}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      )}
    </div>
  );
};
