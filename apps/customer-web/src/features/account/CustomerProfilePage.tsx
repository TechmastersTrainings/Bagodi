import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import { Address } from "@bagodi/shared-types";
import { Button, TextInput, ApiErrorCard, SkeletonLine } from "@bagodi/shared-components";
import { AccountNavTabs } from "./AccountNavTabs";
import {
  User,
  Mail,
  Smartphone,
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  Star,
  ShieldCheck,
  X,
  AlertCircle,
} from "lucide-react";
import styles from "./CustomerProfilePage.module.css";

interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
}

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Profile Form State
  const initialName = user?.fullName || (user as any)?.display_name || "";
  const initialEmail = user?.email || "";
  const userPhone = user?.phone || (user as any)?.phone_e164 || "";

  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || (user as any)?.display_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; email: string }) =>
      defaultApiClient.patch("/auth/me", {
        fullName: data.fullName,
        displayName: data.fullName,
        email: data.email,
      }),
    onSuccess: (res: any, variables: { fullName: string; email: string }) => {
      setProfileSuccessMsg("Profile information updated successfully.");
      setProfileErrorMsg(null);
      // Update cached user in localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const cachedUser = JSON.parse(localStorage.getItem("bagodi_auth_user") || "{}");
          const updated = {
            ...cachedUser,
            fullName: variables.fullName,
            display_name: variables.fullName,
            email: variables.email,
          };
          localStorage.setItem("bagodi_auth_user", JSON.stringify(updated));
        } catch {}
      }
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setProfileErrorMsg(err?.message || "Failed to update profile details. Please try again.");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    if (!fullName.trim()) {
      setProfileErrorMsg("Full name cannot be empty.");
      return;
    }
    updateProfileMutation.mutate({ fullName: fullName.trim(), email: email.trim() });
  };

  // Saved Addresses Query
  const {
    data: savedAddresses = [],
    isLoading: isAddressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery<Address[]>({
    queryKey: ["customer-addresses"],
    queryFn: () => defaultApiClient.get<Address[]>("/customer/addresses"),
  });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    fullName: initialName,
    phoneNumber: userPhone.replace(/^\+91/, ""),
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "Bidar",
    state: "Karnataka",
    postalCode: "",
    addressType: "home",
    isDefault: savedAddresses.length === 0,
  });
  const [addressFormError, setAddressFormError] = useState<string | null>(null);

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      defaultApiClient.post<Address>("/customer/addresses", {
        full_name: data.fullName,
        phone: data.phoneNumber,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        address_type: data.addressType,
        is_default: data.isDefault,
      }),
    onSuccess: () => {
      refetchAddresses();
      setIsAddressModalOpen(false);
      setAddressFormData({
        fullName: initialName,
        phoneNumber: userPhone.replace(/^\+91/, ""),
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "Bidar",
        state: "Karnataka",
        postalCode: "",
        addressType: "home",
        isDefault: false,
      });
    },
    onError: (err: any) => {
      setAddressFormError(err?.message || "Failed to save address. Please check all fields.");
    },
  });

  // Set Default Address Mutation
  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) =>
      defaultApiClient.post(`/customer/addresses/${addressId}/default`),
    onSuccess: () => {
      refetchAddresses();
    },
  });

  // Delete Address Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) =>
      defaultApiClient.delete(`/customer/addresses/${addressId}`),
    onSuccess: () => {
      refetchAddresses();
    },
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressFormError(null);
    if (!addressFormData.fullName.trim() || !addressFormData.phoneNumber.trim() || !addressFormData.addressLine1.trim() || !addressFormData.postalCode.trim()) {
      setAddressFormError("Please fill in recipient name, mobile, address, and 6-digit PIN code.");
      return;
    }
    addAddressMutation.mutate(addressFormData);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.headerSection}>
        <div className={styles.pageSuperTitle}>Bagodi Atelier Profile</div>
        <h1 className={styles.pageTitle}>Customer Account</h1>
        <p className={styles.pageSubtitle}>
          Manage your luxury boutique profile credentials, authenticated contact information, and saved delivery addresses.
        </p>
      </div>

      {/* Navigation Tabs */}
      <AccountNavTabs />

      {/* Section 1: Customer Personal Details */}
      <section className={styles.cardShell}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleArea}>
            <User size={20} className={styles.cardIcon} />
            <div>
              <h2 className={styles.cardTitle}>Personal Information</h2>
              <p className={styles.cardSubtitle}>Your authenticated credentials for orders, invoices, and boutique concierge.</p>
            </div>
          </div>
        </div>

        {profileSuccessMsg && (
          <div className={styles.feedbackBanner}>
            <CheckCircle2 size={16} />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {profileErrorMsg && (
          <div className={styles.feedbackBanner} style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}>
            <AlertCircle size={16} />
            <span>{profileErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className={`${styles.formGrid} ${styles.formGridTwoCol}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                type="text"
                className={styles.inputControl}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span>Registered Mobile</span>
                <span className={styles.verifiedPill}>
                  <ShieldCheck size={11} />
                  Verified OTP
                </span>
              </label>
              <input
                type="text"
                disabled
                className={`${styles.inputControl} ${styles.inputControlDisabled}`}
                value={userPhone ? (userPhone.startsWith("+91") ? userPhone : `+91 ${userPhone}`) : "Not Registered"}
                title="Mobile number is verified via OTP authentication and cannot be changed here."
              />
            </div>

            <div className={styles.fieldGroup} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Email Address</label>
              <input
                type="email"
                className={styles.inputControl}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. client@example.com"
              />
            </div>
          </div>

          <div className={styles.saveActionRow}>
            <Button
              type="submit"
              size="md"
              isLoading={updateProfileMutation.isPending}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </section>

      {/* Section 2: Saved Delivery Addresses */}
      <section className={styles.cardShell}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleArea}>
            <MapPin size={20} className={styles.cardIcon} />
            <div>
              <h2 className={styles.cardTitle}>Saved Delivery Addresses</h2>
              <p className={styles.cardSubtitle}>Addresses saved for expedited boutique dispatch and checkout.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddressModalOpen(true)}
          >
            Add New Address
          </Button>
        </div>

        {isAddressesLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonLine height="80px" width="100%" />
            <SkeletonLine height="80px" width="100%" />
          </div>
        ) : addressesError ? (
          <ApiErrorCard
            message="Could not load saved delivery addresses."
            onRetry={() => refetchAddresses()}
          />
        ) : savedAddresses.length === 0 ? (
          <div style={{ padding: "var(--space-8)", textAlign: "center", background: "#FAF8F5", borderRadius: "var(--radius-lg)" }}>
            <MapPin size={32} color="#A39A90" style={{ margin: "0 auto var(--space-2) auto" }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginBottom: 4 }}>No Addresses Saved</h3>
            <p style={{ fontSize: 13, color: "#777777", marginBottom: "var(--space-4)" }}>Add a shipping address to enjoy swift one-click order placement.</p>
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsAddressModalOpen(true)}
            >
              Add First Address
            </Button>
          </div>
        ) : (
          <div className={styles.addressGrid}>
            {savedAddresses.map((addr) => {
              const displayName = addr.fullName || (addr as any).full_name || "Valued Customer";
              const displayPhone = addr.phone || addr.phoneNumber || (addr as any).phone_number || "";
              const displayLine1 = addr.addressLine1 || (addr as any).address_line1 || "";
              const displayLine2 = addr.addressLine2 || (addr as any).address_line2 || "";
              const displayPin = addr.pincode || addr.postalCode || (addr as any).postal_code || "";
              const addressType = (addr as any).address_type || (addr as any).addressType || "home";

              return (
                <div
                  key={addr.id}
                  className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ""}`}
                >
                  <div>
                    <div className={styles.addressHeader}>
                      <span className={styles.recipientName}>{displayName}</span>
                      <div className={styles.badgeRow}>
                        <span className={styles.typeBadge}>{addressType}</span>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>
                    </div>
                    <div className={styles.addressBody}>
                      {displayLine1}
                      {displayLine2 && `, ${displayLine2}`}
                      {addr.landmark && `, near ${addr.landmark}`}
                      <br />
                      {addr.city}, {addr.state} - <strong>{displayPin}</strong>
                    </div>
                    <div className={styles.addressPhone}>Phone: {displayPhone}</div>
                  </div>

                  <div className={styles.addressActions}>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className={styles.actionBtnText}
                        onClick={() => setDefaultMutation.mutate(addr.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star size={13} /> Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${styles.actionBtnText} ${styles.actionBtnDelete}`}
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this delivery address?")) {
                          deleteAddressMutation.mutate(addr.id);
                        }
                      }}
                      disabled={deleteAddressMutation.isPending}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsAddressModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Delivery Address</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsAddressModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {addressFormError && (
              <div className={styles.feedbackBanner} style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C", marginBottom: "var(--space-4)" }}>
                <AlertCircle size={15} />
                <span>{addressFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddressSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.inputControl}
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className={styles.inputControl}
                    value={addressFormData.phoneNumber}
                    onChange={(e) => setAddressFormData({ ...addressFormData, phoneNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>House / Flat / Building / Street *</label>
                  <input
                    type="text"
                    required
                    className={styles.inputControl}
                    value={addressFormData.addressLine1}
                    onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                    placeholder="e.g. Shop #4, Near Shivaji Chowk"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Locality / Area (Optional)</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={addressFormData.addressLine2 || ""}
                    onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                    placeholder="e.g. Main Market"
                  />
                </div>

                <div className={`${styles.formGrid} ${styles.formGridTwoCol}`}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>City / District *</label>
                    <input
                      type="text"
                      required
                      className={styles.inputControl}
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      placeholder="Bidar"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>6-Digit PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className={styles.inputControl}
                      value={addressFormData.postalCode}
                      onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                      placeholder="585401"
                    />
                  </div>
                </div>

                <div className={`${styles.formGrid} ${styles.formGridTwoCol}`}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>State *</label>
                    <input
                      type="text"
                      required
                      className={styles.inputControl}
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                      placeholder="Karnataka"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Address Type</label>
                    <select
                      className={styles.inputControl}
                      value={addressFormData.addressType}
                      onChange={(e) => setAddressFormData({ ...addressFormData, addressType: e.target.value as any })}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work / Office</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#6A1A24" }}
                  />
                  <label htmlFor="isDefaultCheckbox" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>
                    Set as default delivery address
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="md"
                  isLoading={addAddressMutation.isPending}
                >
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
