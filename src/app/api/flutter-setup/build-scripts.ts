import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';
import {
  PackageVersionSet,
  formatDependencyVersions,
} from './package-versions';

// ビルドスクリプトの作成
export function createBuildScripts(
  appName: string,
  projectPath: string,
  useFirebase: boolean,
  separateEnvironments: boolean
) {
  const createdFiles: string[] = [];

  // README（多言語対応）
  const readmePath = path.join(projectPath, 'README.md');
  const readmeJaPath = path.join(projectPath, 'README_ja.md');

  // 英語版（デフォルト）
  const readmeEnTemplatePath = getTemplatePath('core/README_en.md');
  copyTemplateFile(
    readmeEnTemplatePath,
    readmePath,
    {
      APP_NAME: appName,
    },
    {
      ENVIRONMENT_SEPARATION: separateEnvironments,
      FIREBASE_ENABLED: useFirebase,
    }
  );

  // 日本語版
  const readmeJaTemplatePath = getTemplatePath('core/README_ja.md');
  copyTemplateFile(
    readmeJaTemplatePath,
    readmeJaPath,
    {
      APP_NAME: appName,
    },
    {
      ENVIRONMENT_SEPARATION: separateEnvironments,
      FIREBASE_ENABLED: useFirebase,
    }
  );

  createdFiles.push(readmePath);
  createdFiles.push(readmeJaPath);
  console.log('✅ ビルドスクリプトを作成しました');
  return createdFiles.join(', ');
}

// pubspec.yamlの更新（バージョンセットベース）
export function updatePubspecYaml(
  projectPath: string,
  useFirebase: boolean,
  additionalDependencies: string[] = [],
  packageVersions: PackageVersionSet
) {
  const pubspecPath = path.join(projectPath, 'pubspec.yaml');

  // プロジェクト名を取得（ディレクトリ名から、Dartパッケージ名に正規化）
  const projectName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');
  console.log(`📝 pubspec.yaml更新: プロジェクト名 = ${projectName}`);
  console.log(`📦 SDK制約: ${packageVersions.sdkConstraint}`);

  // pubspec.yamlの基本構造を作成
  let pubspecContent = `name: ${projectName}
description: 'A new Flutter project.'
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: "${packageVersions.sdkConstraint}"

dependencies:
${formatDependencyVersions(packageVersions, useFirebase).dependencies}`;

  // 高度な機能の依存関係を追加
  if (additionalDependencies.length > 0) {
    console.log(
      `📦 高度な機能のパッケージを追加: ${additionalDependencies.join(', ')}`
    );

    const advancedFeatureVersions: Record<string, string> = {
      in_app_review: packageVersions.in_app_review,
      google_sign_in: packageVersions.google_sign_in,
      sign_in_with_apple: packageVersions.sign_in_with_apple,
      package_info_plus: packageVersions.package_info_plus,
      device_info_plus: packageVersions.device_info_plus,
      firebase_messaging: packageVersions.firebase_messaging,
      url_launcher: packageVersions.url_launcher,
      shared_preferences: packageVersions.shared_preferences,
      flutter_local_notifications: packageVersions.flutter_local_notifications,
      permission_handler: packageVersions.permission_handler,
      purchases_flutter: packageVersions.purchases_flutter,
      google_mobile_ads: packageVersions.google_mobile_ads,
      app_tracking_transparency: packageVersions.app_tracking_transparency,
      firebase_vertexai: packageVersions.firebase_vertexai,
      image_picker: packageVersions.image_picker,
      image_cropper: packageVersions.image_cropper,
      flutter_image_compress: packageVersions.flutter_image_compress,
    };

    const basePackages = new Set([
      'flutter_riverpod',
      'shared_preferences',
      // Firebaseを使用する場合は、これらも基本パッケージとして含まれる
      ...(useFirebase
        ? [
            'firebase_core',
            'firebase_auth',
            'cloud_firestore',
            'firebase_storage',
            'firebase_analytics',
            'firebase_crashlytics',
            'firebase_messaging',
            'firebase_remote_config',
          ]
        : []),
    ]);

    const linesToAdd: string[] = [];
    additionalDependencies.forEach((dep) => {
      if (basePackages.has(dep)) {
        console.log(`  ⏭️  ${dep}: 基本パッケージとして既に含まれています`);
        return;
      }

      const version = advancedFeatureVersions[dep];
      if (!version) {
        console.warn(
          `⚠️  ${dep}: バージョン情報が見つかりません。スキップします。`
        );
        return;
      }

      linesToAdd.push(`  ${dep}: ${version}`);
      console.log(`  📌 ${dep}: ${version}`);
    });

    if (linesToAdd.length > 0) {
      pubspecContent += '\n' + linesToAdd.join('\n');
    }
  }

  // dev_dependencies
  pubspecContent += `
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ${packageVersions.flutter_lints}

flutter:
  uses-material-design: true
  generate: true
`;

  // ファイルに書き込み
  fs.writeFileSync(pubspecPath, pubspecContent);
  console.log('✅ pubspec.yamlを更新しました');

  return pubspecPath;
}

// プロバイダーファイルの作成
export function createProviderFiles(
  projectPath: string,
  selectedLanguages: string[] = ['ja', 'en']
) {
  const createdFiles: string[] = [];

  // 正規化されたプロジェクト名（小文字、ハイフンをアンダースコアに）
  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  // core/providersディレクトリを作成
  const providersDir = path.join(projectPath, 'lib', 'core', 'providers');
  if (!fs.existsSync(providersDir)) {
    fs.mkdirSync(providersDir, { recursive: true });
  }

  // theme_provider.dartの作成
  const themeProviderPath = path.join(providersDir, 'theme_provider.dart');
  const themeProviderTemplatePath = getTemplatePath(
    'providers/theme_provider.dart'
  );
  copyTemplateFile(themeProviderTemplatePath, themeProviderPath, {
    APP_NAME: normalizedAppName,
  });
  createdFiles.push(themeProviderPath);

  // 選択された言語に基づいてLocaleリストを生成
  const localeMap: Record<string, string> = {
    ja: "Locale('ja'), // 日本語",
    en: "Locale('en'), // 英語",
    ko: "Locale('ko'), // 韓国語",
    zh_CN: "Locale('zh', 'CN'), // 簡体字中国語",
    zh_TW: "Locale('zh', 'TW'), // 繁体字中国語",
    es: "Locale('es'), // スペイン語",
    fr: "Locale('fr'), // フランス語",
    de: "Locale('de'), // ドイツ語",
    pt_BR: "Locale('pt', 'BR'), // ポルトガル語(BR)",
    it: "Locale('it'), // イタリア語",
  };

  const supportedLocalesList = selectedLanguages
    .map((lang) => localeMap[lang] || `Locale('${lang}')`)
    .join('\n    ');

  // locale_provider.dartの作成
  const localeProviderPath = path.join(providersDir, 'locale_provider.dart');
  const localeProviderTemplatePath = getTemplatePath(
    'providers/locale_provider.dart'
  );
  copyTemplateFile(localeProviderTemplatePath, localeProviderPath, {
    APP_NAME: normalizedAppName,
    SUPPORTED_LOCALES: supportedLocalesList,
  });
  createdFiles.push(localeProviderPath);

  console.log('✅ プロバイダーファイルを作成しました');
  return createdFiles;
}

// main.dartの更新
export function updateMainDart(
  projectPath: string,
  appName: string,
  useFirebase: boolean,
  selectedLanguages: string[] = ['ja', 'en'],
  advancedFeatures: string[] = [],
  settingsEnabled: boolean = true
): string | null {
  // 正規化されたプロジェクト名（小文字、ハイフンをアンダースコアに）
  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  const mainDartPath = path.join(projectPath, 'lib', 'main.dart');

  // 選択された言語に基づいてLocaleリストを生成
  const localeMap: Record<string, string> = {
    ja: "Locale('ja'), // 日本語",
    en: "Locale('en'), // 英語",
    ko: "Locale('ko'), // 韓国語",
    zh_CN: "Locale('zh', 'CN'), // 簡体字中国語",
    zh_TW: "Locale('zh', 'TW'), // 繁体字中国語",
    es: "Locale('es'), // スペイン語",
    fr: "Locale('fr'), // フランス語",
    de: "Locale('de'), // ドイツ語",
    pt_BR: "Locale('pt', 'BR'), // ポルトガル語(BR)",
    it: "Locale('it'), // イタリア語",
  };

  const supportedLocalesList = selectedLanguages
    .map((lang) => localeMap[lang] || `Locale('${lang}')`)
    .join('\n        ');

  // Firebase使用有無に関わらず、main.dartを更新
  // テンプレートファイルをコピー
  const templatePath = getTemplatePath('core/main.dart');
  const onboardingEnabled = advancedFeatures.includes('onboarding');
  const pushNotificationsEnabled =
    advancedFeatures.includes('push-notifications');
  const analyticsEnabled = advancedFeatures.includes('analytics');
  const crashlyticsEnabled = advancedFeatures.includes('crashlytics');
  const appRatingEnabled = advancedFeatures.includes('app-rating');
  const admobEnabled = advancedFeatures.includes('admob-ads');
  const attEnabled = advancedFeatures.includes('att-tracking');
  const revenuecatEnabled = advancedFeatures.includes(
    'revenuecat-subscription'
  );

  copyTemplateFile(
    templatePath,
    mainDartPath,
    {
      APP_NAME: normalizedAppName,
      APP_DISPLAY_NAME: appName,
      SUPPORTED_LOCALES: supportedLocalesList,
    },
    {
      FIREBASE_ENABLED: useFirebase,
      SETTINGS_ENABLED: settingsEnabled,
      ONBOARDING_ENABLED: onboardingEnabled,
      PUSH_NOTIFICATIONS_ENABLED: pushNotificationsEnabled,
      ANALYTICS_ENABLED: analyticsEnabled,
      CRASHLYTICS_ENABLED: crashlyticsEnabled,
      APP_RATING_ENABLED: appRatingEnabled,
      ADMOB_ENABLED: admobEnabled,
      ATT_ENABLED: attEnabled,
      REVENUECAT_ENABLED: revenuecatEnabled,
    }
  );

  console.log('✅ main.dartを更新しました');
  if (onboardingEnabled) {
    console.log('📱 オンボーディング画面が有効化されました');
  }
  if (pushNotificationsEnabled) {
    console.log('🔔 Push通知機能が有効化されました');
  }
  if (analyticsEnabled) {
    console.log('📊 Firebase Analytics機能が有効化されました');
  }
  if (crashlyticsEnabled) {
    console.log('🐛 Firebase Crashlytics機能が有効化されました');
  }
  if (appRatingEnabled) {
    console.log('⭐ アプリ評価機能が有効化されました');
  }
  return mainDartPath;
}
