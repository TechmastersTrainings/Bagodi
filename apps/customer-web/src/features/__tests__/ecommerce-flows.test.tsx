import "@testing-library/jest-dom/vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@bagodi/api-client", () => ({
  defaultApiClient: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

vi.mock("@bagodi/authentication", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "u-1", email: "cust@bagodi.in", fullName: "Aarav Sharma", role: "CUSTOMER" },
  }),
}));

vi.mock("../orders/CustomerDeliveryTrackingModal", () => ({
  CustomerDeliveryTrackingModal: () => null,
}));

import { WishlistPage } from "../account/WishlistPage";
import { OrdersPage } from "../orders/OrdersPage";
import { ContactPage } from "../policies/ContactPage";

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Customer Storefront Production Flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ContactPage flagship Bidar mall directory details", () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByText(/Contact Us & Store Directory/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 99720 00805/)).toBeInTheDocument();
    expect(screen.getByText(/support@bagodi\.in/i)).toBeInTheDocument();
  });

  it("loads WishlistPage items and supports Move to Bag and Remove", async () => {
    mockGet.mockResolvedValue([
      {
        id: "w-1",
        productId: "p-1",
        name: "Royal Zari Kanjeevaram Saree",
        slug: "royal-zari-kanjeevaram-saree",
        basePrice: 2240,
        mrp: 2499,
        inStock: true,
        categoryName: "Sarees",
        variants: [{ id: "v-1", size: "FREE", sellingPrice: 2240, availableStock: 4 }],
      },
    ]);
    mockPost.mockResolvedValue({ ok: true });
    mockDelete.mockResolvedValue({});

    renderWithProviders(<WishlistPage />);

    expect(await screen.findByText("Royal Zari Kanjeevaram Saree")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Move to Bag/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/cart/items", {
        variantId: "v-1",
        variant_id: "v-1",
        quantity: 1,
      });
      expect(mockDelete).toHaveBeenCalledWith("/wishlist/items/p-1");
    });
  });

  it("displays GST Invoice on all orders and allows customer cancellation before dispatch", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    mockGet.mockResolvedValue([
      {
        id: "o-1",
        orderNumber: "BGD-2026-1001",
        userId: "u-1",
        status: "CONFIRMED",
        paymentStatus: "COLLECTED",
        paymentMethod: "RAZORPAY",
        items: [{ id: "oi-1", productName: "Bandhgala Suit", quantity: 1, unitPrice: 4480, totalPrice: 4480 }],
        shippingAddress: {
          id: "a-1",
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "Udgir Rd",
          city: "Bidar",
          state: "Karnataka",
          pincode: "585401",
          isDefault: true,
        },
        subtotal: 4480,
        discountTotal: 0,
        deliveryCharge: 0,
        grandTotal: 4480,
        taxAmount: 480,
        cgstAmount: 240,
        sgstAmount: 240,
        createdAt: "2026-11-26T10:00:00Z",
        updatedAt: "2026-11-26T10:00:00Z",
      },
      {
        id: "o-2",
        orderNumber: "BGD-2026-1002",
        userId: "u-1",
        status: "DELIVERED",
        paymentStatus: "COLLECTED",
        paymentMethod: "COD",
        items: [{ id: "oi-2", productName: "Linen Shirt", quantity: 1, unitPrice: 1680, totalPrice: 1680 }],
        shippingAddress: {
          id: "a-1",
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "Udgir Rd",
          city: "Bidar",
          state: "Karnataka",
          pincode: "585401",
          isDefault: true,
        },
        subtotal: 1680,
        discountTotal: 0,
        deliveryCharge: 0,
        grandTotal: 1680,
        createdAt: "2026-11-25T10:00:00Z",
        updatedAt: "2026-11-26T10:00:00Z",
      },
    ]);
    mockPost.mockResolvedValue({ status: "CANCELLED" });

    renderWithProviders(<OrdersPage />);

    expect(await screen.findByText(/Order #BGD-2026-1001/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /GST Invoice/i })).toHaveLength(2);
    const cancelButtons = screen.getAllByRole("button", { name: /Cancel Order/i });
    expect(cancelButtons).toHaveLength(1);

    fireEvent.click(cancelButtons[0]);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/orders/BGD-2026-1001/cancel", {
        reason: "Cancelled by customer from My Orders",
      });
    });
    confirmSpy.mockRestore();
  });
});

