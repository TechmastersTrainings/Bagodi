import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, ProductVariant } from "@bagodi/shared-types";
import { variantCreateSchema, VariantCreateFormData } from "@bagodi/validation";
import {
  Modal,
  DataTable,
  Column,
  Button,
  TextInput,
  StatusBadge,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { Plus, Barcode } from "lucide-react";
import { formatINR } from "@bagodi/utilities";

export interface VariantManagerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VariantManagerModal: React.FC<VariantManagerModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAddingVariant, setIsAddingVariant] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VariantCreateFormData>({
    resolver: zodResolver(variantCreateSchema),
    defaultValues: {
      productId: product?.id || "",
      initialStock: 0,
    },
  });

  // Mutate create variant
  const createVariantMutation = useMutation({
    mutationFn: (payload: VariantCreateFormData) =>
      defaultApiClient.post<ProductVariant>("/variants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      reset();
      setIsAddingVariant(false);
      setApiError(null);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to create variant. Check for duplicate SKU or Barcode.");
    },
  });

  const onSubmit = (data: VariantCreateFormData) => {
    setApiError(null);
    if (!product) return;
    createVariantMutation.mutate({ ...data, productId: product.id });
  };

  const columns: Column<ProductVariant>[] = [
    { key: "size", header: "Size", render: (r) => <strong>{r.size}</strong> },
    { key: "colorName", header: "Color", render: (r) => r.colorName },
    { key: "sku", header: "SKU", render: (r) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{r.sku}</span> },
    { key: "barcode", header: "Barcode", render: (r) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>{r.barcode}</span> },
    { key: "mrp", header: "MRP", render: (r) => formatINR(r.mrp) },
    { key: "sellingPrice", header: "Selling Price", render: (r) => <strong>{formatINR(r.sellingPrice)}</strong> },
    { key: "availableStock", header: "Live Stock", render: (r) => (
      <StatusBadge
        variant={r.availableStock > 0 ? "success" : "danger"}
        label={`${r.availableStock} Units`}
      />
    )},
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Variants: ${product.name}` : "Variant Management"}
      maxWidth="800px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Each size and color variant maintains independent SKU, barcode, pricing, and stock records.
          </p>
          <Button
            size="sm"
            variant={isAddingVariant ? "outline" : "primary"}
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAddingVariant(!isAddingVariant)}
          >
            {isAddingVariant ? "Cancel" : "Add Variant"}
          </Button>
        </div>

        {apiError && <ApiErrorCard message={apiError} />}

        {/* New Variant Inline Form */}
        {isAddingVariant && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              padding: "var(--space-4)",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <h4 style={{ fontSize: "var(--text-xs)", fontWeight: "bold", textTransform: "uppercase" }}>New Product Variant</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <TextInput
                label="Size"
                placeholder="e.g. S, M, L, XL, 32"
                isRequired
                error={errors.size?.message}
                {...register("size")}
              />
              <TextInput
                label="Color Name"
                placeholder="e.g. Midnight Black, Ivory"
                isRequired
                error={errors.colorName?.message}
                {...register("colorName")}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              <TextInput
                label="Unique SKU"
                placeholder="e.g. BGD-SHIRT-BLK-M"
                isRequired
                error={errors.sku?.message}
                {...register("sku")}
              />
              <TextInput
                label="Barcode / EAN"
                placeholder="Scan or enter barcode"
                leftIcon={<Barcode size={16} />}
                isRequired
                error={errors.barcode?.message}
                {...register("barcode")}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
              <TextInput
                label="MRP (INR)"
                type="number"
                placeholder="2499"
                isRequired
                error={errors.mrp?.message}
                {...register("mrp", { valueAsNumber: true })}
              />
              <TextInput
                label="Selling Price (INR)"
                type="number"
                placeholder="1999"
                isRequired
                error={errors.sellingPrice?.message}
                {...register("sellingPrice", { valueAsNumber: true })}
              />
              <TextInput
                label="Initial Stock Units"
                type="number"
                placeholder="0"
                error={errors.initialStock?.message}
                {...register("initialStock", { valueAsNumber: true })}
              />
            </div>

            <Button type="submit" size="sm" isLoading={isSubmitting || createVariantMutation.isPending}>
              Save Variant
            </Button>
          </form>
        )}

        {/* Existing Variants Table */}
        <DataTable
          columns={columns}
          data={product?.variants || []}
          emptyTitle="No Variants Configured"
          emptyDescription="Click 'Add Variant' above to configure sizes and SKUs for this garment."
        />
      </div>
    </Modal>
  );
};

