import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.techmasters.bagodi",
  appName: "Bagodi Luxury Fashion",
  webDir: "../customer-web/dist",
  server: {
    androidScheme: "https",
    cleartext: process.env.NODE_ENV !== "production",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#202321",
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#202321",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;

