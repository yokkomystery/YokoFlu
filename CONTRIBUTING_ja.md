# コントリビューションガイド

> 🌐 **English**: See [CONTRIBUTING.md](CONTRIBUTING.md)

Flutter Setup Tool への貢献に興味を持っていただき、ありがとうございます！

## 🤝 貢献方法

### バグ報告

バグを発見した場合は、以下の情報を含めて Issue を作成してください：

1. **環境情報**

   - OS（macOS、Windows、Linux）
   - Node.js バージョン
   - Flutter SDK バージョン
   - Firebase CLI バージョン

2. **再現手順**

   - 具体的な操作手順
   - 期待される動作
   - 実際の動作

3. **エラーログ**
   - コンソールのエラーメッセージ
   - ブラウザの開発者ツールのエラー

### 機能提案

新機能の提案は大歓迎です！Issue で以下を説明してください：

- 提案する機能の概要
- その機能が解決する課題
- 可能であれば、実装案や UI のモックアップ

### プルリクエスト

1. **フォークとクローン**

   ```bash
   git clone https://github.com/yokkomystery/yokoflu.git
   cd yokoflu
   npm install
   ```

2. **ブランチを作成**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **開発**

   - コードを編集
   - 動作確認（`npm run dev`）
   - 必要に応じてテストを追加

4. **コミット**

   ```bash
   git add .
   git commit -m "feat: 機能の説明"
   ```

5. **プッシュと PR 作成**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 コーディング規約

- TypeScript/JavaScript は既存のコードスタイルに従う
- Dart コードは`flutter_lints`の推奨に従う
- 変数名・関数名は分かりやすく
- 複雑な処理にはコメントを追加

## 🧪 テスト

- 変更後、必ず実際に Flutter プロジェクトを生成して動作確認
- Firebase 有効/無効の両パターンをテスト
- 各テンプレート（カウンター、TODO 等）をテスト

## 🎨 新しいテンプレートの追加

新しいアプリテンプレートを追加する場合：

1. `src/templates/flutter/app_templates/`に新しいファイルを作成
2. `src/config/templateOptions.ts`の`APP_TEMPLATE_OPTIONS`に追加
3. `src/app/api/flutter-setup/app-template-utils.ts`に設定を追加

## 🚀 新しい高度な機能の追加

新しい高度な機能を追加する場合：

1. `src/templates/flutter/`に必要なテンプレートファイルを作成
2. `src/config/templateOptions.ts`の`ADVANCED_FEATURE_OPTIONS`に追加
3. `src/app/api/flutter-setup/advanced-features-utils.ts`に実装を追加
4. 必要に応じて依存関係を pubspec.yaml に追加する処理を実装

## 📧 質問や相談

不明点があれば、Issue で質問するか、contact@mysterylog.com までお気軽にご連絡ください。

---

皆様の貢献に感謝します！🙏
