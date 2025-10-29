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

```bash
# Staging
flutter build apk --flavor staging --debug
flutter build apk --flavor staging --release
{{#FIREBASE_ENABLED}}
flutter build ios --debug --dart-define=ENVIRONMENT=staging
flutter build ios --release --dart-define=ENVIRONMENT=staging
{{/FIREBASE_ENABLED}}
{{^FIREBASE_ENABLED}}
flutter build ios --debug
flutter build ios --release
{{/FIREBASE_ENABLED}}

# Production
flutter build apk --flavor production --debug
flutter build apk --flavor production --release
{{#FIREBASE_ENABLED}}
flutter build ios --debug --dart-define=ENVIRONMENT=production
flutter build ios --release --dart-define=ENVIRONMENT=production
{{/FIREBASE_ENABLED}}
{{^FIREBASE_ENABLED}}
flutter build ios --debug
flutter build ios --release
{{/FIREBASE_ENABLED}}
```

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
