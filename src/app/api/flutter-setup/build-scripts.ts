import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';
import {
  getFirebaseServiceDescription,
  getFirebaseServiceLabel,
} from './service-guides';
import {
  PackageVersionSet,
  formatDependencyVersions,
} from './package-versions';

// ビルドスクリプトの作成
export function createBuildScripts(
  appName: string,
  projectPath: string,
  useFirebase: boolean,
  separateEnvironments: boolean,
  selectedServices: string[] = []
) {
  const createdFiles: string[] = [];

  // README.mdの更新
  const readmePath = path.join(projectPath, 'README.md');

  // テンプレートファイルをコピー
  const readmeTemplatePath = getTemplatePath('core/README.md');
  copyTemplateFile(
    readmeTemplatePath,
    readmePath,
    {
      APP_NAME: appName,
    },
    {
      ENVIRONMENT_SEPARATION: separateEnvironments,
      FIREBASE_ENABLED: useFirebase,
    }
  );

  if (useFirebase && selectedServices && selectedServices.length > 0) {
    const uniqueServices = Array.from(
      new Set(
        selectedServices.filter(
          (serviceId) => typeof serviceId === 'string' && serviceId.trim()
        )
      )
    );

    if (uniqueServices.length > 0) {
      const serviceList = uniqueServices
        .map((serviceId) => {
          const label = getFirebaseServiceLabel(serviceId) ?? serviceId;
          const description = getFirebaseServiceDescription(serviceId);
          return description ? `- ${label}（${description}）` : `- ${label}`;
        })
        .join('\n');

      const servicesSection = [
        '',
        '## 選択した Firebase サービス',
        '',
        serviceList,
        '',
      ].join('\n');

      fs.appendFileSync(readmePath, servicesSection);
    }
  }

  createdFiles.push(readmePath);
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

  // プロジェクト名を取得（ディレクトリ名から）
  const projectName = path.basename(projectPath).toLowerCase();
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

    // 各依存関係のバージョンマップ（高度な機能用）
    const advancedFeatureVersions: Record<string, string> = {
      in_app_review: packageVersions.in_app_review,
      google_sign_in: packageVersions.google_sign_in,
      sign_in_with_apple: packageVersions.sign_in_with_apple,
    };

    const linesToAdd: string[] = [];
    additionalDependencies.forEach((dep) => {
      const version = advancedFeatureVersions[dep] || '^1.0.0';
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
  advancedFeatures: string[] = []
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
      ONBOARDING_ENABLED: onboardingEnabled,
      PUSH_NOTIFICATIONS_ENABLED: pushNotificationsEnabled,
      ANALYTICS_ENABLED: analyticsEnabled,
      CRASHLYTICS_ENABLED: crashlyticsEnabled,
      APP_RATING_ENABLED: appRatingEnabled,
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
