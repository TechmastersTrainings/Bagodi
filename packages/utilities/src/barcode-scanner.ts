/**
 * Hardware Barcode Scanner Listener Hook (USB / Bluetooth Keyboard Emulation)
 * Accurately captures high-speed input streams terminated with 'Enter' key.
 */

import { useEffect, useRef } from "react";

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number; // Maximum ms between keypresses to qualify as hardware scan
  enabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  minChars = 4,
  maxIntervalMs = 50,
  enabled = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore navigation / modifier keys
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
        return;
      }

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minChars) {
          const barcode = bufferRef.current.trim();
          bufferRef.current = "";
          onScan(barcode);
        } else {
          bufferRef.current = "";
        }
        return;
      }

      // If typed characters are spaced out more than maxIntervalMs, reset buffer (user is manual typing)
      if (interval > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan, minChars, maxIntervalMs, enabled]);
}

