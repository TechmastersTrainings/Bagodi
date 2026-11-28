import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { ApiErrorCard, Button, EmptyState, SkeletonCard } from "@bagodi/shared-components";
import { formatINR } from "@bagodi/utilities";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { AccountNavTabs } from "./AccountNavTabs";

interface WishlistEntry {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  basePrice: number;
  mrp: number;
  inStock: boolean;
  categoryName?: string | null;
  variants?: { id: string; size?: string; sellingPrice: number; availableStock: number }[];
}

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery<WishlistEntry[]>({
    queryKey: ["customer-wishlist"],
    queryFn: () => defaultApiClient.get<WishlistEntry[]>("/wishlist"),
    retry: 1,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => defaultApiClient.delete(`/wishlist/items/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-wishlist"] });
    },
  });

  const moveToBagMutation = useMutation({
    mutationFn: async (entry: WishlistEntry) => {
      const targetVariant =
        entry.variants?.find((v) => v.availableStock > 0) || entry.variants?.[0];
      if (!targetVariant) {
        navigate(`/product/${entry.slug || entry.productId}`);
        return;
      }
      await defaultApiClient.post("/cart/items", {
        variantId: targetVariant.id,
        variant_id: targetVariant.id,
        quantity: 1,
      });
      await defaultApiClient.delete(`/wishlist/items/${entry.productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
    },
  });

  if (isLoading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 var(--space-4)" }}>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ApiErrorCard message="Failed to load your saved wishlist." onRetry={() => refetch()} />;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "var(--space-6) var(--space-4) var(--space-10)" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>
        Saved Wishlist
      </h1>
      <AccountNavTabs />

      {items.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Tap the heart icon on any saree, blazer, or ethnic ensemble to save pieces for later."
          icon={<Heart size={36} />}
          action={
            <Button onClick={() => navigate("/catalogue")} size="md">
              Explore Collection
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "var(--space-5)",
            marginTop: "var(--space-4)",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Link to={`/product/${item.slug || item.productId}`} style={{ display: "block", aspectRatio: "4/5", background: "#ECE2CF" }}>
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85"}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {item.categoryName && (
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8C6825", fontWeight: 700 }}>
                    {item.categoryName}
                  </span>
                )}
                <Link to={`/product/${item.slug || item.productId}`} style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none", fontSize: "var(--text-sm)" }}>
                  {item.name}
                </Link>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "var(--text-base)" }}>
                  {formatINR(item.basePrice)}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                  <Button
                    size="sm"
                    style={{ flex: 1 }}
                    leftIcon={<ShoppingBag size={14} />}
                    disabled={moveToBagMutation.isPending}
                    onClick={() => moveToBagMutation.mutate(item)}
                  >
                    Move to Bag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Remove from Wishlist"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(item.productId)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

