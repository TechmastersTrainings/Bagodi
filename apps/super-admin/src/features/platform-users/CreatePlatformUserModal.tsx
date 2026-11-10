import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { CreatePlatformUserPayload, PlatformRole, PlatformUser } from "@bagodi/shared-types";
import { Modal, Button } from "@bagodi/shared-components";
import { AlertTriangle, ShieldCheck } from "lucide-react";

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Authorize Platform Super User" maxWidth="540px">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Operator Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Anand Kulkarni"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Corporate Email *
          </label>
          <input
            type="email"
            placeholder="operator@techmasters.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Assigned Platform Governance Role *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
            style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
          >
            <option value="SUPER_ADMIN">Super Administrator (Full Root Access)</option>
            <option value="PLATFORM_OPERATIONS">Platform Operations (Tenant & Logistics)</option>
            <option value="SECURITY_AUDITOR">Security & Compliance Auditor (Read-Only)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--color-muted-grey)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Temporary Password (Optional)
          </label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            style={{ width: "100%", background: "#121413", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-md)", padding: "10px 12px", color: "#FFFFFF", fontSize: "13px", outline: "none" }}
          />
        </div>

        {formError && (
          <div style={{ color: "#FF8F8F", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {formError}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending} leftIcon={<ShieldCheck size={14} />}>
            Issue Platform Operator Access
          </Button>
        </div>
      </form>
    </Modal>
  );
};
