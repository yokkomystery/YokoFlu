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
