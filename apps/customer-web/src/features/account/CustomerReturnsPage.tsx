import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defaultApiClient } from "@bagodi/api-client";
import { Order, OrderItem } from "@bagodi/shared-types";
import { Button, EmptyState, ApiErrorCard, SkeletonLine } from "@bagodi/shared-components";
import { AccountNavTabs } from "./AccountNavTabs";
import {
  RotateCcw,
  RefreshCw,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { formatINR, formatDateTime } from "@bagodi/utilities";
import styles from "./CustomerReturnsPage.module.css";

interface ReturnRequestRecord {
  id: string;
  order_id: string;
  order_item_id: string;
  request_type: "RETURN" | "EXCHANGE";
  reason: string;
  detailed_reason?: string;
  requested_size?: string;
  status: string;
  refund_amount?: number;
  admin_notes?: string;
  pickup_tracking_id?: string;
  created_at: string;
}

export const CustomerReturnsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"NEW" | "TRACK">("NEW");

  // Load customer orders for selecting an item to return/replace
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery<Order[]>({
    queryKey: ["customer-orders"],
    queryFn: () => defaultApiClient.get<Order[]>("/customer/orders"),
  });

  // Load submitted return requests
  const {
    data: returnRequests = [],
    isLoading: isReturnsLoading,
    error: returnsError,
    refetch: refetchReturns,
  } = useQuery<ReturnRequestRecord[]>({
    queryKey: ["customer-returns"],
    queryFn: async () => {
      try {
        return await defaultApiClient.get<ReturnRequestRecord[]>("/customer/returns");
      } catch {
        return [];
      }
    },
  });

  // Return Form State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [requestType, setRequestType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [reason, setReason] = useState<string>("SIZE_FIT_ISSUE");
  const [requestedSize, setRequestedSize] = useState<string>("");
  const [detailedReason, setDetailedReason] = useState<string>("");
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  // Submit Return Mutation
  const submitReturnMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder || !selectedItem) {
        throw new Error("Please select an order and item.");
      }
      return defaultApiClient.post(`/orders/${selectedOrder.orderNumber}/returns`, {
        order_item_id: selectedItem.id,
        request_type: requestType,
        reason,
        detailed_reason: detailedReason.trim() || undefined,
        requested_size: requestType === "EXCHANGE" ? requestedSize.trim() || undefined : undefined,
      });
    },
    onSuccess: () => {
      setSubmitSuccessMsg(
        `Your ${requestType === "RETURN" ? "return & refund" : "size replacement"} request has been received. Our Bidar boutique team will review and schedule your doorstep pickup.`
      );
      setSubmitErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["customer-returns"] });
      // Reset form
      setSelectedOrder(null);
      setSelectedItem(null);
      setDetailedReason("");
      setRequestedSize("");
      // Switch to tracking tab
      setTimeout(() => {
        setActiveSubTab("TRACK");
      }, 1500);
    },
    onError: (err: any) => {
      setSubmitErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        "Could not submit return request. A request may already be active for this item."
      );
    },
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);

    if (!selectedOrder) {
      setSubmitErrorMsg("Please choose an order from the list.");
      return;
    }
    if (!selectedItem) {
      setSubmitErrorMsg("Please select the specific garment you wish to return or exchange.");
      return;
    }
    submitReturnMutation.mutate();
  };

  const reasonLabels: Record<string, string> = {
    SIZE_FIT_ISSUE: "Size or Fit issue (Too tight / Too loose)",
    DEFECTIVE: "Defective or damaged fabric on delivery",
    WRONG_ITEM: "Wrong size, color or item delivered",
    FABRIC_QUALITY: "Fabric quality not as described",
    COLOR_MISMATCH: "Color mismatch with display pictures",
    CHANGED_MIND: "Changed mind / Preference issue",
  };

  return (
    <div className={styles.returnsContainer}>
      <div className={styles.headerSection}>
        <div className={styles.pageSuperTitle}>Bagodi Atelier Concierge</div>
        <h1 className={styles.pageTitle}>Return & Replace</h1>
        <p className={styles.pageSubtitle}>
          Request doorstep garment returns or size exchanges with our certified Raymond & authentic Indian couture guarantee.
        </p>
      </div>

      {/* Navigation Tabs */}
      <AccountNavTabs />

      {/* Sub-Tabs: Submit Request vs Track Requests */}
      <div className={styles.subTabSwitch}>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === "NEW" ? styles.subTabBtnActive : ""}`}
          onClick={() => setActiveSubTab("NEW")}
        >
          <RotateCcw size={15} />
          <span>Request Return / Replace</span>
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === "TRACK" ? styles.subTabBtnActive : ""}`}
          onClick={() => setActiveSubTab("TRACK")}
        >
          <Clock size={15} />
          <span>My Requests {returnRequests.length > 0 ? `(${returnRequests.length})` : ""}</span>
        </button>
      </div>

      {/* SUB-VIEW 1: SUBMIT NEW REQUEST */}
      {activeSubTab === "NEW" && (
        <div>
          {submitSuccessMsg && (
            <div className={styles.cardShell} style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#065F46" }}>
                <CheckCircle2 size={20} />
                <span style={{ fontWeight: 600 }}>{submitSuccessMsg}</span>
              </div>
            </div>
          )}

          {submitErrorMsg && (
            <div className={styles.cardShell} style={{ background: "#FEF2F2", borderColor: "#FCA5A5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#B91C1C" }}>
                <AlertCircle size={20} />
                <span>{submitErrorMsg}</span>
              </div>
            </div>
          )}

          {isOrdersLoading ? (
            <div className={styles.cardShell}>
              <SkeletonLine height="32px" width="260px" />
              <div style={{ marginTop: 16 }}>
                <SkeletonLine height="100px" width="100%" />
              </div>
            </div>
          ) : ordersError ? (
            <ApiErrorCard message="Could not load orders history." />
          ) : orders.length === 0 ? (
            <div className={styles.cardShell}>
              <EmptyState
                title="No Orders Available for Return"
                description="Once you place and receive garments from Bagodi, they will appear here for returns or size exchanges."
                icon={<Package size={36} />}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest}>
              {/* Step 1: Select Order */}
              <section className={styles.cardShell}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleArea}>
                    <Package size={20} className={styles.cardIcon} />
                    <h2 className={styles.cardTitle}>1. Select Order</h2>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        className={`${styles.orderCardSelectable} ${isSelected ? styles.orderCardSelected : ""}`}
                        onClick={() => {
                          setSelectedOrder(order);
                          setSelectedItem(null);
                        }}
                      >
                        <div className={styles.orderRowHeader}>
                          <div>
                            <span className={styles.orderNumText}>Order #{order.orderNumber}</span>
                            <div className={styles.orderDateText}>{formatDateTime(order.createdAt)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{formatINR(order.grandTotal)}</span>
                            <div style={{ fontSize: 11, color: "#6B7280" }}>{order.items?.length || 0} items • {order.status}</div>
                          </div>
                        </div>

                        {/* Items inside this selected order */}
                        {isSelected && order.items && order.items.length > 0 && (
                          <div style={{ marginTop: 12, borderTop: "1px solid #ECEAE6", paddingTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                              Select Item to Return or Replace:
                            </div>
                            <div className={styles.itemPickerGrid}>
                              {order.items.map((item: any) => {
                                const isPicked = selectedItem?.id === item.id;
                                const prodName = item.productName || item.product_name || "Boutique Garment";
                                const variantName = item.variantName || item.variant_name || "";
                                const unitPrice = item.unitPrice || item.unit_price || 0;

                                return (
                                  <div
                                    key={item.id}
                                    className={`${styles.itemCardPickable} ${isPicked ? styles.itemCardPicked : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedItem(item);
                                    }}
                                  >
                                    <div className={styles.itemInfo}>
                                      <div className={styles.itemTitle}>{prodName}</div>
                                      {variantName && <div className={styles.itemMeta}>{variantName}</div>}
                                      <div className={styles.itemMeta}>Qty: {item.quantity}</div>
                                    </div>
                                    <div className={styles.itemPrice}>{formatINR(unitPrice)}</div>
                                    <div style={{ marginLeft: 8 }}>
                                      <input
                                        type="radio"
                                        name="selectedGarmentItem"
                                        checked={isPicked}
                                        onChange={() => setSelectedItem(item)}
                                        style={{ accentColor: "#A51F27", width: 16, height: 16 }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Step 2: Choose Request Type & Reason */}
              {selectedItem && (
                <section className={styles.cardShell}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <RotateCcw size={20} className={styles.cardIcon} />
                      <h2 className={styles.cardTitle}>2. Choose Return or Replace Option</h2>
                    </div>
                  </div>

                  <div className={styles.radioGroup}>
                    <div
                      className={`${styles.radioOptionCard} ${requestType === "RETURN" ? styles.radioOptionCardSelected : ""}`}
                      onClick={() => setRequestType("RETURN")}
                    >
                      <RotateCcw size={20} color="#A51F27" />
                      <div className={styles.radioOptionText}>
                        <span className={styles.radioOptionTitle}>Return for Refund</span>
                        <span className={styles.radioOptionDesc}>Pickup scheduled from address; refund issued to original payment / bank.</span>
                      </div>
                    </div>

                    <div
                      className={`${styles.radioOptionCard} ${requestType === "EXCHANGE" ? styles.radioOptionCardSelected : ""}`}
                      onClick={() => setRequestType("EXCHANGE")}
                    >
                      <RefreshCw size={20} color="#A51F27" />
                      <div className={styles.radioOptionText}>
                        <span className={styles.radioOptionTitle}>Replace / Size Exchange</span>
                        <span className={styles.radioOptionDesc}>Exchange item for a different size or replacement unit.</span>
                      </div>
                    </div>
                  </div>

                  {requestType === "EXCHANGE" && (
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Requested Size / Variant Details *</label>
                      <input
                        type="text"
                        required
                        className={styles.inputControl}
                        value={requestedSize}
                        onChange={(e) => setRequestedSize(e.target.value)}
                        placeholder="e.g. Need Size 42 instead of 40 (or standard Size L)"
                      />
                    </div>
                  )}

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Reason for {requestType === "RETURN" ? "Return" : "Exchange"} *</label>
                    <select
                      className={styles.selectControl}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      {Object.entries(reasonLabels).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Detailed Comments / Instructions (Optional)</label>
                    <textarea
                      className={styles.textareaControl}
                      value={detailedReason}
                      onChange={(e) => setDetailedReason(e.target.value)}
                      placeholder="Please share any additional details regarding fit, packaging, or doorstep pickup timing..."
                    />
                  </div>

                  <div style={{ marginTop: "var(--space-6)" }}>
                    <Button
                      type="submit"
                      size="lg"
                      isLoading={submitReturnMutation.isPending}
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Submit {requestType === "RETURN" ? "Return Request" : "Replacement Request"}
                    </Button>
                  </div>
                </section>
              )}
            </form>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: TRACK SUBMITTED REQUESTS */}
      {activeSubTab === "TRACK" && (
        <div>
          {isReturnsLoading ? (
            <div className={styles.cardShell}>
              <SkeletonLine height="80px" width="100%" />
            </div>
          ) : returnsError ? (
            <ApiErrorCard
              message="Failed to load your return requests."
              onRetry={() => refetchReturns()}
            />
          ) : returnRequests.length === 0 ? (
            <div className={styles.cardShell}>
              <EmptyState
                title="No Active Return or Replacement Requests"
                description="When you submit requests for returns or garment size exchanges, their real-time review, pickup status, and completion timeline will appear here."
                icon={<RotateCcw size={36} />}
              />
            </div>
          ) : (
            <div>
              {returnRequests.map((req) => {
                const isReturn = req.request_type === "RETURN";
                const statusUpper = req.status.toUpperCase();

                let badgeClass = styles.statusRequested;
                let badgeLabel = "Review in Progress";

                if (statusUpper === "APPROVED") {
                  badgeClass = styles.statusApproved;
                  badgeLabel = "Approved - Pickup Scheduled";
                } else if (statusUpper === "PICKED_UP" || statusUpper === "RECEIVED") {
                  badgeClass = styles.statusPickedUp;
                  badgeLabel = "Picked Up from Address";
                } else if (statusUpper === "COMPLETED") {
                  badgeClass = styles.statusCompleted;
                  badgeLabel = isReturn ? "Refund Completed" : "Exchange Completed";
                } else if (statusUpper === "REJECTED" || statusUpper === "CANCELLED") {
                  badgeClass = styles.statusRejected;
                  badgeLabel = "Declined";
                }

                return (
                  <div key={req.id} className={styles.returnCard}>
                    <div className={styles.returnCardHeader}>
                      <div>
                        <span className={styles.returnIdText}>Request ID: #{req.id.slice(0, 8).toUpperCase()}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginTop: 2 }}>
                          {isReturn ? "Return & Refund" : "Garment Replacement"}
                        </div>
                      </div>
                      <span className={`${styles.returnBadge} ${badgeClass}`}>{badgeLabel}</span>
                    </div>

                    <div className={styles.returnBodyGrid}>
                      <div className={styles.returnDetailItem}>
                        <span className={styles.returnDetailLabel}>Reason: </span>
                        <span>{reasonLabels[req.reason] || req.reason}</span>
                      </div>
                      <div className={styles.returnDetailItem}>
                        <span className={styles.returnDetailLabel}>Submitted On: </span>
                        <span>{formatDateTime(req.created_at)}</span>
                      </div>
                      {req.requested_size && (
                        <div className={styles.returnDetailItem}>
                          <span className={styles.returnDetailLabel}>Requested Size: </span>
                          <span>{req.requested_size}</span>
                        </div>
                      )}
                      {req.refund_amount && (
                        <div className={styles.returnDetailItem}>
                          <span className={styles.returnDetailLabel}>Refund Amount: </span>
                          <span style={{ color: "#065F46", fontWeight: 700 }}>{formatINR(req.refund_amount)}</span>
                        </div>
                      )}
                      {req.pickup_tracking_id && (
                        <div className={styles.returnDetailItem}>
                          <span className={styles.returnDetailLabel}>Pickup Tracking ID: </span>
                          <span>{req.pickup_tracking_id}</span>
                        </div>
                      )}
                    </div>

                    {req.detailed_reason && (
                      <div className={styles.notesBlock}>
                        <strong>Customer Notes:</strong> {req.detailed_reason}
                      </div>
                    )}

                    {req.admin_notes && (
                      <div className={styles.notesBlock} style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", color: "#166534" }}>
                        <strong>Boutique Concierge Update:</strong> {req.admin_notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
