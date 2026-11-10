import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { MerchantTenant, OnboardMerchantPayload, TenantPlan } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { Building2, Store, User, AlertTriangle } from "lucide-react";

export interface OnboardMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardMerchantModal: React.FC<OnboardMerchantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Tenant Details
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [legalEntityName, setLegalEntityName] = useState("");
  const [gstin, setGstin] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState<TenantPlan>("ENTERPRISE");

  // Primary Store
  const [storeName, setStoreName] = useState("Flagship Showroom");
  const [storeCode, setStoreCode] = useState("STORE-01");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("Bidar");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("585401");

  // Primary Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const onboardMutation = useMutation({
    mutationFn: (payload: OnboardMerchantPayload) =>
      defaultApiClient.post<MerchantTenant>("/super/merchants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-merchants-list"] });
      queryClient.invalidateQueries({ queryKey: ["super-platform-governance"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to onboard new merchant tenant."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (slug.length < 3) {
      setFormError("Tenant slug must be at least 3 characters.");
      return;
    }

    const payload: OnboardMerchantPayload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      legalEntityName: legalEntityName.trim(),
      gstin: gstin.trim() || undefined,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      domain: domain.trim() || undefined,
      plan,
      primaryStore: {
        name: storeName.trim(),
        code: storeCode.trim().toUpperCase(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      adminUser: {
        fullName: adminName.trim(),
        email: adminEmail.trim(),
        phoneNumber: adminPhone.trim(),
        password: adminPassword || undefined,
      },
    };

    onboardMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Retail Merchant Tenant" maxWidth="720px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Section 1: Tenant Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={15} /> 1. Commercial Tenant Identity
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Brand Display Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Bagodi Shopping Mall"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Tenant Slug (Subdomain) *
              </label>
              <input
                type="text"
                placeholder="bagodi-bidar"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "var(--color-champagne-gold)", fontFamily: "var(--font-mono)", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Registered Legal Entity *
              </label>
              <input
                type="text"
                placeholder="e.g. TechMasters Innovations Private Limited"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                placeholder="29AABCB1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Contact Email *
              </label>
              <input
                type="email"
                placeholder="billing@bagodi.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Contact Mobile *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="store.bagodi.in"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Subscription Tier
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as TenantPlan)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              >
                <option value="ENTERPRISE">Enterprise (Dedicated Node)</option>
                <option value="GROWTH">Growth (Multi-Store)</option>
                <option value="BOUTIQUE">Boutique (Single Mall)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Primary Flagship Store */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-4)" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
            <Store size={15} /> 2. Primary Physical Store Location
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Store Name *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Store Code *
              </label>
              <input
                type="text"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Street Address *
              </label>
              <input
                type="text"
                placeholder="Shivaji Chowk, Main Road"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                State *
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                PIN *
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Initial Staff Administrator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-4)" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-champagne-gold)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
            <User size={15} /> 3. Store General Manager Account
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Administrator Name *
              </label>
              <input
                type="text"
                placeholder="Store Director"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Staff Email *
              </label>
              <input
                type="email"
                placeholder="manager@bagodi.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Staff Mobile *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Initial Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Auto-generated if empty"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "8px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Error notification */}
        {formError && (
          <div style={{ color: "#FF8F8F", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {formError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={onboardMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={onboardMutation.isPending} leftIcon={<Building2 size={14} />}>
            Provision Tenant & Issue API Key
          </Button>
        </div>
      </form>
    </Modal>
  );
};
