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
aflutter build apk --debug
flutter build ios --debug

# リリースビルド
flutter build apk --release
flutter build ios --release
```

{{#ENVIRONMENT_SEPARATION}}

### 環境別ビルド（環境分離を有効にした場合）

#### Android

```bash
# Staging環境（開発・テスト用）
flutter run --flavor staging
flutter build apk --flavor staging --release

# Production環境（本番用）
flutter run --flavor production
flutter build apk --flavor production --release
```

#### iOS

```bash
# Staging環境（開発用）
flutter run

# Production環境（本番リリース）
flutter build ipa --release
```

**iOS 環境の仕組み:**

- **Debug モード**（`flutter run`） → **Staging 環境**
  - `Debug.xcconfig`を使用 → Bundle ID: `xxx.staging`、App: `AppName-STG`
  - 自動的に`GoogleService-Info-staging.plist`を使用
- **Release モード**（`flutter run --release`、`flutter build ipa --release`） → **Production 環境**
  - `Release.xcconfig`を使用 → Bundle ID: `xxx`、App: `AppName`
  - 自動的に`GoogleService-Info-production.plist`を使用

{{#FIREBASE_ENABLED}}
**注意**: 環境は Xcode のビルド構成（Debug/Release）で決まります。`--dart-define`フラグでは変更できません。

**応用: シミュレーターで Production 環境をテストする**

```bash
# Debug.xcconfigを一時的に変更してproductionでテスト
# 1. ios/Debug.xcconfigを編集:
#    PRODUCT_BUNDLE_IDENTIFIER = xxx （.stagingを削除）
#    PRODUCT_NAME = AppName （-STGを削除）
#    ENVIRONMENT = production
# 2. flutter run
# 3. テスト後、ios/Debug.xcconfigを元に戻す
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
