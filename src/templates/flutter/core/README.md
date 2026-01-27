# {{APP_NAME}}

A new Flutter project.

> ## ⚡ クイックスタート
>
> **セットアップを完了するには [`TODO.md`](TODO.md) を確認してください！**
>
> このファイルには以下が含まれます：
>
> - ✅ Firebase 設定（Firestore 有効化、セキュリティルール、認証設定）
> - ✅ アプリ設定（利用規約リンク、ストア ID、コンテンツ更新）
> - ✅ テスト・ビルド確認手順
> - ✅ ストア公開準備
>
> すべてのチェックボックスを完了させれば、本番デプロイ準備完了です！

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Flutter ビルドコマンド

### 開発環境

```bash
# デバッグビルド
flutter build apk --debug
flutter build ios --debug

# リリースビルド
flutter build apk --release
flutter build ios --release
```

{{#ENVIRONMENT_SEPARATION}}

### Environment-specific Builds (When environment separation is enabled)

Both Android and iOS use the same `--flavor` option to switch environments.

#### Development / Run (flutter run)

```bash
# Staging Environment
flutter run --flavor staging              # Debug mode (default)
flutter run --flavor staging --release    # Release mode

# Production Environment
flutter run --flavor production           # Debug mode
flutter run --flavor production --release # Release mode
```

#### Build (flutter build)

```bash
# Staging Environment (Development/Testing)
flutter build apk --flavor staging --debug    # Android APK Debug
flutter build apk --flavor staging --release  # Android APK Release
flutter build ipa --flavor staging --release  # iOS Release

# Production Environment (Release)
flutter build apk --flavor production --debug    # Android APK Debug
flutter build apk --flavor production --release  # Android APK Release
flutter build ipa --flavor production --release  # iOS Release
```

#### Store Release Builds

```bash
# Play Store (AAB)
flutter build appbundle --flavor production --release

# App Store (IPA)
flutter build ipa --flavor production --release
```

**How environments work:**

- **Staging Environment** (`--flavor staging`)
  - Bundle ID: `xxx.staging`, App Name: `AppName STG`
  - Xcode Scheme: `staging`, Build Configuration: `Debug-staging` / `Release-staging`
{{#FIREBASE_ENABLED}}
  - Automatically uses `GoogleService-Info-staging.plist`
{{/FIREBASE_ENABLED}}
- **Production Environment** (`--flavor production`)
  - Bundle ID: `xxx`, App Name: `AppName`
  - Xcode Scheme: `production`, Build Configuration: `Debug-production` / `Release-production`
{{#FIREBASE_ENABLED}}
  - Automatically uses `GoogleService-Info-production.plist`
{{/FIREBASE_ENABLED}}

{{/ENVIRONMENT_SEPARATION}}

{{#FIREBASE_ENABLED}}

## Xcode Build Script Configuration

This is automatically added by the tool. The build phase includes the Firebase configuration script `firebase_config_script.sh`, which copies the appropriate `GoogleService-Info-*.plist` to the app based on the environment specified by the `--flavor` option.

## Environment Configuration

### Firebase 設定ファイル

- `ios/Runner/GoogleService-Info-staging.plist` - Staging 環境用
- `ios/Runner/GoogleService-Info-production.plist` - Production 環境用
- `android/app/google-services-staging.json` - Staging 環境用
- `android/app/google-services-production.json` - Production 環境用

### 環境変数

- `ENVIRONMENT=staging|production` - Firebase 環境の切り替えに使用
  {{/FIREBASE_ENABLED}}

## 開発ガイド

### 依存関係の追加

```bash
flutter pub add <package_name>
```

### 依存関係の更新

```bash
flutter pub upgrade
```

### コード生成

```bash
flutter packages pub run build_runner build
```

### テスト実行

```bash
flutter test
```

### コード分析

```bash
flutter analyze
```
