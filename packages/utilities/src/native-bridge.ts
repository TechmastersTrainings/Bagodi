/**
 * Bagodi Native Mobile Bridge
 * High-performance Capacitor hardware integration for Android application shell.
 * Transparently degrades to safe browser fallbacks on standard desktop/mobile web.
 */

const getGlobalCapacitor = () => {
  if (typeof window !== "undefined" && (window as any).Capacitor) {
    return (window as any).Capacitor;
  }
  return null;
};

const getPlugin = (name: string): any | null => {
  const cap = getGlobalCapacitor();
  if (cap) {
    return cap.Plugins?.[name] || null;
  }
  return null;
};

/**
 * Returns true if running within the native Android or iOS application container.
 */
export function isNativePlatform(): boolean {
  const cap = getGlobalCapacitor();
  return Boolean(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

export type HapticType = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";

/**
 * Triggers physical haptic feedback for user interactions (Add to Bag, Wishlist, Size Selection).
 */
export async function triggerHaptic(type: HapticType = "light"): Promise<void> {
  try {
    const Haptics = getPlugin("Haptics");
    if (isNativePlatform() && Haptics) {
      switch (type) {
        case "light":
          await Haptics.impact?.({ style: "LIGHT" });
          break;
        case "medium":
          await Haptics.impact?.({ style: "MEDIUM" });
          break;
        case "heavy":
          await Haptics.impact?.({ style: "HEAVY" });
          break;
        case "selection":
          await Haptics.selectionStart?.();
          await Haptics.selectionChanged?.();
          await Haptics.selectionEnd?.();
          break;
        case "success":
          await Haptics.notification?.({ type: "SUCCESS" });
          break;
        case "warning":
          await Haptics.notification?.({ type: "WARNING" });
          break;
        case "error":
          await Haptics.notification?.({ type: "ERROR" });
          break;
      }
    } else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
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
    const StatusBar = getPlugin("StatusBar");
    if (isNativePlatform() && StatusBar) {
      if (theme === "dark") {
        await StatusBar.setStyle?.({ style: "DARK" });
        await StatusBar.setBackgroundColor?.({ color: "#202321" });
      } else {
        await StatusBar.setStyle?.({ style: "LIGHT" });
        await StatusBar.setBackgroundColor?.({ color: "#F7F1E7" });
      }
    }
  } catch {
    // Fallback if not supported
  }
}

/**
 * Connects the Android hardware back button to React Router and modal controllers.
 */
export function setupHardwareBackButton(
  navigate: (delta: number) => void,
  canGoBackCheck: () => boolean
): () => void {
  if (!isNativePlatform()) {
    return () => {};
  }

  const App = getPlugin("App");
  if (!App || typeof App.addListener !== "function") {
    return () => {};
  }

  let lastBackPressTime = 0;

  const listenerHandle = App.addListener("backButton", (data: { canGoBack?: boolean }) => {
    const canGoBack = Boolean(data?.canGoBack);
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
      App.exitApp?.();
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
    Promise.resolve(listenerHandle).then((h: any) => h?.remove?.()).catch(() => {});
  };
}

/**
 * Handles incoming Android deep links (bagodi://product/:id or https://bagodi.in/product/:id).
 */
export function setupDeepLinkListener(navigate: (path: string) => void): () => void {
  if (!isNativePlatform()) {
    return () => {};
  }

  const App = getPlugin("App");
  if (!App || typeof App.addListener !== "function") {
    return () => {};
  }

  const listenerHandle = App.addListener("appUrlOpen", (event: { url: string }) => {
    try {
      const url = new URL(event.url);
      const pathname = url.pathname;
      const search = url.search;
      if (pathname) {
        navigate(pathname + search);
        triggerHaptic("selection");
      }
    } catch {
      const slug = event.url.replace(/^bagodi:\/\//, "/");
      if (slug) {
        navigate(slug);
        triggerHaptic("selection");
      }
    }
  });

  return () => {
    Promise.resolve(listenerHandle).then((h: any) => h?.remove?.()).catch(() => {});
  };
}

/**
 * Native Secure Token Storage Adapter
 */
export async function saveSecureToken(key: string, value: string): Promise<void> {
  const Preferences = getPlugin("Preferences");
  if (isNativePlatform() && Preferences) {
    await Preferences.set?.({ key, value });
  } else {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Memory fallback
    }
  }
}

export async function getSecureToken(key: string): Promise<string | null> {
  const Preferences = getPlugin("Preferences");
  if (isNativePlatform() && Preferences) {
    const res = await Preferences.get?.({ key });
    return res?.value ?? null;
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function removeSecureToken(key: string): Promise<void> {
  const Preferences = getPlugin("Preferences");
  if (isNativePlatform() && Preferences) {
    await Preferences.remove?.({ key });
  } else {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

