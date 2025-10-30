# {{APP_NAME}}

A new Flutter project.

> ## ⚡ Quick Start
>
> Check [`TODO.md`](TODO.md) for setup steps. Japanese version: [`TODO_ja.md`](TODO_ja.md)
>
> It includes:
>
> - ✅ Firebase setup (enable Firestore, security rules, auth)
> - ✅ App configuration (links, store IDs, content updates)
> - ✅ Test & build verification
> - ✅ Store submission prep
>
> Once all checkboxes are done, you're ready for production!

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Flutter Build Commands

### Development

```bash
# Debug build
flutter build apk --debug
flutter build ios --debug

# Release build
flutter build apk --release
flutter build ios --release
```

{{#ENVIRONMENT_SEPARATION}}

### Environment-specific builds (when separation is enabled)

#### Android

```bash
# Staging Environment (Development/Testing)
flutter run --flavor staging
flutter build apk --flavor staging --release

# Production Environment (Release)
flutter run --flavor production
flutter build apk --flavor production --release
```

#### iOS

```bash
# Staging Environment (Development)
flutter run

# Production Environment (Device testing - Physical device only)
flutter run --release

# Production Environment (Release build)
flutter build ipa --release
```

**How iOS environments work:**

- **Debug mode** (`flutter run`) → **Staging** environment
  - Uses `Debug.xcconfig` → Bundle ID: `xxx.staging`, App: `AppName-STG`
  - Automatically uses `GoogleService-Info-staging.plist`
- **Release mode** (`flutter run --release`, `flutter build ipa --release`) → **Production** environment
  - Uses `Release.xcconfig` → Bundle ID: `xxx`, App: `AppName`
  - Automatically uses `GoogleService-Info-production.plist`

{{#FIREBASE_ENABLED}}
**Note**: The environment is determined by Xcode build configuration (Debug/Release), not by `--dart-define` flags.

**Advanced: Test Production environment on Simulator**

```bash
# Temporarily modify Debug.xcconfig for production testing
# 1. Edit ios/Debug.xcconfig:
#    PRODUCT_BUNDLE_IDENTIFIER = xxx (remove .staging)
#    PRODUCT_NAME = AppName (remove -STG)
#    ENVIRONMENT = production
# 2. flutter run
# 3. Revert ios/Debug.xcconfig after testing
```

{{/FIREBASE_ENABLED}}

### Why Android and iOS Commands Differ

**Android**:
- Uses **Product Flavors** (fully supported by Flutter)
- `--flavor staging|production` → switches Bundle ID and app name
- `--dart-define=ENVIRONMENT=xxx` → tells Firebase config script which files to use

**iOS**:
- Uses **Build Configurations** (Flutter doesn't support `--flavor` for iOS)
- Build mode (Debug/Release) → automatically applies different `.xcconfig` files
- `.xcconfig` files contain all settings (Bundle ID, app name, Firebase environment)
- No `--dart-define` needed → everything is determined by xcconfig

**Result**: Both achieve the same goal (environment separation), but use platform-specific best practices.

{{/ENVIRONMENT_SEPARATION}}

{{#FIREBASE_ENABLED}}

## Xcode Build Script

Added automatically by this tool. Make sure the "Firebase Config Script" build phase exists.

## Environment Setup

### Firebase configuration files

- `ios/Runner/GoogleService-Info-staging.plist` - for Staging
- `ios/Runner/GoogleService-Info-production.plist` - for Production
- `android/app/google-services-staging.json` - for Staging
- `android/app/google-services-production.json` - for Production

### Environment variables

- `ENVIRONMENT=staging|production` - used to switch Firebase environments
  {{/FIREBASE_ENABLED}}

## Development Guide

### Add dependencies

```bash
flutter pub add <package_name>
```

### Upgrade dependencies

```bash
flutter pub upgrade
```

### Code generation

```bash
flutter packages pub run build_runner build
```

### Run tests

```bash
flutter test
```

### Lint

```bash
flutter analyze
```
