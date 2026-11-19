import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Category, Brand, Product, ProductImage } from "@bagodi/shared-types";
import { productCreateSchema, ProductCreateFormData } from "@bagodi/validation";
import { Modal, Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";
import { ProductPhotoManager } from "./ProductPhotoManager";

export interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ALPHA_SIZES = ["FREE", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const PRESET_NUMERIC_SIZES = ["36", "38", "39", "40", "42", "44", "46"];

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ProductImage[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["FREE"]);
  const [customSizeInput, setCustomSizeInput] = useState<string>("");

  const toggleSize = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== sz));
      }
    } else {
      if (selectedSizes.length === 1 && selectedSizes[0] === "FREE" && sz !== "FREE") {
        setSelectedSizes([sz]);
      } else if (sz === "FREE") {
        setSelectedSizes(["FREE"]);
      } else {
        setSelectedSizes([...selectedSizes.filter((s) => s !== "FREE"), sz]);
      }
    }
  };

  const addCustomSize = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes.filter((s) => s !== "FREE"), trimmed]);
      setCustomSizeInput("");
    }
  };

  // Fetch categories and brands
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => defaultApiClient.get<Category[]>("/categories"),
    enabled: isOpen,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["admin-brands"],
    queryFn: () => defaultApiClient.get<Brand[]>("/brands"),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreateFormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      returnEligible: true,
      exchangeEligible: true,
      returnWindowDays: 7,
      basePrice: 0,
    },
  });

  // Auto-slugify product name
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const handleClose = () => {
    reset();
    setPhotos([]);
    setSelectedSizes(["FREE"]);
    setCustomSizeInput("");
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: (data: ProductCreateFormData & { images?: ProductImage[]; sizes?: string[]; variants?: any[] }) =>
      defaultApiClient.post<Product>("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      handleClose();
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to create garment. Verify product details.");
    },
  });

  const onSubmit = (data: ProductCreateFormData) => {
    setApiError(null);
    const variants = selectedSizes.map((sz) => ({
      name: `${data.name} - ${sz}`,
      size: sz,
      color: "Standard",
      mrp: data.basePrice,
      sellingPrice: data.basePrice,
      initialStock: 10,
      status: "active",
    }));

    createMutation.mutate({
      ...data,
      sizes: selectedSizes,
      variants,
      images: photos,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Garment to Catalogue" maxWidth="820px">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {apiError && <ApiErrorCard message={apiError} />}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-3)" }}>
          <TextInput
            label="Garment Title"
            placeholder="e.g. Classic Linen Shirt"
            isRequired
            error={errors.name?.message}
            {...register("name")}
          />
          <TextInput
            label="URL Slug"
            placeholder="classic-linen-shirt"
            isRequired
            error={errors.slug?.message}
            {...register("slug")}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Category *
            </label>
            <select
              style={{
                width: "100%",
                height: 40,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                padding: "0 12px",
                marginTop: 4,
              }}
              {...register("categoryId")}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
                {errors.categoryId.message}
              </span>
            )}
          </div>

          <div>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Brand / Label *
            </label>
            <select
              style={{
                width: "100%",
                height: 40,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                padding: "0 12px",
                marginTop: 4,
              }}
              {...register("brandId")}
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brandId && (
              <span style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
                {errors.brandId.message}
              </span>
            )}
          </div>
        </div>

        <TextInput
          label="Base Price (INR)"
          type="number"
          placeholder="1499"
          isRequired
          error={errors.basePrice?.message}
          {...register("basePrice", { valueAsNumber: true })}
        />

        {/* Garment Size Selection & Sizing Matrix */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              Available Sizes & Variants *
            </label>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--accent-primary)", fontWeight: 600 }}>
              Selected ({selectedSizes.length}): {selectedSizes.join(", ")}
            </span>
          </div>

          {/* Quick presets: Alpha & Free */}
          <div style={{ marginBottom: "var(--space-2)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: 4 }}>Standard / Alpha Sizes:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PRESET_ALPHA_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid #E31B23" : "1px solid var(--border-default)",
                      background: isSelected ? "rgba(227, 27, 35, 0.12)" : "var(--bg-surface)",
                      color: isSelected ? "#E31B23" : "var(--text-primary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sz} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numeric Sizes (Suiting, Trousers, Raymond) */}
          <div style={{ marginBottom: "var(--space-2)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: 4 }}>Numeric Suiting / Raymond Sizes:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PRESET_NUMERIC_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid #E31B23" : "1px solid var(--border-default)",
                      background: isSelected ? "rgba(227, 27, 35, 0.12)" : "var(--bg-surface)",
                      color: isSelected ? "#E31B23" : "var(--text-primary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sz} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Size */}
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              placeholder="e.g. Free Size (6.3m), 48, Custom..."
              style={{
                flex: 1,
                height: 32,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                padding: "0 10px",
                fontSize: "12px",
                color: "var(--text-primary)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSize(e as any);
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSize}
              style={{
                height: 32,
                padding: "0 14px",
                background: "#111111",
                color: "#FFFFFF",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Size
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Garment Description *
          </label>
          <textarea
            style={{
              width: "100%",
              minHeight: 80,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              padding: 10,
              fontFamily: "inherit",
              fontSize: "var(--text-sm)",
              marginTop: 4,
            }}
            placeholder="Detailed description of craftsmanship, silhouette, and occasion..."
            {...register("description")}
          />
          {errors.description && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
              {errors.description.message}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <TextInput
            label="Fabric & Weave"
            placeholder="e.g. 100% Pure Mulberry Silk"
            error={errors.fabricDetails?.message}
            {...register("fabricDetails")}
          />
          <TextInput
            label="Care Instructions"
            placeholder="Dry clean only"
            error={errors.careInstructions?.message}
            {...register("careInstructions")}
          />
        </div>

        {/* 1 - 4 Product Photography Manager */}
        <ProductPhotoManager images={photos} onChange={setPhotos} maxPhotos={4} />

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting || createMutation.isPending}>
            Save Garment ({photos.length} Photo{photos.length === 1 ? "" : "s"})
          </Button>
        </div>
      </form>
    </Modal>
  );
};

