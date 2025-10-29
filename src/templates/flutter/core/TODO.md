# セットアップTODOリスト

このプロジェクトのセットアップを完了するために必要な手順をまとめています。  
完了した項目はチェックボックスにチェック (✅) を入れてください。

---

## 🔥 Firebase設定（必須）

### 1. Firebase Consoleでの設定

{{#FIREBASE_ENABLED}}
- [ ] **Firebaseプロジェクトの確認**
  - Firebase Console (https://console.firebase.google.com/) にアクセス
  - プロジェクトが正しく作成されていることを確認
{{#ENVIRONMENT_SEPARATION}}
  - Staging環境: `{{STAGING_PROJECT_ID}}`
  - Production環境: `{{PRODUCTION_PROJECT_ID}}`
{{/ENVIRONMENT_SEPARATION}}
{{^ENVIRONMENT_SEPARATION}}
  - プロジェクトID: `{{SINGLE_PROJECT_ID}}`
{{/ENVIRONMENT_SEPARATION}}

- [ ] **Firestore Databaseを有効化**
  - Firebase Console > ビルド > Firestore Database
  - 「データベースを作成」をクリック
  - ロケーションを選択（例: `asia-northeast1` 東京）
  - 本番環境モードで開始（セキュリティルールは後で設定）

- [ ] **Firestoreセキュリティルールを設定**
  - Firebase Console > Firestore Database > ルール
  - 以下のような基本ルールを設定:
  
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // ユーザードキュメント: 自分のドキュメントのみ読み書き可能
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // TODO: アプリに応じて適切なルールを追加してください
    }
  }
  ```

- [ ] **Authentication（認証）を有効化**
  - Firebase Console > ビルド > Authentication
  - 「始める」をクリック
{{#ANONYMOUS_AUTH}}
  - 「匿名」を有効化
{{/ANONYMOUS_AUTH}}
{{#GOOGLE_SIGNIN}}
  - 「Google」を有効化
  - OAuth 2.0クライアントIDを設定（iOS/Android）
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
  - 「Apple」を有効化
  - Apple Developer ConsoleでSign in with Appleを設定
  - Service IDを取得して設定
{{/APPLE_SIGNIN}}

{{#FIREBASE_STORAGE_ENABLED}}
- [ ] **Cloud Storageを有効化**
  - Firebase Console > ビルド > Storage
  - 「始める」をクリック
  - セキュリティルールを設定:
  
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
- [ ] **Google Analyticsを有効化**
  - Firebase Console > エンゲージメント > Analytics
  - 既に有効化されている場合があります（確認のみ）
{{/ANALYTICS_ENABLED}}

{{#CRASHLYTICS_ENABLED}}
- [ ] **Crashlyticsを有効化**
  - Firebase Console > リリースとモニター > Crashlytics
  - 「Crashlyticsを有効にする」をクリック
  - 初回ビルド後、クラッシュレポートが表示されます
{{/CRASHLYTICS_ENABLED}}

{{#PUSH_NOTIFICATIONS_ENABLED}}
- [ ] **Cloud Messaging（プッシュ通知）を設定**
  - Firebase Console > エンゲージメント > Messaging
  
  **iOS設定:**
  - Apple Developer ConsoleでAPNs認証キー（.p8ファイル）を取得
  - Firebase Console > プロジェクト設定 > Cloud Messaging > Apple アプリの構成
  - APNs認証キーをアップロード（キーID、チームIDも入力）
  
  **Android設定:**
  - 自動的に設定されます（google-services.jsonに含まれる）
  
  **アプリ側の設定:**
  - iOS: `ios/Runner/Info.plist` に以下を追加:
  ```xml
  <key>UIBackgroundModes</key>
  <array>
    <string>remote-notification</string>
  </array>
  ```
  - Android: 自動設定済み
{{/PUSH_NOTIFICATIONS_ENABLED}}

{{#REMOTE_CONFIG_ENABLED}}
- [ ] **Remote Configのパラメータを設定**
  - Firebase Console > エンゲージメント > Remote Config
{{#FORCED_UPDATE_ENABLED}}
  - `forced_update_version_ios`: 強制アップデート最小バージョン（例: "1.0.0"）
  - `forced_update_version_android`: 強制アップデート最小バージョン（例: "1.0.0"）
{{/FORCED_UPDATE_ENABLED}}
{{#RECOMMENDED_UPDATE_ENABLED}}
  - `recommended_update_version_ios`: 推奨アップデートバージョン（例: "1.1.0"）
  - `recommended_update_version_android`: 推奨アップデートバージョン（例: "1.1.0"）
{{/RECOMMENDED_UPDATE_ENABLED}}
{{#MAINTENANCE_MODE_ENABLED}}
  - `is_maintenance_enabled`: メンテナンスモード有効/無効（boolean: false）
  - `maintenance_title`: メンテナンスタイトル（string: "メンテナンス中"）
  - `maintenance_message`: メンテナンスメッセージ（string: "現在メンテナンス中です"）
{{/MAINTENANCE_MODE_ENABLED}}
{{/REMOTE_CONFIG_ENABLED}}
{{/FIREBASE_ENABLED}}

---

## 📱 アプリ設定

- [ ] **利用規約とプライバシーポリシーのリンクを設定**
  - `lib/features/settings/settings_screen.dart` の以下のメソッドを更新:
    - `_openTermsOfService()` - 利用規約のURL
    - `_openPrivacyPolicy()` - プライバシーポリシーのURL
    - `_openContactUs()` - お問い合わせ先のメール/URL

{{#APP_RATING_ENABLED}}
- [ ] **アプリストアIDを設定**
  - `lib/core/services/app_rating_service.dart` の以下を更新:
    - iOS App Store ID
    - Android パッケージ名
{{/APP_RATING_ENABLED}}

{{#ONBOARDING_ENABLED}}
- [ ] **オンボーディング画面のコンテンツを更新**
  - `lib/features/onboarding/onboarding_screen.dart` のテキストを書き換え
  - `assets/images/` にオンボーディング画像を追加（onboarding1.png, onboarding2.png, onboarding3.png）
{{/ONBOARDING_ENABLED}}

- [ ] **ホーム画面の実装**
  - 現在のホーム画面はテンプレートです
  - 実際のアプリの機能に合わせて実装してください

- [ ] **多言語対応の翻訳を追加**
  - `lib/l10n/app_ja.arb` - 日本語翻訳
  - `lib/l10n/app_en.arb` - 英語翻訳
  - 必要に応じて他の言語も追加

---

## 🧪 テスト・ビルド確認

- [ ] **開発環境でアプリを実行**
{{#ENVIRONMENT_SEPARATION}}
  ```bash
  flutter run --dart-define=ENVIRONMENT=staging
  ```
{{/ENVIRONMENT_SEPARATION}}
{{^ENVIRONMENT_SEPARATION}}
  ```bash
  flutter run
  ```
{{/ENVIRONMENT_SEPARATION}}

- [ ] **Firebase接続を確認**
  - 認証機能が動作するか
  - Firestoreへのデータ保存が成功するか
  - エラーログを確認

- [ ] **リリースビルドをテスト**
{{#ENVIRONMENT_SEPARATION}}
  ```bash
  # iOS Staging
  flutter build ios --dart-define=ENVIRONMENT=staging --release
  
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
- [ ] **プッシュ通知のテスト**
  - Firebase Console > Messaging > 新しいキャンペーン
  - テスト通知を送信して受信を確認
{{/PUSH_NOTIFICATIONS_ENABLED}}

{{#ANALYTICS_ENABLED}}
- [ ] **Analyticsイベント送信を確認**
  - アプリを起動して操作
  - Firebase Console > Analytics > イベント で記録を確認（24時間以内）
{{/ANALYTICS_ENABLED}}

---

## 📦 ストア公開準備

- [ ] **アプリアイコンの確認**
  - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`
  - Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`

- [ ] **バージョン番号の更新**
  - `pubspec.yaml` の `version` を更新

- [ ] **App Store Connect / Google Play Consoleでの設定**
  - アプリの説明、スクリーンショット
  - カテゴリ、プライバシーポリシー
  - 年齢制限レーティング

---

## 💡 推奨設定（任意）

- [ ] **CI/CD（継続的インテグレーション）の設定**
  - GitHub Actions / Bitrise / Codemagic など

- [ ] **エラートラッキングの確認**
{{#CRASHLYTICS_ENABLED}}
  - Crashlyticsでクラッシュレポートが記録されることを確認
{{/CRASHLYTICS_ENABLED}}

- [ ] **パフォーマンスモニタリング**
  - Firebase Performance Monitoringの有効化を検討

- [ ] **テストの追加**
  - `test/` ディレクトリにユニットテストを追加
  - ウィジェットテストを追加

---

## 📚 参考リンク

- [Flutter公式ドキュメント](https://docs.flutter.dev/)
- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [FlutterFire公式ドキュメント](https://firebase.flutter.dev/)
{{#GOOGLE_SIGNIN}}
- [Google Sign-In設定ガイド](https://firebase.google.com/docs/auth/ios/google-signin)
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
- [Sign in with Apple設定ガイド](https://firebase.google.com/docs/auth/ios/apple)
{{/APPLE_SIGNIN}}

---

**✨ すべてのチェックが完了したら、本番環境へのデプロイ準備完了です！**

