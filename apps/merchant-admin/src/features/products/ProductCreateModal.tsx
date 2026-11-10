import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Category, Brand, Product } from "@bagodi/shared-types";
import { productCreateSchema, ProductCreateFormData } from "@bagodi/validation";
import { Modal, Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";

export interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: (data: ProductCreateFormData) =>
      defaultApiClient.post<Product>("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to create garment. Verify product details.");
    },
  });

  const onSubmit = (data: ProductCreateFormData) => {
    setApiError(null);
    createMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Garment to Catalogue" maxWidth="680px">
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

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting || createMutation.isPending}>
            Save Garment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

