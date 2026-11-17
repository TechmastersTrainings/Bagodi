import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, ProductImage, Category } from "@bagodi/shared-types";
import { Modal, Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";
import { ProductPhotoManager } from "./ProductPhotoManager";
import { CheckCircle, ExternalLink, Globe, Sparkles } from "lucide-react";

export interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fabricDetails, setFabricDetails] = useState<string>("");
  const [careInstructions, setCareInstructions] = useState<string>("");
  const [photos, setPhotos] = useState<ProductImage[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => defaultApiClient.get<Category[]>("/categories"),
    enabled: isOpen,
  });

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setBasePrice(product.basePrice || 0);
      setCategoryId(product.category?.id || "");
      setDescription(product.description || "");
      setFabricDetails(product.fabricDetails || "");
      setCareInstructions(product.careInstructions || "");
      setPhotos(product.images || []);
      setIsLive(Boolean(product.isActive && !product.isArchived));
      setApiError(null);
      setSuccessMsg(null);
    }
  }, [product, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      defaultApiClient.put<Product>(`/products/${product?.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      setSuccessMsg(`Garment "${name}" successfully updated.`);
      setTimeout(() => {
        onClose();
      }, 900);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to save garment changes.");
    },
  });

  if (!product || !isOpen) return null;

  const handleSaveOnly = () => {
    setApiError(null);
    const selectedCat = categories.find((c) => c.id === categoryId) || product.category;
    updateMutation.mutate({
      name,
      basePrice: Number(basePrice) || 0,
      categoryId,
      category: selectedCat,
      description,
      fabricDetails,
      careInstructions,
      images: photos,
    });
  };

  const handleToggleLive = (targetLiveState: boolean) => {
    setApiError(null);
    const selectedCat = categories.find((c) => c.id === categoryId) || product.category;
    updateMutation.mutate({
      name,
      basePrice: Number(basePrice) || 0,
      categoryId,
      category: selectedCat,
      description,
      fabricDetails,
      careInstructions,
      images: photos,
      isActive: targetLiveState,
      isArchived: false,
    });
  };

  const storefrontUrl = `http://localhost:3000/product/${product.slug}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Garment & Publish: ${product.name}`}
      maxWidth="840px"
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

        {/* Live Status Header Banner */}
        <div
          style={{
            padding: "12px 16px",
            background: isLive ? "#E8F5E9" : "#FFF9EE",
            border: `1px solid ${isLive ? "#A5D6A7" : "#E8D8B0"}`,
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Globe size={18} color={isLive ? "#2E7D32" : "#B08A3E"} />
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: isLive ? "#1B5E20" : "#B08A3E" }}>
                {isLive ? "PUBLISHED LIVE ON PUBLIC STORE" : "STAGED DRAFT (NOT VISIBLE TO PUBLIC)"}
              </div>
              <div style={{ fontSize: "11px", color: "#7A807C" }}>
                {isLive
                  ? "Customers can browse, zoom photos, and purchase this apparel on the public storefront."
                  : "Staged from inventory. Review photography, pricing, and category, then make it live."}
              </div>
            </div>
          </div>
          {isLive && (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#1B5E20",
                textDecoration: "underline",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View on Storefront <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Title, Category & Price Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>
          <TextInput
            label="Garment Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B" }}>
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #E5E1D8",
                background: "#FFFFFF",
                padding: "0 10px",
                fontSize: "12px",
                color: "#111412",
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <TextInput
            label="Base Price (INR) *"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            isRequired
          />
        </div>

        {/* Description & Craftsmanship */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B" }}>
            Garment Description & Craftsmanship *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              marginTop: 4,
              borderRadius: 6,
              border: "1px solid #E5E1D8",
              padding: 10,
              fontFamily: "inherit",
              fontSize: "12px",
              color: "#111412",
              background: "#FFFFFF",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput
            label="Fabric & Weave"
            value={fabricDetails}
            onChange={(e) => setFabricDetails(e.target.value)}
            placeholder="e.g. 100% Pure Mulberry Silk / Zari Border"
          />
          <TextInput
            label="Care Instructions"
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
            placeholder="Dry Clean Only"
          />
        </div>

        {/* Photos 1 - 4 Manager */}
        <ProductPhotoManager images={photos} onChange={setPhotos} maxPhotos={4} />

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #EBE7DF",
            paddingTop: 16,
            marginTop: 8,
          }}
        >
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div style={{ display: "flex", gap: 10 }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={updateMutation.isPending}
              onClick={handleSaveOnly}
            >
              Save Draft
            </Button>

            {isLive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={updateMutation.isPending}
                onClick={() => handleToggleLive(false)}
                style={{ borderColor: "#E31B23", color: "#E31B23" }}
              >
                Unpublish to Staged
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                isLoading={updateMutation.isPending}
                onClick={() => handleToggleLive(true)}
                style={{
                  background: "#2E7D32",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.25)",
                }}
              >
                <Sparkles size={14} style={{ marginRight: 6 }} />
                Make Live on Public Website
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
