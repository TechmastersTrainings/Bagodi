import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Product, PaginatedResponse, Category } from "@bagodi/shared-types";
import {
  DataTable,
  Column,
  Button,
  StatusBadge,
  TextInput,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { ProductCreateModal } from "./ProductCreateModal";
import { VariantManagerModal } from "./VariantManagerModal";
import { ProductPhotosModal } from "./ProductPhotosModal";
import { ProductEditModal } from "./ProductEditModal";
import { Plus, Search, Layers, Trash2, RefreshCw, Camera, Edit3, ExternalLink } from "lucide-react";
import { formatINR, useDebounce } from "@bagodi/utilities";

export const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusFilterTab, setStatusFilterTab] = useState<"ALL" | "STAGED" | "LIVE">("ALL");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [selectedProductForPhotos, setSelectedProductForPhotos] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => defaultApiClient.get<Category[]>("/categories"),
  });

  // Fetch Products
  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["admin-products-list", page, debouncedSearch, selectedCategory],
    queryFn: () =>
      defaultApiClient.get<PaginatedResponse<Product>>("/products", {
        params: {
          page,
          pageSize: 50,
          search: debouncedSearch || undefined,
          categoryId: selectedCategory || undefined,
          includeAll: true,
        },
      }),
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => defaultApiClient.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
    },
  });

  const rawItems: any[] = Array.isArray(data) ? data : data?.items || [];
  const allItems: Product[] = rawItems
    .filter((p) => p.status !== "archived" && !p.isArchived)
    .map((p) => ({
      ...p,
      isActive: Boolean(p.isActive ?? (p.status === "active" && p.is_published !== false)),
      isArchived: false,
      currency: p.currency || "INR",
      basePrice: Number(p.basePrice) || (p.variants?.[0]?.base_price ? Number(p.variants[0].base_price) : 0),
    }));
  const stagedItems = allItems.filter((p) => !p.isActive && !p.isArchived);
  const liveItems = allItems.filter((p) => p.isActive && !p.isArchived);

  const displayedItems =
    statusFilterTab === "STAGED"
      ? stagedItems
      : statusFilterTab === "LIVE"
      ? liveItems
      : allItems;

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Garment Name & Cover",
      render: (r) => {
        const coverPhoto = r.images?.find((img) => img.isPrimary) || r.images?.[0];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 52,
                borderRadius: 6,
                background: "#F0EDE6",
                border: "1px solid #E5E1D8",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => setSelectedProductForEdit(r)}
              title="Click to edit photos, price, category or make live"
            >
              {coverPhoto ? (
                <img
                  src={coverPhoto.url}
                  alt={coverPhoto.altText || r.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Camera size={18} color="#8C938E" />
              )}
            </div>
            <div>
              <strong
                style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", cursor: "pointer" }}
                onClick={() => setSelectedProductForEdit(r)}
              >
                {r.name}
              </strong>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{r.slug}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: r.images?.length ? "#FFF9EE" : "#F5F5F5",
                    color: r.images?.length ? "#C5A15B" : "#8C938E",
                    border: `1px solid ${r.images?.length ? "#E8D8B0" : "#E0E0E0"}`,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedProductForPhotos(r)}
                >
                  {r.images?.length || 0}/4 Photos
                </span>
                {r.isActive && (
                  <a
                    href={`http://localhost:3000/product/${r.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "10px",
                      color: "#2E7D32",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      textDecoration: "underline",
                    }}
                  >
                    View Live <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    { key: "category", header: "Category", render: (r) => r.category?.name || "-" },
    { key: "brand", header: "Brand", render: (r) => r.brand?.name || "-" },
    {
      key: "basePrice",
      header: "Base Price",
      render: (r) => formatINR(r.basePrice),
    },
    {
      key: "variants",
      header: "Variants (Sizes)",
      render: (r) => (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          {r.variants?.length ? `${r.variants.length} SKU(s)` : "None"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          variant={r.isArchived ? "neutral" : r.isActive ? "success" : "warning"}
          label={r.isArchived ? "Archived" : r.isActive ? "Live" : "Staged Draft"}
        />
      ),
    },
    {
      key: "actions",
      header: "Operations",
      render: (r) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Edit3 size={13} />}
            style={{
              borderColor: r.isActive ? "#A5D6A7" : "#E31B23",
              color: r.isActive ? "#2E7D32" : "#E31B23",
              background: r.isActive ? "#F1F8F1" : "#FFF5F5",
              fontWeight: 600,
            }}
            onClick={() => setSelectedProductForEdit(r)}
          >
            {r.isActive ? "Edit" : "Edit & Make Live"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Camera size={13} />}
            onClick={() => setSelectedProductForPhotos(r)}
          >
            Photos ({r.images?.length || 0}/4)
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Layers size={13} />}
            onClick={() => setSelectedProductForVariants(r)}
          >
            Variants ({r.variants?.length || 0})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 size={13} color="#C5221F" />}
            style={{ color: "#C5221F" }}
            onClick={() => {
              if (window.confirm(`Delete "${r.name}"? This will permanently remove the garment and all its size variants from the catalogue.`)) {
                deleteMutation.mutate(r.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)" }}>Product Catalogue Management</h1>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Configure luxury garments, category hierarchy, size scales, barcodes, and variant-level pricing
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button size="sm" variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Sync
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Garment
          </Button>
        </div>
      </div>

      {/* Staging & Live Status Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setStatusFilterTab("ALL")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1px solid ${statusFilterTab === "ALL" ? "#E31B23" : "#E5E1D8"}`,
            background: statusFilterTab === "ALL" ? "#E31B23" : "#FFFFFF",
            color: statusFilterTab === "ALL" ? "#FFFFFF" : "#111412",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Garments ({allItems.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilterTab("STAGED")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1px solid ${statusFilterTab === "STAGED" ? "#E31B23" : "#E5E1D8"}`,
            background: statusFilterTab === "STAGED" ? "#FFF9EE" : "#FFFFFF",
            color: statusFilterTab === "STAGED" ? "#B08A3E" : "#4A4E4B",
            borderColor: statusFilterTab === "STAGED" ? "#C5A15B" : "#E5E1D8",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Staged from Inventory ({stagedItems.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilterTab("LIVE")}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: `1px solid ${statusFilterTab === "LIVE" ? "#2E7D32" : "#E5E1D8"}`,
            background: statusFilterTab === "LIVE" ? "#E8F5E9" : "#FFFFFF",
            color: statusFilterTab === "LIVE" ? "#1B5E20" : "#4A4E4B",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Live on Storefront ({liveItems.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-6)", alignItems: "center" }}>
        <div style={{ width: 280 }}>
          <TextInput
            placeholder="Search garment name or slug..."
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          style={{
            height: 40,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            padding: "0 12px",
            fontSize: "var(--text-xs)",
          }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <ApiErrorCard message="Failed to load product list from catalogue service." onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={displayedItems}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={displayedItems.length}
          onPageChange={(p) => setPage(p)}
          emptyTitle="Catalogue Empty"
          emptyDescription="No apparel has been created yet. Click 'New Garment' to add your first product."
        />
      )}

      {/* Modals */}
      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ProductEditModal
        isOpen={Boolean(selectedProductForEdit)}
        onClose={() => setSelectedProductForEdit(null)}
        product={selectedProductForEdit}
      />

      <ProductPhotosModal
        isOpen={Boolean(selectedProductForPhotos)}
        onClose={() => setSelectedProductForPhotos(null)}
        product={selectedProductForPhotos}
      />

      <VariantManagerModal
        product={selectedProductForVariants}
        isOpen={!!selectedProductForVariants}
        onClose={() => setSelectedProductForVariants(null)}
      />
    </div>
  );
};

