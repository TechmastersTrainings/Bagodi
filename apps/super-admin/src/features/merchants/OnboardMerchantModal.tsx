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
        err?.response?.data?.message || err?.message || "Failed to onboard merchant tenant."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !slug.trim() || !legalEntityName.trim() || !contactEmail.trim()) {
      setFormError("All required tenant fields must be filled.");
      return;
    }

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setFormError("Primary Store Manager account credentials are required.");
      return;
    }

    const payload: OnboardMerchantPayload = {
      name: name.trim(),
      slug: slug.trim(),
      legalEntityName: legalEntityName.trim(),
      gstin: gstin.trim() || undefined,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      domain: domain.trim() || undefined,
      plan,
      primaryStore: {
        name: storeName.trim(),
        code: storeCode.trim(),
        addressLine1: addressLine1.trim() || "Main Bazaar Mall Road",
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      adminUser: {
        fullName: adminName.trim(),
        email: adminEmail.trim(),
        phoneNumber: adminPhone.trim() || contactPhone.trim(),
        password: adminPassword,
      },
    };

    onboardMutation.mutate(payload);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#F8F7F5",
    border: "1px solid #E5E1D8",
    borderRadius: "8px",
    padding: "9px 12px",
    color: "#111412",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#7A807C",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
    fontWeight: 600,
    letterSpacing: "0.04em",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#111412",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid #F0EDE6",
    paddingBottom: "8px",
    marginBottom: "12px",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard Commercial Merchant Tenant"
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {formError && (
          <div
            style={{
              padding: "10px 14px",
              background: "#FFF1F0",
              border: "1px solid #FFA39E",
              borderRadius: "8px",
              color: "#CF1322",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={15} />
            <span>{formError}</span>
          </div>
        )}

        {/* Section 1: Tenant Information */}
        <div>
          <div style={sectionHeaderStyle}>
            <Building2 size={15} color="#C5A15B" />
            <span>1. Commercial Entity & Subdomain Setup</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Brand Display Name *</label>
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
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Tenant Slug (Subdomain) *</label>
              <input
                type="text"
                placeholder="bagodi-bidar"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                style={{ ...inputStyle, color: "#E31B23", fontFamily: "var(--font-mono)", fontWeight: 600 }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Registered Legal Entity *</label>
              <input
                type="text"
                placeholder="e.g. TechMasters Innovations Private Limited"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>GSTIN / Tax ID</label>
              <input
                type="text"
                placeholder="29AABCB1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Contact Email *</label>
              <input
                type="email"
                placeholder="billing@bagodi.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Contact Mobile *</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Custom Domain (Optional)</label>
              <input
                type="text"
                placeholder="store.bagodi.in"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Subscription Tier</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as TenantPlan)}
                style={inputStyle}
              >
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise Flagship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Primary Flagship Store */}
        <div>
          <div style={sectionHeaderStyle}>
            <Store size={15} color="#C5A15B" />
            <span>2. Primary Physical Storefront & Mall Address</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Store Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Store Code (POS Terminal) *</label>
              <input
                type="text"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Address Line 1</label>
              <input
                type="text"
                placeholder="Shop No. 12, Bagodi Shopping Mall"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Postal Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Primary Merchant Owner / Manager Account */}
        <div>
          <div style={sectionHeaderStyle}>
            <User size={15} color="#C5A15B" />
            <span>3. Primary Store Manager Access Credentials</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Manager Full Name *</label>
              <input
                type="text"
                placeholder="Rajesh Sharma"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Manager Email (Login) *</label>
              <input
                type="email"
                placeholder="manager@bagodi.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Mobile Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Temporary Master Password *</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", borderTop: "1px solid #F0EDE6", paddingTop: "16px" }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ color: "#7A807C" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={onboardMutation.isPending}
            style={{ background: "#E31B23", borderColor: "#E31B23" }}
          >
            Provision Commercial Tenant
          </Button>
        </div>
      </form>
    </Modal>
  );
};
