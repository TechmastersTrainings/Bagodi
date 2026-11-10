/**
 * Bagodi Native Mobile Bridge
 * High-performance Capacitor hardware integration for Android application shell.
 * Transparently degrades to safe browser fallbacks on standard desktop/mobile web.
 */

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";

/**
 * Returns true if running within the native Android or iOS application container.
 */
export function isNativePlatform(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/**
 * Triggers physical haptic feedback for user interactions (Add to Bag, Wishlist, Size Selection).
 */
export async function triggerHaptic(
  type: "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error" = "light"
): Promise<void> {
  try {
    if (isNativePlatform()) {
      switch (type) {
        case "light":
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case "medium":
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "heavy":
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case "selection":
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          await Haptics.selectionEnd();
          break;
        case "success":
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case "warning":
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case "error":
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // Safe fallback on mobile browsers
      navigator.vibrate(type === "heavy" ? 40 : 15);
    }
  } catch {
    // Safe no-op if device does not support haptics
  }
}

/**
 * Configures the Android system status bar matching the Bagodi Obsidian / Ivory luxury theme.
 */
export async function configureNativeStatusBar(theme: "dark" | "light" = "dark"): Promise<void> {
  try {
    if (isNativePlatform()) {
      if (theme === "dark") {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#202321" });
      } else {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#F7F1E7" });
      }
    }
  } catch {
    // Fallback if not supported
  }
}

/**
 * Connects the Android hardware back button to React Router and modal controllers.
 * - Dismisses open modals / drawers first.
 * - Navigates backward in history if available.
 * - Prompts or exits if on root screen.
 */
export function setupHardwareBackButton(
  navigate: (delta: number) => void,
  canGoBackCheck: () => boolean
): () => void {
  if (!isNativePlatform()) {
    return () => {};
  }

  let lastBackPressTime = 0;

  const listenerHandle = App.addListener("backButton", ({ canGoBack }) => {
    // 1. Check if any modal or bottom sheet is open in DOM
    const openModal = document.querySelector("[role='dialog'][aria-modal='true']");
    if (openModal) {
      const closeBtn = openModal.querySelector<HTMLButtonElement>("button[aria-label='Close'], [data-close-modal]");
      if (closeBtn) {
        closeBtn.click();
        triggerHaptic("light");
        return;
      }
    }

    // 2. If browser history allows going back
    if (canGoBack && canGoBackCheck()) {
      navigate(-1);
      triggerHaptic("selection");
      return;
    }

    // 3. Double-tap to exit app on root screen
    const now = Date.now();
    if (now - lastBackPressTime < 2000) {
      App.exitApp();
    } else {
      lastBackPressTime = now;
      triggerHaptic("warning");
      const exitBanner = document.createElement("div");
      exitBanner.innerText = "Press back again to exit Bagodi";
      exitBanner.style.position = "fixed";
      exitBanner.style.bottom = "80px";
      exitBanner.style.left = "50%";
      exitBanner.style.transform = "translateX(-50%)";
      exitBanner.style.backgroundColor = "rgba(32, 35, 33, 0.95)";
      exitBanner.style.color = "#C5A15B";
      exitBanner.style.padding = "8px 18px";
      exitBanner.style.borderRadius = "20px";
      exitBanner.style.fontSize = "12px";
      exitBanner.style.fontWeight = "600";
      exitBanner.style.letterSpacing = "0.04em";
      exitBanner.style.zIndex = "10000";
      exitBanner.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
      document.body.appendChild(exitBanner);
      setTimeout(() => {
        exitBanner.remove();
      }, 2000);
    }
  });

  return () => {
    listenerHandle.then((h) => h.remove()).catch(() => {});
  };
}

/**
 * Handles incoming Android deep links (bagodi://product/:id or https://bagodi.in/product/:id).
 */
export function setupDeepLinkListener(navigate: (path: string) => void): () => void {
  if (!isNativePlatform()) {
    return () => {};
  }

  const listenerHandle = App.addListener("appUrlOpen", (event) => {
    try {
      const url = new URL(event.url);
      const pathname = url.pathname;
      const search = url.search;
      if (pathname) {
        navigate(pathname + search);
        triggerHaptic("selection");
      }
    } catch {
      // Direct path handling for custom schema bagodi://product/xyz
      const slug = event.url.replace(/^bagodi:\/\//, "/");
      if (slug) {
        navigate(slug);
        triggerHaptic("selection");
      }
    }
  });

  return () => {
    listenerHandle.then((h) => h.remove()).catch(() => {});
  };
}

/**
 * Native Secure Token Storage Adapter (Android SharedPreferences via @capacitor/preferences)
 */
export async function saveSecureToken(key: string, value: string): Promise<void> {
  if (isNativePlatform()) {
    await Preferences.set({ key, value });
  } else {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Memory fallback
    }
  }
}

export async function getSecureToken(key: string): Promise<string | null> {
  if (isNativePlatform()) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function removeSecureToken(key: string): Promise<void> {
  if (isNativePlatform()) {
    await Preferences.remove({ key });
  } else {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

