# Bagodi Customer Android Application (Capacitor)

This mobile package wraps `@bagodi/customer-web` using **Capacitor 6** to deliver an installable Android build without code duplication.

## 1. Prerequisites
- **Android Studio** (Koala / Ladybug or newer)
- **Android SDK** API 34+
- **Java Development Kit (JDK)** 17 or 21

## 2. Sync and Build Pipeline
```bash
# 1. Build customer web bundle
npm run build:customer

# 2. Open Android Studio
npm run cap:open
```

## 3. Play Store Release Checklist
1. **Keystore Signing**: Generate release key via `keytool`:
   ```bash
   keytool -genkey -v -keystore bagodi-release.jks -alias bagodi -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **App Icons & Splash Screen**:
   Place source icon (`1024x1024`) and splash (`2732x2732`) in `resources/` and run:
   ```bash
   npx @capacitor/assets generate --android
   ```
3. **Android App Bundle (AAB)**:
   In Android Studio: `Build > Generate Signed Bundle / APK > Android App Bundle`.

