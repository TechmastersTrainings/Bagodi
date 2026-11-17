import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, ProductImage } from "@bagodi/shared-types";
import { Modal, Button, ApiErrorCard } from "@bagodi/shared-components";
import { ProductPhotoManager } from "./ProductPhotoManager";
import { CheckCircle, Image as ImageIcon } from "lucide-react";

export interface ProductPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductPhotosModal: React.FC<ProductPhotosModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setImages(product.images || []);
      setApiError(null);
      setSuccessMsg(null);
    }
  }, [product, isOpen]);

  const updateImagesMutation = useMutation({
    mutationFn: (updatedImages: ProductImage[]) =>
      defaultApiClient.put<Product>(`/products/${product?.id}`, {
        images: updatedImages,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      setSuccessMsg(`Successfully saved ${images.length} photo(s) for "${product?.name}".`);
      setTimeout(() => {
        onClose();
      }, 900);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to update product photography.");
    },
  });

  if (!product) return null;

  const handleSave = () => {
    setApiError(null);
    updateImagesMutation.mutate(images);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product Photography: ${product.name}`}
      maxWidth="780px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {apiError && <ApiErrorCard message={apiError} />}

        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              borderRadius: "8px",
              color: "#1B5E20",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={15} />
            {successMsg}
          </div>
        )}

        <div
          style={{
            padding: "10px 14px",
            background: "#F8F7F5",
            borderRadius: "8px",
            border: "1px solid #E5E1D8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#7A807C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Garment Code & SKU
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111412" }}>
              {product.id} • {product.category?.name || "General Couture"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "12px",
              color: "#C5A15B",
              fontWeight: 600,
            }}
          >
            <ImageIcon size={14} />
            {images.length} of 4 Slots Configured
          </div>
        </div>

        <ProductPhotoManager images={images} onChange={setImages} maxPhotos={4} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #EBE7DF",
            paddingTop: 16,
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: "11px", color: "#7A807C" }}>
            Changes will update live storefront cards, gallery zoom, and detail carousels.
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={updateImagesMutation.isPending}
              onClick={handleSave}
            >
              Save Photos ({images.length}/4)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
