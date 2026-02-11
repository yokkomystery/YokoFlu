# Setup TODO Checklist

This checklist guides you through the required steps to get your project running.  
Mark completed items with a check (✅).

---

## 🔥 Firebase Setup (Required)

### 1. Configure in Firebase Console

{{#FIREBASE_ENABLED}}

- [ ] **Verify Firebase Project**
  - Go to Firebase Console (https://console.firebase.google.com/)
  - Ensure the project exists and is correct
    {{#ENVIRONMENT_SEPARATION}}
  - Staging project: `{{STAGING_PROJECT_ID}}`
  - Production project: `{{PRODUCTION_PROJECT_ID}}`
    {{/ENVIRONMENT_SEPARATION}}
    {{^ENVIRONMENT_SEPARATION}}
  - Project ID: `{{SINGLE_PROJECT_ID}}`
    {{/ENVIRONMENT_SEPARATION}}

- [ ] **Enable Firestore Database**
  - Firebase Console > Build > Firestore Database
  - Click "Create database"
  - Choose a location (e.g., `asia-northeast1` Tokyo)
  - Start in production mode (configure security rules afterward)

- [ ] **Set Firestore Security Rules**
  - Firebase Console > Firestore Database > Rules
  - Use a basic rule like below:

  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // User documents: allow read/write only for the owner
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // TODO: Add app-specific rules as needed
    }
  }
  ```

- [ ] **Enable Authentication**
  - Firebase Console > Build > Authentication
  - Click "Get started"
    {{#ANONYMOUS_AUTH}}
  - Enable "Anonymous"
    {{/ANONYMOUS_AUTH}}
    {{#GOOGLE_SIGNIN}}
  - Enable "Google"
  - Configure OAuth 2.0 client IDs (iOS/Android)
    {{/GOOGLE_SIGNIN}}
    {{#APPLE_SIGNIN}}
  - Enable "Apple"
  - Configure Sign in with Apple in Apple Developer Console
  - Retrieve and set the Service ID
    {{/APPLE_SIGNIN}}

{{#FIREBASE_STORAGE_ENABLED}}

- [ ] **Enable Cloud Storage**
  - Firebase Console > Build > Storage
  - Click "Get started"
  - Set security rules:
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
  {{/FIREBASE_STORAGE_ENABLED}}

{{#ANALYTICS_ENABLED}}

- [ ] **Enable Google Analytics**
  - Firebase Console > Engage > Analytics
  - Might already be enabled (verify only)
    {{/ANALYTICS_ENABLED}}

{{#CRASHLYTICS_ENABLED}}

- [ ] **Enable Crashlytics**
  - Firebase Console > Release & Monitor > Crashlytics
  - Click "Enable Crashlytics"
  - After first build, crash reports will appear
    {{/CRASHLYTICS_ENABLED}}

{{#PUSH_NOTIFICATIONS_ENABLED}}

- [ ] **Configure Cloud Messaging (Push Notifications)**
  - Firebase Console > Engage > Cloud Messaging
    **iOS:**
  - Obtain APNs auth key (.p8) from Apple Developer Console
  - Firebase Console > Project Settings > Cloud Messaging > Apple app configuration
  - Upload APNs key (enter Key ID and Team ID)
    **Android:**
  - Configured automatically (included in google-services.json)
    **In-app configuration:**
  - iOS: add the following to `ios/Runner/Info.plist`:
  ```xml
  <key>UIBackgroundModes</key>
  <array>
    <string>remote-notification</string>
  </array>
  ```

  - Android: auto-configured
    {{/PUSH_NOTIFICATIONS_ENABLED}}

{{#REMOTE_CONFIG_ENABLED}}

- [ ] **Set Remote Config Parameters**
  - Firebase Console > Engage > Remote Config
    {{#FORCED_UPDATE_ENABLED}}
  - `forced_update_version_ios`: minimum required version (e.g., "1.0.0")
  - `forced_update_version_android`: minimum required version (e.g., "1.0.0")
    {{/FORCED_UPDATE_ENABLED}}
    {{#RECOMMENDED_UPDATE_ENABLED}}
  - `recommended_update_version_ios`: recommended version (e.g., "1.1.0")
  - `recommended_update_version_android`: recommended version (e.g., "1.1.0")
    {{/RECOMMENDED_UPDATE_ENABLED}}
    {{#MAINTENANCE_MODE_ENABLED}}
  - `is_maintenance_enabled`: maintenance mode on/off (boolean: false)
  - `maintenance_title`: maintenance title (string: "Under Maintenance")
  - `maintenance_message`: maintenance message (string: "We are currently under maintenance")
    {{/MAINTENANCE_MODE_ENABLED}}
    {{/REMOTE_CONFIG_ENABLED}}
    {{/FIREBASE_ENABLED}}

---

## 📱 App Settings

- [ ] **Set links for Terms and Privacy**
  - Update methods in `lib/features/settings/settings_screen.dart`:
    - `_openTermsOfService()` - Terms of Service URL
    - `_openPrivacyPolicy()` - Privacy Policy URL
    - `_openContactUs()` - Contact email/URL

{{#APP_RATING_ENABLED}}

- [ ] **Configure App Store IDs**
  - Update `lib/core/services/app_rating_service.dart`: - iOS App Store ID - Android package name
    {{/APP_RATING_ENABLED}}

{{#ONBOARDING_ENABLED}}

- [ ] **Customize Onboarding Content**
  - Edit text in `lib/features/onboarding/onboarding_screen.dart`
  - Add images to `assets/images/` (onboarding1.png, onboarding2.png, onboarding3.png)
    {{/ONBOARDING_ENABLED}}

- [ ] **Implement Home Screen**
  - The current home is a placeholder
  - Implement according to your product requirements

- [ ] **Add Translations**
  - `lib/l10n/app_ja.arb` - Japanese
  - `lib/l10n/app_en.arb` - English
  - Add more languages as needed

---

## 🧪 Test & Build

- [ ] **Run in development**
      {{#ENVIRONMENT_SEPARATION}}

  ```bash
  flutter run --flavor staging --dart-define=ENVIRONMENT=staging
  ```

  {{/ENVIRONMENT_SEPARATION}}
  {{^ENVIRONMENT_SEPARATION}}

  ```bash
  flutter run
  ```

  {{/ENVIRONMENT_SEPARATION}}

- [ ] **Verify Firebase works**
  - Authentication works
  - Firestore writes succeed
  - Check error logs

- [ ] **Test release builds**
      {{#ENVIRONMENT_SEPARATION}}

  ```bash
  # iOS Staging
  flutter build ios --flavor staging --dart-define=ENVIRONMENT=staging --release

  # Android Staging
  flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --release
  ```

  {{/ENVIRONMENT_SEPARATION}}
  {{^ENVIRONMENT_SEPARATION}}

  ```bash
  flutter build apk --release
  flutter build ios --release
  ```

  {{/ENVIRONMENT_SEPARATION}}

{{#PUSH_NOTIFICATIONS_ENABLED}}

- [ ] **Test Push Notifications**
  - Firebase Console > Messaging > create a test message
  - Confirm the device receives it
    {{/PUSH_NOTIFICATIONS_ENABLED}}

{{#ANALYTICS_ENABLED}}

- [ ] **Confirm Analytics events**
  - Use the app
  - Check Firebase Console > Analytics > Events (may take up to 24h)
    {{/ANALYTICS_ENABLED}}

---

## 📦 Store Submission Prep

- [ ] **Verify App Icons**
  - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`
  - Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`

- [ ] **Update Version**
  - Update `version` in `pubspec.yaml`

- [ ] **Prepare Store Listings**
  - App description, screenshots
  - Category, privacy policy
  - Age rating

---

{{#REVENUECAT_ENABLED}}

## 💰 RevenueCat Subscription Setup

- [ ] **RevenueCat Dashboard Setup**
  - Create account at RevenueCat (https://app.revenuecat.com/)
  - Get iOS / Android API keys
  - Replace `_iosApiKey` / `_androidApiKey` in `lib/core/services/subscription_service.dart`

- [ ] **Offerings / Entitlements Setup**
  - Create Offering / Package in RevenueCat dashboard
  - Set Entitlement ID (default: `premium`)
  - Connect with App Store Connect / Google Play Console

{{/REVENUECAT_ENABLED}}{{#ADMOB_ENABLED}}

## 📢 Google AdMob Ads Setup

- [ ] **AdMob Console Setup**
  - Register app at AdMob (https://admob.google.com/)
  - Create ad unit IDs (banner / interstitial / rewarded)
  - Replace `YOUR_*_AD_UNIT_ID` in `lib/core/services/ad_service.dart`

- [ ] **Platform Configuration**
  - iOS: Add `GADApplicationIdentifier` to `Info.plist`
  - Android: Add `com.google.android.gms.ads.APPLICATION_ID` to `AndroidManifest.xml`

{{/ADMOB_ENABLED}}{{#ATT_ENABLED}}

## 🔒 App Tracking Transparency Setup

- [ ] **Info.plist Configuration (iOS required)**
  - Add `NSUserTrackingUsageDescription` to `ios/Runner/Info.plist`
  - Set a user-facing description explaining why tracking is needed

{{/ATT_ENABLED}}{{#VERTEX_AI_ENABLED}}

## 🤖 Vertex AI / Gemini Setup

- [ ] **Enable Vertex AI in Firebase Console**
  - Firebase Console > Build > Vertex AI to enable
  - Verify model selection (default: `gemini-2.0-flash`)

- [ ] **Region Configuration**
  - Check `_defaultLocation` in `lib/core/services/ai_service.dart`
  - Default: `asia-northeast1` (Tokyo)

{{/VERTEX_AI_ENABLED}}{{#IMAGE_PICKER_ENABLED}}

## 📷 Image Picker & Crop Setup

- [ ] **iOS Permission Setup**
  - Add to `ios/Runner/Info.plist`:
    - `NSCameraUsageDescription` (camera access reason)
    - `NSPhotoLibraryUsageDescription` (photo library access reason)

- [ ] **Android Permission Setup**
  - Add to `android/app/src/main/AndroidManifest.xml`:
    - `<uses-permission android:name="android.permission.CAMERA" />`

{{/IMAGE_PICKER_ENABLED}}{{#E2E_TESTING_ENABLED}}

## 🧪 Maestro E2E Testing Setup

- [ ] **Install Maestro CLI**
  - `curl -Ls "https://get.maestro.mobile.dev" | bash`
  - Verify with `maestro --version`

- [ ] **Create Test Flows**
  - Create test flows in `maestro/flows/` directory
  - Verify package name in `maestro/config.yaml`

## {{/E2E_TESTING_ENABLED}}

## 💡 Recommended (Optional)

- [ ] **Set up CI/CD**
  - GitHub Actions / Bitrise / Codemagic

- [ ] **Verify Crash Reporting**
      {{#CRASHLYTICS_ENABLED}}
  - Confirm Crashlytics reports appear
    {{/CRASHLYTICS_ENABLED}}

- [ ] **Performance Monitoring**
  - Consider enabling Firebase Performance Monitoring

- [ ] **Add Tests**
  - Add unit tests under `test/`
  - Add widget tests

---

## 📚 References

- [Flutter Docs](https://docs.flutter.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [FlutterFire Docs](https://firebase.flutter.dev/)
  {{#GOOGLE_SIGNIN}}
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/ios/google-signin)
  {{/GOOGLE_SIGNIN}}
  {{#APPLE_SIGNIN}}
- [Sign in with Apple Setup](https://firebase.google.com/docs/auth/ios/apple)
  {{/APPLE_SIGNIN}}

---

**✨ Once all checkboxes are complete, you're ready for production!**
