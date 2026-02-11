// アプリテンプレートタイプ
export type AppTemplateId = 'blank' | 'counter' | 'todo' | 'stopwatch' | 'chat';

export interface AppTemplateOption {
  id: AppTemplateId;
  label: string;
  description: string;
  icon: string;
  features: string[];
}

export const APP_TEMPLATE_OPTIONS: AppTemplateOption[] = [
  {
    id: 'blank',
    label: 'ブランクテンプレート',
    description:
      'UI を持たない最小構成から開発したい場合に最適なシンプルテンプレートです。',
    icon: '📄',
    features: ['AppBar と Scaffold のみ', '自由度の高いカスタマイズ'],
  },
  {
    id: 'counter',
    label: 'カウントアップアプリ',
    description:
      'シンプルなカウンターアプリ。Flutterの基本を学ぶのに最適です。',
    icon: '🔢',
    features: ['状態管理の基礎', 'ボタンイベント処理'],
  },
  {
    id: 'todo',
    label: 'TODOアプリ',
    description: 'タスク管理アプリ。CRUD操作とリスト表示を実装しています。',
    icon: '✅',
    features: ['ローカルストレージ', 'リスト操作', '状態管理'],
  },
  {
    id: 'stopwatch',
    label: 'ストップウォッチアプリ',
    description: '時間計測アプリ。タイマーとアニメーションを学べます。',
    icon: '⏱️',
    features: ['タイマー処理', '時間表示', 'スタート/ストップ/リセット'],
  },
  {
    id: 'chat',
    label: 'チャットアプリ',
    description: 'リアルタイムチャットアプリ。Firestoreとの連携を含みます。',
    icon: '💬',
    features: ['Firestore連携', 'リアルタイム更新', 'メッセージ送受信'],
  },
];

export const DEFAULT_APP_TEMPLATE_ID: AppTemplateId = 'counter';

export type TemplateFeatureId = 'settings-screen';

export interface TemplateFeatureOption {
  id: TemplateFeatureId;
  label: string;
  description: string;
  defaultEnabled: boolean;
  dependencies: string[]; // 必要なパッケージ
}

export const TEMPLATE_FEATURE_OPTIONS: TemplateFeatureOption[] = [
  {
    id: 'settings-screen',
    label: '設定画面テンプレート',
    description: '設定画面（テーマ切り替え・言語選択など）を自動生成します。',
    defaultEnabled: true,
    dependencies: ['package_info_plus', 'url_launcher'],
  },
];

export const DEFAULT_TEMPLATE_FEATURE_IDS = TEMPLATE_FEATURE_OPTIONS.filter(
  (option) => option.defaultEnabled
).map((option) => option.id);

export type LocalizationLanguageId = 'en' | 'ja';

export interface LocalizationLanguageOption {
  id: LocalizationLanguageId;
  label: string;
  description: string;
  templatePath: string;
  outputFileName: string;
  defaultEnabled: boolean;
}

export const LOCALIZATION_LANGUAGE_OPTIONS: LocalizationLanguageOption[] = [
  {
    id: 'en',
    label: '英語 (en)',
    description: 'グローバル向けのデフォルト翻訳ファイルを生成します。',
    templatePath: 'localization/app_en.arb',
    outputFileName: 'app_en.arb',
    defaultEnabled: true,
  },
  {
    id: 'ja',
    label: '日本語 (ja)',
    description: '日本語 UI 文言のテンプレートを生成します。',
    templatePath: 'localization/app_ja.arb',
    outputFileName: 'app_ja.arb',
    defaultEnabled: true,
  },
];

export const DEFAULT_LOCALIZATION_LANGUAGE_IDS =
  LOCALIZATION_LANGUAGE_OPTIONS.filter((option) => option.defaultEnabled).map(
    (option) => option.id
  );

export const LOCALIZATION_LANGUAGE_MAP: Record<
  LocalizationLanguageId,
  LocalizationLanguageOption
> = LOCALIZATION_LANGUAGE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.id] = option;
    return acc;
  },
  {} as Record<LocalizationLanguageId, LocalizationLanguageOption>
);

// 高度な機能
export type AdvancedFeatureId =
  | 'forced-update'
  | 'recommended-update'
  | 'maintenance-mode'
  | 'app-rating'
  | 'anonymous-auth'
  | 'google-signin'
  | 'apple-signin'
  | 'analytics'
  | 'crashlytics'
  | 'push-notifications'
  | 'onboarding'
  | 'revenuecat-subscription'
  | 'admob-ads'
  | 'att-tracking'
  | 'vertex-ai'
  | 'image-picker-crop'
  | 'e2e-testing';

export type AdvancedFeatureCategory =
  | 'app-management'
  | 'auth'
  | 'analytics'
  | 'ui-ux'
  | 'monetization'
  | 'ai'
  | 'media'
  | 'testing';

export interface AdvancedFeatureOption {
  id: AdvancedFeatureId;
  label: string;
  description: string;
  category: AdvancedFeatureCategory;
  requiresFirebase: boolean;
  dependencies: string[];
  defaultEnabled: boolean;
  todoNote?: string; // ユーザーが後で設定する必要がある内容
}

export const ADVANCED_FEATURE_OPTIONS: AdvancedFeatureOption[] = [
  // アプリ管理機能
  {
    id: 'forced-update',
    label: '強制アップデート',
    description:
      'Remote Configでアプリバージョンを管理し、古いバージョンの使用を制限',
    category: 'app-management',
    requiresFirebase: true,
    dependencies: [
      'firebase_remote_config',
      'package_info_plus',
      'url_launcher',
    ],
    defaultEnabled: false,
    todoNote:
      'Remote Configでforced_update_version_ios/androidキーを設定してください',
  },
  {
    id: 'recommended-update',
    label: '推奨アップデート',
    description: 'ユーザーに新バージョンへの更新を促す（スキップ可能）',
    category: 'app-management',
    requiresFirebase: true,
    dependencies: [
      'firebase_remote_config',
      'package_info_plus',
      'url_launcher',
    ],
    defaultEnabled: false,
    todoNote:
      'Remote Configでrecommended_update_version_ios/androidキーを設定してください',
  },
  {
    id: 'maintenance-mode',
    label: 'メンテナンスモード',
    description: 'Remote Configでアプリの一時停止を制御',
    category: 'app-management',
    requiresFirebase: true,
    dependencies: ['firebase_remote_config'],
    defaultEnabled: false,
    todoNote:
      'Remote Configでis_maintenance_enabled, maintenance_title, maintenance_messageキーを設定してください',
  },
  {
    id: 'app-rating',
    label: 'アプリ評価機能',
    description: 'ユーザーにアプリストアでの評価を促す',
    category: 'app-management',
    requiresFirebase: false,
    dependencies: ['in_app_review'],
    defaultEnabled: false,
    todoNote: 'AppStoreとPlayStoreのアプリIDを設定してください',
  },
  // 認証機能
  {
    id: 'anonymous-auth',
    label: 'Firebase匿名認証',
    description: 'ゲストとしてログイン（後で本登録可能）',
    category: 'auth',
    requiresFirebase: true,
    dependencies: [
      'firebase_auth',
      'firebase_messaging',
      'package_info_plus',
      'device_info_plus',
    ],
    defaultEnabled: false,
    todoNote: 'Firebase Consoleで匿名認証を有効化してください',
  },
  {
    id: 'google-signin',
    label: 'Googleサインイン',
    description: 'Googleアカウントで認証',
    category: 'auth',
    requiresFirebase: true,
    dependencies: [
      'firebase_auth',
      'google_sign_in',
      'firebase_messaging',
      'package_info_plus',
      'device_info_plus',
    ],
    defaultEnabled: false,
    todoNote:
      'Firebase ConsoleでGoogle認証を有効化し、OAuth 2.0クライアントIDを設定してください',
  },
  {
    id: 'apple-signin',
    label: 'Appleサインイン',
    description: 'Apple IDで認証（iOS/macOS必須）',
    category: 'auth',
    requiresFirebase: true,
    dependencies: [
      'firebase_auth',
      'sign_in_with_apple',
      'firebase_messaging',
      'package_info_plus',
      'device_info_plus',
    ],
    defaultEnabled: false,
    todoNote:
      'Apple Developer ConsoleでSign in with Appleを設定し、Service IDを取得してください',
  },
  // 分析・監視
  {
    id: 'analytics',
    label: 'Firebase Analytics',
    description: 'ユーザー行動の分析とイベントトラッキング',
    category: 'analytics',
    requiresFirebase: true,
    dependencies: ['firebase_analytics'],
    defaultEnabled: false,
    todoNote: 'Firebase ConsoleでGoogle Analyticsを有効化してください',
  },
  {
    id: 'crashlytics',
    label: 'Crashlytics',
    description: 'クラッシュレポートとエラートラッキング',
    category: 'analytics',
    requiresFirebase: true,
    dependencies: ['firebase_crashlytics'],
    defaultEnabled: false,
    todoNote: 'Firebase ConsoleでCrashlyticsを有効化してください',
  },
  {
    id: 'push-notifications',
    label: 'プッシュ通知',
    description: 'Firebase Cloud Messagingでプッシュ通知を送信',
    category: 'ui-ux',
    requiresFirebase: true,
    dependencies: [
      'firebase_messaging',
      'flutter_local_notifications',
      'permission_handler',
    ],
    defaultEnabled: false,
    todoNote: 'APNs証明書（iOS）とFCMサーバーキー（Android）を設定してください',
  },
  // UI/UX機能
  {
    id: 'onboarding',
    label: 'オンボーディング画面',
    description: '初回起動時のチュートリアル画面',
    category: 'ui-ux',
    requiresFirebase: false,
    dependencies: ['shared_preferences'],
    defaultEnabled: false,
    todoNote:
      'assets/images/にオンボーディング画像（onboarding1.png等）を追加してください',
  },
  // 収益化機能
  {
    id: 'revenuecat-subscription',
    label: 'RevenueCatサブスクリプション',
    description: 'RevenueCatでアプリ内課金・サブスクリプションを管理',
    category: 'monetization',
    requiresFirebase: false,
    dependencies: ['purchases_flutter'],
    defaultEnabled: false,
    todoNote:
      'RevenueCat DashboardでAPIキーを取得し、Offering/Entitlementを設定してください',
  },
  {
    id: 'admob-ads',
    label: 'Google AdMob広告',
    description: 'バナー・インタースティシャル・リワード広告を表示',
    category: 'monetization',
    requiresFirebase: false,
    dependencies: ['google_mobile_ads'],
    defaultEnabled: false,
    todoNote:
      'AdMob Consoleで広告ユニットIDを取得し、AndroidManifest.xmlとInfo.plistにアプリIDを設定してください',
  },
  {
    id: 'att-tracking',
    label: 'App Tracking Transparency',
    description: 'iOS 14.5以降必須のトラッキング許可ダイアログ',
    category: 'monetization',
    requiresFirebase: false,
    dependencies: ['app_tracking_transparency'],
    defaultEnabled: false,
    todoNote: 'Info.plistにNSUserTrackingUsageDescriptionを追加してください',
  },
  // AI機能
  {
    id: 'vertex-ai',
    label: 'Vertex AI / Gemini',
    description: 'Firebase Vertex AIでテキスト生成・チャット機能を実装',
    category: 'ai',
    requiresFirebase: true,
    dependencies: ['firebase_vertexai'],
    defaultEnabled: false,
    todoNote:
      'Firebase ConsoleでVertex AIを有効化し、使用するモデルを設定してください',
  },
  // メディア機能
  {
    id: 'image-picker-crop',
    label: '画像ピッカー＆クロップ',
    description: 'カメラ・ギャラリーから画像取得、トリミング、圧縮',
    category: 'media',
    requiresFirebase: false,
    dependencies: ['image_picker', 'image_cropper', 'flutter_image_compress'],
    defaultEnabled: false,
    todoNote:
      'Info.plistにカメラ・フォトライブラリ権限、AndroidManifest.xmlにカメラ権限を追加してください',
  },
  // テスト機能
  {
    id: 'e2e-testing',
    label: 'Maestro E2Eテスト',
    description: 'Maestroフレームワークを使ったE2Eテスト環境を構築',
    category: 'testing',
    requiresFirebase: false,
    dependencies: [],
    defaultEnabled: false,
    todoNote:
      'Maestro CLIをインストールしてください: curl -Ls "https://get.maestro.mobile.dev" | bash',
  },
];

export const DEFAULT_ADVANCED_FEATURE_IDS: AdvancedFeatureId[] = [];

// カテゴリ別のラベル
export const ADVANCED_FEATURE_CATEGORY_LABELS: Record<
  AdvancedFeatureCategory,
  string
> = {
  'app-management': 'アプリ管理',
  auth: '認証機能',
  analytics: '分析・監視',
  'ui-ux': 'UI/UX機能',
  monetization: '収益化',
  ai: 'AI機能',
  media: 'メディア',
  testing: 'テスト',
};
