import React from "react";
import { Modal, DataTable, Column } from "@bagodi/shared-components";
import { SizeChartMeasurement } from "@bagodi/shared-types";
import { Ruler } from "lucide-react";

export interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChart?: SizeChartMeasurement[];
}

type SizeChartRow = SizeChartMeasurement & { id: string };

const DEFAULT_MEASUREMENTS: SizeChartRow[] = [
  { id: "S", size: "S", chestInches: 38, waistInches: 32, lengthInches: 28, shoulderInches: 16.5 },
  { id: "M", size: "M", chestInches: 40, waistInches: 34, lengthInches: 29, shoulderInches: 17.5 },
  { id: "L", size: "L", chestInches: 42, waistInches: 36, lengthInches: 30, shoulderInches: 18.5 },
  { id: "XL", size: "XL", chestInches: 44, waistInches: 38, lengthInches: 31, shoulderInches: 19.5 },
  { id: "XXL", size: "XXL", chestInches: 46, waistInches: 40, lengthInches: 32, shoulderInches: 20.5 },
];

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  sizeChart,
}) => {
  const chartData: SizeChartRow[] = React.useMemo(() => {
    if (!sizeChart || sizeChart.length === 0) return DEFAULT_MEASUREMENTS;
    return sizeChart.map((m) => ({ ...m, id: m.size }));
  }, [sizeChart]);

  const columns: Column<SizeChartRow>[] = [
    { key: "size", header: "Size", render: (r) => <strong>{r.size}</strong> },
    { key: "chestInches", header: "Chest (in)", render: (r) => `${r.chestInches}"` },
    { key: "waistInches", header: "Waist (in)", render: (r) => `${r.waistInches}"` },
    { key: "lengthInches", header: "Length (in)", render: (r) => `${r.lengthInches}"` },
    { key: "shoulderInches", header: "Shoulder (in)", render: (r) => `${r.shoulderInches}"` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Garment Size & Measurement Guide" maxWidth="600px">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          <Ruler size={16} style={{ color: "var(--accent-primary)" }} />
          <span>All measurements are standard garment dimensions specified in inches.</span>
        </div>

        <DataTable columns={columns} data={chartData} />

        <div style={{ padding: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
          <strong>Fitting Advice:</strong> If you are between two sizes, we recommend choosing the larger size for a relaxed luxury fit. Custom tailors are also available at our Bidar Flagship Store.
        </div>
      </div>
    </Modal>
  );
};

