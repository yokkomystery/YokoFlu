# {{APP_NAME}}

A new Flutter project.

> ## TODO
> - Update this README with your project-specific setup instructions.
> - Replace placeholder links in `lib/features/settings/settings_screen.dart` with actual URLs.
> - Review generated localization files under `lib/l10n/` and add translations as needed.
> - Confirm that Firebase configuration files (`GoogleService-Info*.plist`, `google-services.json`) are replaced with real credentials.
> - Replace the home tab placeholder (`HomeTabPlaceholder`) with your actual dashboard content.

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

### 環境別ビルド（環境分離を有効にした場合）

```bash
# Staging環境
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

# Production環境
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

## Xcode ビルドスクリプトの設定

このツールで自動的に追加されます。ビルドフェーズに「Firebase Config Script」が入っているかを確認してください。

## 環境設定

### Firebase 設定ファイル

- `ios/Runner/GoogleService-Info-staging.plist` - Staging 環境用
- `ios/Runner/GoogleService-Info-production.plist` - Production 環境用
- `android/app/google-services-staging.json` - Staging 環境用
- `android/app/google-services-production.json` - Production 環境用

### 環境変数

- `ENVIRONMENT=staging|production` - Firebase環境の切り替えに使用
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
