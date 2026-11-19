import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { CreatePlatformUserPayload, PlatformRole, PlatformUser } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { AlertTriangle } from "lucide-react";

export interface CreatePlatformUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlatformUserModal: React.FC<CreatePlatformUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PlatformRole>("PLATFORM_OPERATIONS");
  const [tempPassword, setTempPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CreatePlatformUserPayload) =>
      defaultApiClient.post<PlatformUser>("/super/platform-users", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-platform-users-list"] });
      onClose();
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || err?.message || "Failed to create platform administrator."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 2) {
      setFormError("Full name is required.");
      return;
    }

    const payload: CreatePlatformUserPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      tempPassword: tempPassword.trim() || undefined,
    };

    createMutation.mutate(payload);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Platform Operator Account"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

        <div>
          <label style={labelStyle}>Operator Full Name *</label>
          <input
            type="text"
            placeholder="Kavita Reddy"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Platform Email Address *</label>
          <input
            type="email"
            placeholder="kavita@techmasters.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Platform Governance Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
            style={inputStyle}
          >
            <option value="PLATFORM_OPERATIONS">Platform Operations Specialist</option>
            <option value="SECURITY_AUDITOR">Platform Security & Audit Officer</option>
            <option value="SUPER_ADMIN">TechMasters Master Super Administrator</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Initial Master Password *</label>
          <input
            type="password"
            placeholder="Min 10 characters with symbols"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", borderTop: "1px solid #F0EDE6", paddingTop: "16px" }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ color: "#7A807C" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
            style={{ background: "#E31B23", borderColor: "#E31B23" }}
          >
            Provision Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
