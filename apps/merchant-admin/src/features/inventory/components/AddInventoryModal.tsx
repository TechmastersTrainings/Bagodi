import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Category, ProductImage } from "@bagodi/shared-types";
import { Modal, Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";
import { ProductPhotoManager } from "../../products/ProductPhotoManager";
import { Barcode, ArrowUpRight, Sparkles, CheckCircle } from "lucide-react";

export interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigateToCatalogue?: () => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("Silk Sarees");
  const [price, setPrice] = useState<number>(24999);
  const [mrp, setMrp] = useState<number>(29999);
  const [onHandQuantity, setOnHandQuantity] = useState<number>(8);
  const [size, setSize] = useState<string>("Free Size (6.3m)");
  const [colorName, setColorName] = useState<string>("Crimson & Gold");
  const [photos, setPhotos] = useState<ProductImage[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => defaultApiClient.get<Category[]>("/categories"),
    enabled: isOpen,
  });

  const handleGenerateSerial = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setSerialNumber(`BAG-SN-2026-${randomSuffix}`);
  };

  const createInventoryMutation = useMutation({
    mutationFn: (payload: any) => defaultApiClient.post("/inventory", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });

      if (variables?.pushToCatalogue) {
        setSuccessMsg(
          `Inventory item "${productName}" saved and pushed to Product Catalogue staging!`
        );
      } else {
        setSuccessMsg(
          `Inventory item "${productName}" added to in-store ledger. You can push it to the Product Catalogue later.`
        );
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : "Failed to add inventory item.");
    },
  });

  const handleSave = (pushToCatalogue: boolean) => {
    if (!productName.trim()) {
      setApiError("Please enter a garment title.");
      return;
    }
    const finalSerial = serialNumber.trim() || `BAG-SN-${Date.now().toString().slice(-6)}`;

    setApiError(null);
    createInventoryMutation.mutate({
      serialNumber: finalSerial,
      barcode: finalSerial,
      sku: finalSerial,
      productName: productName.trim(),
      categoryName,
      price: Number(price) || 0,
      mrp: Number(mrp) || Number(price) || 0,
      onHandQuantity: Number(onHandQuantity) || 1,
      size,
      colorName,
      images: photos,
      pushToCatalogue,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add In-Store Inventory & Serial" maxWidth="840px">
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

        {/* Serial Number & Barcode Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr auto", gap: 10, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B" }}>
              Garment Serial Number / Barcode *
            </label>
            <div style={{ display: "flex", alignItems: "center", marginTop: 4, position: "relative" }}>
              <Barcode
                size={16}
                color="#7A807C"
                style={{ position: "absolute", left: 10, pointerEvents: "none" }}
              />
              <input
                type="text"
                placeholder="e.g. BAG-SN-2026-8812 (or scan barcode)"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px 0 34px",
                  borderRadius: 6,
                  border: "1px solid #E5E1D8",
                  background: "#FFFFFF",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "#111412",
                }}
              />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateSerial}>
            <Sparkles size={13} style={{ marginRight: 4 }} />
            Auto Serial
          </Button>
        </div>

        {/* Product Title & Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
          <TextInput
            label="Garment Title"
            placeholder="e.g. Pure Mulberry Kanjeevaram Saree"
            isRequired
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4A4E4B" }}>
              Category *
            </label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
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
              {categories.length > 0 ? (
                categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="Silk Sarees">Silk Sarees</option>
                  <option value="Festive Couture">Festive Couture</option>
                  <option value="Wedding Collection">Wedding Collection</option>
                  <option value="Raymond Men's Suiting">Raymond Men's Suiting</option>
                  <option value="Women's Ethnic">Women's Ethnic</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Pricing, Quantity, Size & Color */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
          <TextInput
            label="Selling Price (INR)"
            type="number"
            placeholder="24999"
            isRequired
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <TextInput
            label="MRP (INR)"
            type="number"
            placeholder="29999"
            value={mrp}
            onChange={(e) => setMrp(Number(e.target.value))}
          />
          <TextInput
            label="Stock Units"
            type="number"
            placeholder="8"
            isRequired
            value={onHandQuantity}
            onChange={(e) => setOnHandQuantity(Number(e.target.value))}
          />
          <TextInput
            label="Size Scale"
            placeholder="Free Size / 38"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
          <TextInput
            label="Color / Shade"
            placeholder="Crimson & Gold"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
          />
        </div>

        {/* Photography (1 - 4 Photos) */}
        <ProductPhotoManager images={photos} onChange={setPhotos} maxPhotos={4} />

        {/* Workflow Guidance Card */}
        <div
          style={{
            padding: "12px 14px",
            background: "#F8F6F0",
            border: "1px solid #E5E1D8",
            borderRadius: 8,
            fontSize: "12px",
            color: "#4A4E4B",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, color: "#111412", marginBottom: 2 }}>
            Inventory vs Catalogue Workflow:
          </div>
          <div>
            <strong>1. Add to Inventory:</strong> Saves garment to store ledger. It stays in inventory until you decide to push it.
          </div>
          <div>
            <strong>2. Later Push to Catalogue:</strong> Once in inventory, you can click "Push to Catalogue" anytime to stage it for the online store.
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #EBE7DF",
            paddingTop: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Button 1: Add to Inventory only */}
            <Button
              type="button"
              size="sm"
              variant="primary"
              isLoading={createInventoryMutation.isPending && !createInventoryMutation.variables?.pushToCatalogue}
              onClick={() => handleSave(false)}
              style={{
                background: "#E31B23",
                color: "#FFFFFF",
                fontWeight: 600,
                boxShadow: "0 2px 6px rgba(227, 27, 35, 0.25)",
              }}
            >
              1. Add to Inventory
            </Button>

            {/* Button 2: Save & Push to Catalogue */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<ArrowUpRight size={14} />}
              isLoading={createInventoryMutation.isPending && createInventoryMutation.variables?.pushToCatalogue}
              onClick={() => handleSave(true)}
              style={{
                borderColor: "#C5A15B",
                color: "#9A7528",
                background: "#FDFBF7",
                fontWeight: 600,
              }}
            >
              2. Save & Push to Catalogue
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
