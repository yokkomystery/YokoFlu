# {{APP_NAME}}

Flutter プロジェクトのテンプレートです。

> ## ⚡ クイックスタート
>
> セットアップ手順は [`TODO_ja.md`](TODO_ja.md) をご確認ください。英語版: [`TODO.md`](TODO.md)
>
> 以下が含まれます：
>
> - ✅ Firebase 設定（Firestore 有効化、セキュリティルール、認証設定）
> - ✅ アプリ設定（利用規約リンク、ストア ID、コンテンツ更新）
> - ✅ テスト・ビルド確認手順
> - ✅ ストア公開準備
>
> すべてのチェックが完了すれば、本番リリースの準備完了です！

## はじめに

このプロジェクトは Flutter アプリケーションのスターターテンプレートです。

Flutter 初学者向けの参考リンク：

- [Lab: 初めての Flutter アプリ](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: 実用的な Flutter サンプル](https://docs.flutter.dev/cookbook)

Flutter 開発の詳細は
[オンラインドキュメント](https://docs.flutter.dev/) を参照してください。

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

Android と iOS で同じ `--flavor` オプションを使用して環境を切り替えます。

#### 開発・実行（flutter run）

```bash
# Staging環境
flutter run --flavor staging --dart-define=ENVIRONMENT=staging              # デバッグモード（デフォルト）
flutter run --flavor staging --dart-define=ENVIRONMENT=staging --release    # リリースモード

# Production環境
flutter run --flavor production --dart-define=ENVIRONMENT=production           # デバッグモード
flutter run --flavor production --dart-define=ENVIRONMENT=production --release # リリースモード
```

#### ビルド（flutter build）

```bash
# Staging環境（開発・テスト用）
flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --debug    # Android APK デバッグ
flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --release  # Android APK リリース
flutter build ipa --flavor staging --dart-define=ENVIRONMENT=staging --release  # iOS リリース

# Production環境（本番用）
flutter build apk --flavor production --dart-define=ENVIRONMENT=production --debug    # Android APK デバッグ
flutter build apk --flavor production --dart-define=ENVIRONMENT=production --release  # Android APK リリース
flutter build ipa --flavor production --dart-define=ENVIRONMENT=production --release  # iOS リリース
```

#### ストア公開用ビルド

```bash
# Play Store用（AAB）
flutter build appbundle --flavor production --dart-define=ENVIRONMENT=production --release

# App Store用（IPA）
flutter build ipa --flavor production --dart-define=ENVIRONMENT=production --release
```

**環境の仕組み:**

- **Staging 環境** (`--flavor staging`)
  - Bundle ID: `xxx.staging`、アプリ名: `AppName STG`
  - Xcode Scheme: `staging`、Build Configuration: `Debug-staging` / `Release-staging`
{{#FIREBASE_ENABLED}}
  - 自動的に `GoogleService-Info-staging.plist` を使用
{{/FIREBASE_ENABLED}}
- **Production 環境** (`--flavor production`)
  - Bundle ID: `xxx`、アプリ名: `AppName`
  - Xcode Scheme: `production`、Build Configuration: `Debug-production` / `Release-production`
{{#FIREBASE_ENABLED}}
  - 自動的に `GoogleService-Info-production.plist` を使用
{{/FIREBASE_ENABLED}}

{{/ENVIRONMENT_SEPARATION}}

{{#FIREBASE_ENABLED}}

## Xcode ビルドスクリプトの設定

このツールで自動的に追加されます。ビルドフェーズには Firebase 設定スクリプト `firebase_config_script.sh` が組み込まれ、`--flavor` オプションで指定された環境に応じて適切な `GoogleService-Info-*.plist` をアプリにコピーします。

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

### 初期セットアップ

```bash
# 依存関係の取得
flutter pub get

# 環境確認
flutter doctor
```

### 依存関係の追加

```bash
flutter pub add <package_name>
```

### 依存関係の更新

```bash
flutter pub upgrade
```

### クリーンビルド

```bash
flutter clean && flutter pub get
```

### コード生成（Freezed等を使用している場合）

```bash
dart run build_runner build --delete-conflicting-outputs
```

### テスト実行

```bash
flutter test
```

### コード分析

```bash
flutter analyze
```
