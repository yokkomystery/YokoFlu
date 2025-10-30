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

{{/ENVIRONMENT_SEPARATION}}

{{#FIREBASE_ENABLED}}

## Xcode ビルドスクリプトの設定

このツールで自動的に追加されます。ビルドフェーズに「Firebase Config Script」が入っているかを確認してください。

## 環境設定

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
