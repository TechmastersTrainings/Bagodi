/**
 * Bagodi Design System
 * Pure CSS design tokens, typography, 3D elevation and tactile animations
 */

export const DESIGN_TOKENS = {
  colors: {
    accent: "var(--accent-primary)",
    accentHover: "var(--accent-primary-hover)",
    accentContrast: "var(--accent-contrast)",
    surface: "var(--bg-surface)",
    secondary: "var(--bg-secondary)",
    border: "var(--border-default)",
  },
  elevation: {
    perspective: "var(--perspective-default)",
    spring: "var(--ease-spring)",
  },
} as const;

