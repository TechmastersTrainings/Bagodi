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
import { Plus, Search, Layers, Archive, RefreshCw } from "lucide-react";
import { formatINR, useDebounce } from "@bagodi/utilities";

export const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

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
          pageSize: 15,
          search: debouncedSearch || undefined,
          categoryId: selectedCategory || undefined,
        },
      }),
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (productId: string) => defaultApiClient.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-list"] });
    },
  });

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Garment Name",
      render: (r) => (
        <div>
          <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{r.name}</strong>
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Slug: {r.slug}</p>
        </div>
      ),
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
          label={r.isArchived ? "Archived" : r.isActive ? "Active" : "Draft"}
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
            leftIcon={<Layers size={14} />}
            onClick={() => setSelectedProductForVariants(r)}
          >
            Variants ({r.variants?.length || 0})
          </Button>
          {!r.isArchived && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Archive size={14} />}
              onClick={() => {
                if (window.confirm(`Archive "${r.name}"? It will be hidden from customer storefront.`)) {
                  archiveMutation.mutate(r.id);
                }
              }}
            >
              Archive
            </Button>
          )}
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
          data={data?.items || []}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
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

      <VariantManagerModal
        product={selectedProductForVariants}
        isOpen={!!selectedProductForVariants}
        onClose={() => setSelectedProductForVariants(null)}
      />
    </div>
  );
};

