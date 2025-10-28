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
    buildCommands: string;
  };
  basicInfo: {
    title: string;
    subtitle: string;
    appIcon: string;
    appIconDescription: string[];
    appIconRequirements: string[];
    appIconSet: string;
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
      enable: string;
      description: string;
      loading: string;
      loadFailed: string;
      required: string;
      services: string;
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
      buildCommands: 'Flutterビルドコマンド',
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
      bundleIdWarning:
        '⚠️ 一度公開すると変更できないため、慎重に決めてください',
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
        enable: 'Firebaseを使用する',
        description:
          'Firebaseを使用する場合は、事前にFirebaseプロジェクトを作成してください',
        loading: 'Firebaseプロジェクトを読み込み中...',
        loadFailed: 'Firebaseプロジェクトの読み込みに失敗しました',
        required:
          'チャットテンプレートはFirestoreを使用するため、Firebaseが必須です',
        services:
          '認証、Firestore、Storage、Analytics、Remote Configなどが使用可能になります',
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
      buildCommands: 'Flutter Build Commands',
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
        enable: 'Use Firebase',
        description:
          'If you use Firebase, please create a Firebase project first',
        loading: 'Loading Firebase projects...',
        loadFailed: 'Failed to load Firebase projects',
        required: 'Chat template requires Firebase as it uses Firestore',
        services:
          'Authentication, Firestore, Storage, Analytics, Remote Config, etc. are available',
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
  },
};
