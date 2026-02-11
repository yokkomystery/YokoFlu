export type Locale = 'ja' | 'en';

export interface Translations {
  common: {
    submit: string;
    cancel: string;
    loading: string;
    done: string;
    error: string;
    success: string;
    next: string;
    back: string;
    start: string;
    finish: string;
  };
  header: {
    title: string;
    subtitle: string;
    description: string;
  };
  sections: {
    basicInfo: string;
    appTemplate: string;
    firebase: string;
    basicFeatures: string;
    advancedFeatures: string;
    advancedFeaturesOptional: string;
    buildCommands: string;
    flutterBuildCommands: string;
  };
  basicInfo: {
    title: string;
    subtitle: string;
    appIcon: string;
    appIconDescription: string[];
    appIconRequirements: string[];
    appIconSet: string;
    selectFile: string;
    noFileSelected: string;
    errorSquareRequired: string;
    errorSizeTooSmall: string;
    appNameLabel: string;
    appNameExample: string;
    appNameDesc: string;
    projectIdLabel: string;
    projectIdExample: string;
    projectIdDesc: string;
    bundleIdLabel: string;
    bundleIdExample: string;
    bundleIdDesc: string;
    bundleIdWarning: string;
    packageNameLabel: string;
    packageNameExample: string;
    packageNameDesc: string;
    packageNameWarning: string;
    outputPathLabel: string;
    outputPathExample: string;
    outputPathDesc: string;
  };
  fields: {
    appName: string;
    projectId: string;
    bundleId: string;
    packageName: string;
    outputPath: string;
    outputPathPlaceholder: string;
  };
  messages: {
    selectOutputPath: string;
    projectWillBeCreated: string;
    setupComplete: string;
    setupFailed: string;
  };
  form: {
    basicInfo: {
      title: string;
      subtitle: string;
    };
    template: {
      title: string;
      description: string;
    };
    firebase: {
      title: string;
      whatIsFirebase: string;
      firebaseDescription: string;
      authenticationDesc: string;
      firestoreDesc: string;
      storageDesc: string;
      analyticsDesc: string;
      remoteConfigDesc: string;
      enable: string;
      description: string;
      loading: string;
      loadFailed: string;
      required: string;
      services: string;
      worksWithoutFirebase: string;
      environmentSetup: string;
      environmentSetupDesc: string;
      createProjectFirst: string;
      createProjectInst: string;
      toolDoesNotCreate: string;
      separateEnvironments: string;
      separateEnvironmentsDesc: string;
      environmentBenefits: string;
      benefitTestData: string;
      benefitSafeDebug: string;
      benefitDataProtection: string;
      stagingEnvironment: string;
      productionEnvironment: string;
      singleEnvironment: string;
      selectFirebaseProject: string;
      selectProject: string;
      selectedProject: string;
      selectStagingError: string;
      selectProductionError: string;
      selectFirebaseError: string;
      createBeforeSelect: string;
      note: string;
    };
    submit: {
      creating: string;
      createApp: string;
    };
  };
  features: {
    title: string;
    settingsScreen: string;
    description: string;
  };
  localization: {
    title: string;
    description: string;
    autoChange: string;
    requirement: string;
  };
  advancedFeatures: {
    title: string;
    description: string[];
    about: string;
  };
  cliStatus: {
    title: string;
    reload: string;
    optional: string;
    detected: string;
    notDetected: string;
    loggedIn: string;
    loginRequired: string;
    flutterDesc: string;
    flutterGuide: string;
    dartDesc: string;
    flutterfireDescRequired: string;
    flutterfireDescOptional: string;
    flutterfireInstall: string;
    flutterfireOptionalOnly: string;
    firebaseDescRequired: string;
    firebaseDescOptional: string;
    firebaseAuthSteps: string;
    firebaseOptionalOnly: string;
  };
  result: {
    title: string;
    basicInfo: string;
    executionResult: string;
    createdFiles: string;
    nextSteps: string;
    errors: string;
    otherFiles: string;
    notes: string;
    notesList: string[];
  };
  errorDialog: {
    validation: string;
    message: string;
    ok: string;
  };
  build: {
    android: string;
    ios: string;
    debug: string;
    staging: string;
    production: string;
    release: string;
    tips: string;
  };
  errors: {
    required: string;
    invalidFormat: string;
    cliNotFound: string;
  };
  author: string;
  progressBar: {
    setupProgress: string;
    setupComplete: string;
    errorOccurred: string;
    closeButton: string;
  };
  projectSelector: {
    title: string;
    loadingProjects: string;
    noProjects: string;
    retry: string;
  };
  templateSelector: {
    aboutTemplates: string;
    readyToRun: string;
    fullyCustomizable: string;
    firebaseRequired: string;
  };
  common2: {
    development: string;
    about: string;
    required: string;
  };
  templates: {
    blank: { label: string; description: string; features: string[] };
    counter: { label: string; description: string; features: string[] };
    todo: { label: string; description: string; features: string[] };
    stopwatch: { label: string; description: string; features: string[] };
    chat: { label: string; description: string; features: string[] };
  };
  advancedFeaturesCategories: {
    appManagement: string;
    auth: string;
    analytics: string;
    uiUx: string;
    monetization: string;
    ai: string;
    media: string;
    testing: string;
  };
  advancedFeaturesList: {
    forcedUpdate: { label: string; description: string; todoNote: string };
    recommendedUpdate: { label: string; description: string; todoNote: string };
    maintenanceMode: { label: string; description: string; todoNote: string };
    appRating: { label: string; description: string; todoNote: string };
    anonymousAuth: { label: string; description: string; todoNote: string };
    googleSignin: { label: string; description: string; todoNote: string };
    appleSignin: { label: string; description: string; todoNote: string };
    analytics: { label: string; description: string; todoNote: string };
    crashlytics: { label: string; description: string; todoNote: string };
    pushNotifications: { label: string; description: string; todoNote: string };
    onboarding: { label: string; description: string; todoNote: string };
    revenuecatSubscription: {
      label: string;
      description: string;
      todoNote: string;
    };
    admobAds: { label: string; description: string; todoNote: string };
    attTracking: { label: string; description: string; todoNote: string };
    vertexAi: { label: string; description: string; todoNote: string };
    imagePickerCrop: { label: string; description: string; todoNote: string };
    e2eTesting: { label: string; description: string; todoNote: string };
  };
  languageOptions: {
    en: { label: string; description: string };
    ja: { label: string; description: string };
  };
  templateFeatures: {
    settingsScreen: { label: string; description: string };
  };
}

export const translations: Record<Locale, Translations> = {
  ja: {
    common: {
      submit: '送信',
      cancel: 'キャンセル',
      loading: '読み込み中...',
      done: '完了',
      error: 'エラー',
      success: '成功',
      next: '次へ',
      back: '戻る',
      start: '開始',
      finish: '終了',
    },
    header: {
      title: 'YOKOFLU',
      subtitle: 'Flutter Setup Tool',
      description: 'Flutterプロジェクトを数分で自動生成',
    },
    sections: {
      basicInfo: '基本情報',
      appTemplate: 'アプリテンプレート',
      firebase: 'Firebase設定',
      basicFeatures: '基本機能',
      advancedFeatures: '高度な機能（オプション）',
      advancedFeaturesOptional: '高度な機能（オプション）',
      buildCommands: 'Flutterビルドコマンド',
      flutterBuildCommands: 'Flutterビルドコマンド',
    },
    basicInfo: {
      title: '基本情報',
      subtitle:
        'これらの情報は後から変更が困難なものもあるため、慎重に入力してください。',
      appIcon: 'アプリアイコン（オプション）',
      appIconDescription: [
        '1枚の画像から各プラットフォーム用のアイコンを自動生成',
        'Android: 5種類のサイズ（mipmap-hdpi～xxxhdpi）',
        'iOS: AppIcon.appiconset内の全サイズ',
        '未設定の場合: Flutterのデフォルトアイコン（青い羽根）が使用されます',
      ],
      appIconRequirements: [
        '✓ 正方形（必須）',
        '✓ 最小 512x512px / 推奨 1024x1024px',
        '✓ PNG形式（透過なし推奨）',
      ],
      appIconSet: '✓ アイコンが設定されました',
      selectFile: 'ファイルを選択',
      noFileSelected: '選択されていません',
      errorSquareRequired:
        '画像は正方形である必要があります。\n現在のサイズ: {width}x{height}px\n\n正方形（例: 1024x1024px）の画像を選択してください。',
      errorSizeTooSmall:
        '画像サイズが小さすぎます。\n現在のサイズ: {width}x{height}px\n\n最低512x512px以上、推奨1024x1024pxの画像を使用してください。',
      appNameLabel: 'アプリ名',
      appNameExample: '例: MyAwesomeApp',
      appNameDesc:
        'ユーザーに表示されるアプリの名前です。日本語・英数字どちらでも可能です。',
      projectIdLabel: 'プロジェクトID',
      projectIdExample: '例: my-awesome-app',
      projectIdDesc:
        'Flutterプロジェクトのフォルダ名・内部識別子（小文字、数字、ハイフンのみ）',
      bundleIdLabel: 'Bundle ID（iOS）',
      bundleIdExample: '例: com.company.myapp',
      bundleIdDesc:
        '重要: iOSアプリの一意な識別子。逆ドメイン形式（例: com.会社名.アプリ名）',
      bundleIdWarning: '⚠️ AppStoreに公開後は変更できません',
      packageNameLabel: 'パッケージ名（Android）',
      packageNameExample: '例: com.company.myapp',
      packageNameDesc:
        '重要: Androidアプリの一意な識別子。通常はBundle IDと同じ値を推奨',
      packageNameWarning: '⚠️ Google Playに公開後は変更できません',
      outputPathLabel: '出力パス',
      outputPathExample: '例: /Users/yourname/projects',
      outputPathDesc:
        'Flutterプロジェクトを生成する親ディレクトリ。実際のプロジェクトは「出力パス/アプリ名」に作成されます。',
    },
    fields: {
      appName: 'アプリ名',
      projectId: 'プロジェクトID',
      bundleId: 'Bundle ID（iOS）',
      packageName: 'パッケージ名（Android）',
      outputPath: '出力パス',
      outputPathPlaceholder: '出力先ディレクトリを選択...',
    },
    messages: {
      selectOutputPath: '出力パスを選択',
      projectWillBeCreated: 'プロジェクトが作成されます',
      setupComplete: 'セットアップ完了',
      setupFailed: 'セットアップに失敗しました',
    },
    form: {
      basicInfo: {
        title: '基本情報を入力',
        subtitle: 'プロジェクトの基本情報を入力してください',
      },
      template: {
        title: 'アプリテンプレート選択',
        description:
          'アプリのベースとなる機能付きのサンプルコードが生成されます',
      },
      firebase: {
        title: 'Firebase設定',
        whatIsFirebase: 'Firebaseとは？',
        firebaseDescription:
          'Googleが提供するバックエンドサービス（BaaS）。サーバーを構築せずに、以下の機能をアプリに追加できます：',
        authenticationDesc: 'ログイン・ユーザー管理',
        firestoreDesc: 'データベース',
        storageDesc: '画像・ファイル保存',
        analyticsDesc: 'ユーザー行動分析',
        remoteConfigDesc: 'アプリの動的設定変更',
        enable: 'Firebaseを使用する',
        description:
          'Firebaseを使用する場合は、事前にFirebaseプロジェクトを作成してください',
        loading: 'Firebaseプロジェクトを読み込み中...',
        loadFailed: 'Firebaseプロジェクトの読み込みに失敗しました',
        required:
          'チャットテンプレートはFirestoreを使用するため、Firebaseが必須です',
        services:
          '認証、Firestore、Storage、Analytics、Remote Configなどが使用可能になります',
        worksWithoutFirebase:
          'Firebaseなしでも、カウンター、TODO、ストップウォッチのテンプレートは完全に動作します',
        environmentSetup: '環境構成の選択',
        environmentSetupDesc:
          '開発用（Staging）と本番用（Production）でFirebaseプロジェクトを分けることを推奨します。',
        createProjectFirst:
          '注意: 事前にFirebaseプロジェクトを作成してください',
        createProjectInst:
          'でプロジェクトを作成後、下のボタンから選択してください。',
        toolDoesNotCreate:
          'このツールはFirebaseプロジェクトを自動作成しません。',
        separateEnvironments:
          'ステージングとプロダクション環境を分離する（推奨）',
        separateEnvironmentsDesc:
          '2つのFirebaseプロジェクトを使用して、開発環境と本番環境を完全に分離',
        environmentBenefits: '環境分離のメリット:',
        benefitTestData: '開発中のテストデータが本番環境に影響しない',
        benefitSafeDebug: '安全にデバッグや実験ができる',
        benefitDataProtection: '本番データを保護できる',
        stagingEnvironment: 'ステージング環境（開発・テスト用）',
        productionEnvironment: 'プロダクション環境（本番用）',
        singleEnvironment: '単一環境（シンプル構成）',
        selectFirebaseProject: 'Firebaseプロジェクトを選択',
        selectProject: 'プロジェクトを選択',
        selectedProject: '選択済み',
        selectStagingError: 'ステージング環境のプロジェクトを選択してください',
        selectProductionError:
          'プロダクション環境のプロジェクトを選択してください',
        selectFirebaseError: 'Firebaseプロジェクトを選択してください',
        createBeforeSelect:
          'Firebase Consoleで事前にプロジェクトを作成してから、上のボタンで選択してください',
        note: '注意',
      },
      submit: {
        creating: '作成中...',
        createApp: 'Flutterアプリを作成',
      },
    },
    features: {
      title: '基本機能',
      settingsScreen: '設定画面テンプレート',
      description:
        'テーマ切り替え（ライト/ダーク/システム）、言語選択、アプリ情報、利用規約リンクなどを含む標準的な設定画面が生成されます。',
    },
    localization: {
      title: '多言語対応（i18n）',
      description:
        '選択した言語のARBファイル（翻訳リソース）が自動生成されます。',
      autoChange:
        'アプリ実行時、デバイスの言語設定に応じて自動的に表示言語が切り替わります',
      requirement: '日本語または英語のどちらか一方は必ず選択してください',
    },
    advancedFeatures: {
      title: '高度な機能について',
      about: '高度な機能について',
      description: [
        '実務でよく使われる機能のテンプレートコードを自動生成します',
        '各機能には詳細なTODOコメントが含まれます',
        '必要な依存関係（パッケージ）が自動的に追加されます',
        '生成後、コードを確認してTODO部分を実際の値に置き換えてください',
      ],
    },
    cliStatus: {
      title: 'CLI / SDK の状態',
      reload: '再チェック',
      optional: '任意',
      detected: '検出済み',
      notDetected: '未検出（コマンドが見つかりません）',
      loggedIn: 'firebase login 済み',
      loginRequired: '`firebase login` が必要です',
      flutterDesc:
        'Flutter SDK が PATH に通っている必要があります。`flutter --version` で動作確認してください。',
      flutterGuide: '公式手順',
      dartDesc:
        '`dart --version` が成功していれば問題ありません。Flutter を導入すると同梱されます。',
      flutterfireDescRequired:
        'Firebase 設定ファイルを自動生成するために必要です。',
      flutterfireDescOptional: 'Firebase を使用する場合に必要です。',
      flutterfireInstall:
        '`dart pub global activate flutterfire_cli` を実行して導入してください。',
      flutterfireOptionalOnly: 'Firebase を使用する場合のみ必要です。',
      firebaseDescRequired:
        'Firebase プロジェクト情報の取得や flutterfire CLI と連携するために使用します。`npm install -g firebase-tools` で導入できます。',
      firebaseDescOptional: 'Firebase を使用する場合に必要です。',
      firebaseAuthSteps: 'を順に実行して認証してください。',
      firebaseOptionalOnly: 'Firebase を使用する場合のみ必要です。',
    },
    result: {
      title: '✅ セットアップ完了',
      basicInfo: '基本情報',
      executionResult: '実行結果',
      createdFiles: '作成されたファイル',
      nextSteps: '次のステップ',
      errors: 'エラー',
      otherFiles: '他 {count} ファイル...',
      notes: '📌 初期生成直後に確認したい項目',
      notesList: [
        '`README.md` の TODO を確認し、リンクや説明文を実アプリに合わせて修正してください。',
        '`lib/features/settings/settings_screen.dart` の TODO を参照し、利用規約や問い合わせ先を設定してください。',
        '`lib/l10n/` の ARB に翻訳を追加してください。',
      ],
    },
    errorDialog: {
      validation: '入力エラーがあります',
      message: '以下の項目を確認して、正しく入力してください：',
      ok: 'OK（フォームに戻る）',
    },
    build: {
      android: 'Android',
      ios: 'iOS',
      debug: 'デバッグビルド',
      staging: 'Staging環境',
      production: 'Production環境',
      release: 'リリース',
      tips: 'ビルドオプションについて',
    },
    errors: {
      required: '必須項目です',
      invalidFormat: '不正な形式です',
      cliNotFound: 'CLIが見つかりません',
    },
    author: 'Satoshi Yokokawa（横川 智士）',
    progressBar: {
      setupProgress: 'セットアップ進捗',
      setupComplete: 'セットアップ完了',
      errorOccurred: 'エラーが発生しました',
      closeButton: '閉じる',
    },
    projectSelector: {
      title: 'Firebaseプロジェクトを選択',
      loadingProjects: 'プロジェクト一覧を読み込み中...',
      noProjects: '利用可能なプロジェクトが見つかりません',
      retry: '再試行',
    },
    templateSelector: {
      aboutTemplates: 'テンプレートについて',
      readyToRun: 'すぐに動作確認でき、学習や開発のスタート地点として最適',
      fullyCustomizable: '生成後は自由にカスタマイズ・拡張が可能です',
      firebaseRequired: 'Firebase必須',
    },
    common2: {
      development: '開発',
      about: 'について',
      required: '必須',
    },
    templates: {
      blank: {
        label: 'ブランクテンプレート',
        description:
          'UI を持たない最小構成から開発したい場合に最適なシンプルテンプレートです。',
        features: ['AppBar と Scaffold のみ', '自由度の高いカスタマイズ'],
      },
      counter: {
        label: 'カウントアップアプリ',
        description:
          'シンプルなカウンターアプリ。Flutterの基本を学ぶのに最適です。',
        features: ['状態管理の基礎', 'ボタンイベント処理'],
      },
      todo: {
        label: 'TODOアプリ',
        description: 'タスク管理アプリ。CRUD操作とリスト表示を実装しています。',
        features: ['ローカルストレージ', 'リスト操作', '状態管理'],
      },
      stopwatch: {
        label: 'ストップウォッチアプリ',
        description: '時間計測アプリ。タイマーとアニメーションを学べます。',
        features: ['タイマー処理', '時間表示', 'スタート/ストップ/リセット'],
      },
      chat: {
        label: 'チャットアプリ',
        description:
          'リアルタイムチャットアプリ。Firestoreとの連携を含みます。',
        features: ['Firestore連携', 'リアルタイム更新', 'メッセージ送受信'],
      },
    },
    advancedFeaturesCategories: {
      appManagement: 'アプリ管理',
      auth: '認証機能',
      analytics: '分析・監視',
      uiUx: 'UI/UX機能',
      monetization: '収益化',
      ai: 'AI機能',
      media: 'メディア',
      testing: 'テスト',
    },
    advancedFeaturesList: {
      forcedUpdate: {
        label: '強制アップデート',
        description:
          'Remote Configでアプリバージョンを管理し、古いバージョンの使用を制限',
        todoNote:
          'Remote Configでforced_update_version_ios/androidキーを設定してください',
      },
      recommendedUpdate: {
        label: '推奨アップデート',
        description: 'ユーザーに新バージョンへの更新を促す（スキップ可能）',
        todoNote:
          'Remote Configでrecommended_update_version_ios/androidキーを設定してください',
      },
      maintenanceMode: {
        label: 'メンテナンスモード',
        description: 'Remote Configでアプリの一時停止を制御',
        todoNote:
          'Remote Configでis_maintenance_enabled, maintenance_title, maintenance_messageキーを設定してください',
      },
      appRating: {
        label: 'アプリ評価機能',
        description: 'ユーザーにアプリストアでの評価を促す',
        todoNote: 'AppStoreとPlayStoreのアプリIDを設定してください',
      },
      anonymousAuth: {
        label: 'Firebase匿名認証',
        description: 'ゲストとしてログイン（後で本登録可能）',
        todoNote: 'Firebase Consoleで匿名認証を有効化してください',
      },
      googleSignin: {
        label: 'Googleサインイン',
        description: 'Googleアカウントで認証',
        todoNote:
          'Firebase ConsoleでGoogle認証を有効化し、OAuth 2.0クライアントIDを設定してください',
      },
      appleSignin: {
        label: 'Appleサインイン',
        description: 'Apple IDで認証（iOS/macOS必須）',
        todoNote:
          'Apple Developer ConsoleでSign in with Appleを設定し、Service IDを取得してください',
      },
      analytics: {
        label: 'Firebase Analytics',
        description: 'ユーザー行動の分析とイベントトラッキング',
        todoNote: 'Firebase ConsoleでGoogle Analyticsを有効化してください',
      },
      crashlytics: {
        label: 'Crashlytics',
        description: 'クラッシュレポートとエラートラッキング',
        todoNote: 'Firebase ConsoleでCrashlyticsを有効化してください',
      },
      pushNotifications: {
        label: 'プッシュ通知',
        description: 'Firebase Cloud Messagingでプッシュ通知を送信',
        todoNote:
          'APNs証明書（iOS）とFCMサーバーキー（Android）を設定してください',
      },
      onboarding: {
        label: 'オンボーディング画面',
        description: '初回起動時のチュートリアル画面',
        todoNote:
          'assets/images/にオンボーディング画像（onboarding1.png等）を追加してください',
      },
      revenuecatSubscription: {
        label: 'RevenueCatサブスクリプション',
        description: 'RevenueCatでアプリ内課金・サブスクリプションを管理',
        todoNote:
          'RevenueCat DashboardでAPIキーを取得し、Offering/Entitlementを設定してください',
      },
      admobAds: {
        label: 'Google AdMob広告',
        description: 'バナー・インタースティシャル・リワード広告を表示',
        todoNote:
          'AdMob Consoleで広告ユニットIDを取得し、AndroidManifest.xmlとInfo.plistにアプリIDを設定してください',
      },
      attTracking: {
        label: 'App Tracking Transparency',
        description: 'iOS 14.5以降必須のトラッキング許可ダイアログ',
        todoNote:
          'Info.plistにNSUserTrackingUsageDescriptionを追加してください',
      },
      vertexAi: {
        label: 'Vertex AI / Gemini',
        description: 'Firebase Vertex AIでテキスト生成・チャット機能を実装',
        todoNote:
          'Firebase ConsoleでVertex AIを有効化し、使用するモデルを設定してください',
      },
      imagePickerCrop: {
        label: '画像ピッカー＆クロップ',
        description: 'カメラ・ギャラリーから画像取得、トリミング、圧縮',
        todoNote:
          'Info.plistにカメラ・フォトライブラリ権限、AndroidManifest.xmlにカメラ権限を追加してください',
      },
      e2eTesting: {
        label: 'Maestro E2Eテスト',
        description: 'Maestroフレームワークを使ったE2Eテスト環境を構築',
        todoNote:
          'Maestro CLIをインストールしてください: curl -Ls "https://get.maestro.mobile.dev" | bash',
      },
    },
    languageOptions: {
      en: {
        label: '英語 (en)',
        description: 'グローバル向けのデフォルト翻訳ファイルを生成します。',
      },
      ja: {
        label: '日本語 (ja)',
        description: '日本語 UI 文言のテンプレートを生成します。',
      },
    },
    templateFeatures: {
      settingsScreen: {
        label: '設定画面テンプレート',
        description:
          '設定画面（テーマ切り替え・言語選択など）を自動生成します。',
      },
    },
  },
  en: {
    common: {
      submit: 'Submit',
      cancel: 'Cancel',
      loading: 'Loading...',
      done: 'Done',
      error: 'Error',
      success: 'Success',
      next: 'Next',
      back: 'Back',
      start: 'Start',
      finish: 'Finish',
    },
    header: {
      title: 'YOKOFLU',
      subtitle: 'Flutter Setup Tool',
      description: 'Generate Flutter projects in minutes',
    },
    sections: {
      basicInfo: 'Basic Information',
      appTemplate: 'App Template',
      firebase: 'Firebase Configuration',
      basicFeatures: 'Basic Features',
      advancedFeatures: 'Advanced Features (Optional)',
      advancedFeaturesOptional: 'Advanced Features (Optional)',
      buildCommands: 'Flutter Build Commands',
      flutterBuildCommands: 'Flutter Build Commands',
    },
    basicInfo: {
      title: 'Basic Information',
      subtitle:
        'Please enter carefully as some of this information may be difficult to change later.',
      appIcon: 'App Icon (Optional)',
      appIconDescription: [
        'Automatically generate icons for each platform from a single image',
        'Android: 5 sizes (mipmap-hdpi to xxxhdpi)',
        'iOS: All sizes within AppIcon.appiconset',
        'If not set: Flutter default icon (blue feather) will be used',
      ],
      appIconRequirements: [
        '✓ Square (Required)',
        '✓ Minimum 512x512px / Recommended 1024x1024px',
        '✓ PNG format (no transparency recommended)',
      ],
      appIconSet: '✓ Icon is set',
      selectFile: 'Select File',
      noFileSelected: 'No file selected',
      errorSquareRequired:
        'Image must be square.\nCurrent size: {width}x{height}px\n\nPlease select a square image (e.g., 1024x1024px).',
      errorSizeTooSmall:
        'Image size is too small.\nCurrent size: {width}x{height}px\n\nPlease use an image with a minimum of 512x512px, recommended 1024x1024px.',
      appNameLabel: 'App Name',
      appNameExample: 'Example: MyAwesomeApp',
      appNameDesc:
        'The name of your app displayed to users. Can be in Japanese or alphanumeric.',
      projectIdLabel: 'Project ID',
      projectIdExample: 'Example: my-awesome-app',
      projectIdDesc:
        'Flutter project folder name and internal identifier (lowercase letters, numbers, and hyphens only)',
      bundleIdLabel: 'Bundle ID (iOS)',
      bundleIdExample: 'Example: com.company.myapp',
      bundleIdDesc:
        'Important: Unique identifier for iOS app. Use reverse domain notation (e.g., com.companyname.appname)',
      bundleIdWarning:
        '⚠️ Cannot be changed once published, please decide carefully',
      packageNameLabel: 'Package Name (Android)',
      packageNameExample: 'Example: com.company.myapp',
      packageNameDesc:
        'Important: Unique identifier for Android app. Usually same value as Bundle ID is recommended',
      packageNameWarning:
        '⚠️ Cannot be changed after publishing to Google Play',
      outputPathLabel: 'Output Path',
      outputPathExample: 'Example: /Users/yourname/projects',
      outputPathDesc:
        'Parent directory where Flutter project will be generated. Actual project will be created at "output path/app name".',
    },
    fields: {
      appName: 'App Name',
      projectId: 'Project ID',
      bundleId: 'Bundle ID (iOS)',
      packageName: 'Package Name (Android)',
      outputPath: 'Output Path',
      outputPathPlaceholder: 'Select output directory...',
    },
    messages: {
      selectOutputPath: 'Select output path',
      projectWillBeCreated: 'Project will be created',
      setupComplete: 'Setup Complete',
      setupFailed: 'Setup Failed',
    },
    form: {
      basicInfo: {
        title: 'Enter Basic Information',
        subtitle: 'Please enter your project basic information',
      },
      template: {
        title: 'Select App Template',
        description:
          'Sample code with features will be generated as base for your app',
      },
      firebase: {
        title: 'Firebase Configuration',
        whatIsFirebase: 'What is Firebase?',
        firebaseDescription:
          'A Backend as a Service (BaaS) provided by Google. Add the following features to your app without building a server:',
        authenticationDesc: 'Login and user management',
        firestoreDesc: 'Database',
        storageDesc: 'Image and file storage',
        analyticsDesc: 'User behavior analysis',
        remoteConfigDesc: 'Dynamic app configuration',
        enable: 'Use Firebase',
        description:
          'If you use Firebase, please create a Firebase project first',
        loading: 'Loading Firebase projects...',
        loadFailed: 'Failed to load Firebase projects',
        required: 'Chat template requires Firebase as it uses Firestore',
        services:
          'Authentication, Firestore, Storage, Analytics, Remote Config, etc. are available',
        worksWithoutFirebase:
          'Counter, TODO, and Stopwatch templates work fully without Firebase',
        environmentSetup: 'Environment Configuration',
        environmentSetupDesc:
          'It is recommended to separate Firebase projects for development (Staging) and production (Production).',
        createProjectFirst: 'Note: Please create a Firebase project first',
        createProjectInst:
          'After creating a project in the console, select it using the button below.',
        toolDoesNotCreate:
          'This tool does not automatically create Firebase projects.',
        separateEnvironments:
          'Separate Staging and Production Environments (Recommended)',
        separateEnvironmentsDesc:
          'Use two Firebase projects to completely separate development and production environments',
        environmentBenefits: 'Benefits of Environment Separation:',
        benefitTestData:
          'Test data during development does not affect production',
        benefitSafeDebug: 'Safe debugging and experimentation',
        benefitDataProtection: 'Protect production data',
        stagingEnvironment: 'Staging Environment (Development/Testing)',
        productionEnvironment: 'Production Environment (Live)',
        singleEnvironment: 'Single Environment (Simple Configuration)',
        selectFirebaseProject: 'Select Firebase Project',
        selectProject: 'Select Project',
        selectedProject: 'Selected',
        selectStagingError: 'Please select a staging environment project',
        selectProductionError: 'Please select a production environment project',
        selectFirebaseError: 'Please select a Firebase project',
        createBeforeSelect:
          'Create a project in Firebase Console first, then select it using the button above',
        note: 'Note',
      },
      submit: {
        creating: 'Creating...',
        createApp: 'Create Flutter App',
      },
    },
    features: {
      title: 'Basic Features',
      settingsScreen: 'Settings Screen Template',
      description:
        'A standard settings screen including theme switching (light/dark/system), language selection, app info, and terms of service links will be generated.',
    },
    localization: {
      title: 'Multi-language Support (i18n)',
      description:
        'ARB files (translation resources) for selected languages will be automatically generated.',
      autoChange:
        'When the app runs, the display language will automatically switch according to the device language settings',
      requirement: 'At least one of Japanese or English must be selected',
    },
    advancedFeatures: {
      title: 'About Advanced Features',
      about: 'About Advanced Features',
      description: [
        'Template code for features commonly used in production will be automatically generated',
        'Each feature includes detailed TODO comments',
        'Required dependencies (packages) will be automatically added',
        'After generation, review the code and replace TODO parts with actual values',
      ],
    },
    cliStatus: {
      title: 'CLI / SDK Status',
      reload: 'Reload',
      optional: 'Optional',
      detected: 'Detected',
      notDetected: 'Not detected (command not found)',
      loggedIn: 'firebase login completed',
      loginRequired: '`firebase login` is required',
      flutterDesc:
        'Flutter SDK must be in PATH. Verify with `flutter --version`.',
      flutterGuide: 'Official Guide',
      dartDesc:
        'If `dart --version` succeeds, no problem. It comes bundled with Flutter.',
      flutterfireDescRequired:
        'Required to automatically generate Firebase configuration files.',
      flutterfireDescOptional: 'Required if using Firebase.',
      flutterfireInstall:
        'Run `dart pub global activate flutterfire_cli` to install.',
      flutterfireOptionalOnly: 'Only required if using Firebase.',
      firebaseDescRequired:
        'Used to fetch Firebase project information and work with flutterfire CLI. Install with `npm install -g firebase-tools`.',
      firebaseDescOptional: 'Required if using Firebase.',
      firebaseAuthSteps: 'Run these commands in sequence to authenticate.',
      firebaseOptionalOnly: 'Only required if using Firebase.',
    },
    result: {
      title: '✅ Setup Complete',
      basicInfo: 'Basic Information',
      executionResult: 'Execution Results',
      createdFiles: 'Created Files',
      nextSteps: 'Next Steps',
      errors: 'Errors',
      otherFiles: 'and {count} other files...',
      notes: '📌 Items to check immediately after initial generation',
      notesList: [
        'Check the TODO in `README.md` and fix links and descriptions to match your actual app.',
        'Refer to the TODO in `lib/features/settings/settings_screen.dart` and set terms of service and contact information.',
        'Add translations to ARB files in `lib/l10n/`.',
      ],
    },
    errorDialog: {
      validation: 'Input Errors Detected',
      message: 'Please check and correct the following items:',
      ok: 'OK (Return to Form)',
    },
    build: {
      android: 'Android',
      ios: 'iOS',
      debug: 'Debug Build',
      staging: 'Staging Environment',
      production: 'Production Environment',
      release: 'Release',
      tips: 'About Build Options',
    },
    errors: {
      required: 'Required field',
      invalidFormat: 'Invalid format',
      cliNotFound: 'CLI not found',
    },
    author: 'Satoshi Yokokawa（横川 智士）',
    progressBar: {
      setupProgress: 'Setup Progress',
      setupComplete: 'Setup Complete',
      errorOccurred: 'Error Occurred',
      closeButton: 'Close',
    },
    projectSelector: {
      title: 'Select Firebase Project',
      loadingProjects: 'Loading projects...',
      noProjects: 'No projects found',
      retry: 'Retry',
    },
    templateSelector: {
      aboutTemplates: 'About Templates',
      readyToRun:
        'Ready to run immediately, ideal for learning and development',
      fullyCustomizable: 'Fully customizable and extensible after generation',
      firebaseRequired: 'Firebase Required',
    },
    common2: {
      development: 'Development',
      about: 'About',
      required: 'Required',
    },
    templates: {
      blank: {
        label: 'Blank Template',
        description:
          'A simple template optimal for starting development from minimal configuration without UI.',
        features: ['AppBar and Scaffold only', 'Highly customizable'],
      },
      counter: {
        label: 'Counter App',
        description:
          'A simple counter app. Perfect for learning Flutter basics.',
        features: ['State management basics', 'Button event handling'],
      },
      todo: {
        label: 'TODO App',
        description:
          'A task management app. Implements CRUD operations and list display.',
        features: ['Local storage', 'List operations', 'State management'],
      },
      stopwatch: {
        label: 'Stopwatch App',
        description: 'A time measurement app. Learn timers and animations.',
        features: ['Timer processing', 'Time display', 'Start/Stop/Reset'],
      },
      chat: {
        label: 'Chat App',
        description: 'A real-time chat app. Includes Firestore integration.',
        features: ['Firestore integration', 'Real-time updates', 'Messaging'],
      },
    },
    advancedFeaturesCategories: {
      appManagement: 'App Management',
      auth: 'Authentication',
      analytics: 'Analytics & Monitoring',
      uiUx: 'UI/UX Features',
      monetization: 'Monetization',
      ai: 'AI Features',
      media: 'Media',
      testing: 'Testing',
    },
    advancedFeaturesList: {
      forcedUpdate: {
        label: 'Forced Update',
        description:
          'Manage app versions with Remote Config and restrict old version usage',
        todoNote: 'Set forced_update_version_ios/android keys in Remote Config',
      },
      recommendedUpdate: {
        label: 'Recommended Update',
        description: 'Prompt users to update to new version (skippable)',
        todoNote:
          'Set recommended_update_version_ios/android keys in Remote Config',
      },
      maintenanceMode: {
        label: 'Maintenance Mode',
        description: 'Control app suspension with Remote Config',
        todoNote:
          'Set is_maintenance_enabled, maintenance_title, maintenance_message keys in Remote Config',
      },
      appRating: {
        label: 'App Rating',
        description: 'Prompt users to rate app on app stores',
        todoNote: 'Set AppStore and PlayStore app IDs',
      },
      anonymousAuth: {
        label: 'Firebase Anonymous Auth',
        description: 'Login as guest (can upgrade to full registration later)',
        todoNote: 'Enable anonymous authentication in Firebase Console',
      },
      googleSignin: {
        label: 'Google Sign-In',
        description: 'Authenticate with Google account',
        todoNote:
          'Enable Google authentication in Firebase Console and set OAuth 2.0 client ID',
      },
      appleSignin: {
        label: 'Apple Sign-In',
        description: 'Authenticate with Apple ID (iOS/macOS required)',
        todoNote:
          'Set up Sign in with Apple in Apple Developer Console and obtain Service ID',
      },
      analytics: {
        label: 'Firebase Analytics',
        description: 'User behavior analysis and event tracking',
        todoNote: 'Enable Google Analytics in Firebase Console',
      },
      crashlytics: {
        label: 'Crashlytics',
        description: 'Crash reports and error tracking',
        todoNote: 'Enable Crashlytics in Firebase Console',
      },
      pushNotifications: {
        label: 'Push Notifications',
        description: 'Send push notifications with Firebase Cloud Messaging',
        todoNote: 'Set APNs certificate (iOS) and FCM server key (Android)',
      },
      onboarding: {
        label: 'Onboarding Screen',
        description: 'Tutorial screen for first-time app launch',
        todoNote:
          'Add onboarding images (onboarding1.png, etc.) to assets/images/',
      },
      revenuecatSubscription: {
        label: 'RevenueCat Subscription',
        description:
          'Manage in-app purchases and subscriptions with RevenueCat',
        todoNote:
          'Get API key from RevenueCat Dashboard and configure Offerings/Entitlements',
      },
      admobAds: {
        label: 'Google AdMob Ads',
        description: 'Display banner, interstitial, and rewarded ads',
        todoNote:
          'Get ad unit IDs from AdMob Console and set app ID in AndroidManifest.xml and Info.plist',
      },
      attTracking: {
        label: 'App Tracking Transparency',
        description: 'Required tracking permission dialog for iOS 14.5+',
        todoNote: 'Add NSUserTrackingUsageDescription to Info.plist',
      },
      vertexAi: {
        label: 'Vertex AI / Gemini',
        description:
          'Implement text generation and chat with Firebase Vertex AI',
        todoNote:
          'Enable Vertex AI in Firebase Console and configure the model',
      },
      imagePickerCrop: {
        label: 'Image Picker & Crop',
        description: 'Pick images from camera/gallery, crop, and compress',
        todoNote:
          'Add camera/photo library permissions to Info.plist and camera permission to AndroidManifest.xml',
      },
      e2eTesting: {
        label: 'Maestro E2E Testing',
        description: 'Set up E2E testing environment with Maestro framework',
        todoNote:
          'Install Maestro CLI: curl -Ls "https://get.maestro.mobile.dev" | bash',
      },
    },
    languageOptions: {
      en: {
        label: 'English (en)',
        description: 'Generate default translation files for global audience.',
      },
      ja: {
        label: 'Japanese (ja)',
        description: 'Generate Japanese UI text templates.',
      },
    },
    templateFeatures: {
      settingsScreen: {
        label: 'Settings Screen Template',
        description:
          'Automatically generate settings screen (theme switching, language selection, etc.).',
      },
    },
  },
};
