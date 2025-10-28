import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';
import {
  AdvancedFeatureId,
  TemplateFeatureId,
  TEMPLATE_FEATURE_OPTIONS,
} from '../../../config/templateOptions';

interface SettingsScreenOptions {
  advancedFeatures?: AdvancedFeatureId[];
}

// 設定画面の作成
export function createSettingsScreen(
  appName: string,
  projectPath: string,
  options: SettingsScreenOptions = {}
) {
  // 正規化されたプロジェクト名（小文字、ハイフンをアンダースコアに）
  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  const settingsScreenPath = path.join(
    projectPath,
    'lib',
    'features',
    'settings',
    'settings_screen.dart'
  );

  // テンプレートファイルをコピー
  const templatePath = getTemplatePath(
    'features/settings/settings_screen.dart'
  );

  const featureSet = new Set(options?.advancedFeatures ?? []);
  const authLabels = [
    featureSet.has('anonymous-auth') ? '匿名認証' : null,
    featureSet.has('google-signin') ? 'Google サインイン' : null,
    featureSet.has('apple-signin') ? 'Apple サインイン' : null,
  ].filter(Boolean);
  const remoteConfigLabels = [
    featureSet.has('forced-update') ? '強制アップデート' : null,
    featureSet.has('recommended-update') ? '推奨アップデート' : null,
    featureSet.has('maintenance-mode') ? 'メンテナンスモード' : null,
  ].filter(Boolean);
  const analyticsLabels = [
    featureSet.has('analytics') ? 'Analytics' : null,
    featureSet.has('crashlytics') ? 'Crashlytics' : null,
  ].filter(Boolean);

  copyTemplateFile(
    templatePath,
    settingsScreenPath,
    {
      APP_NAME: normalizedAppName,
      AUTH_METHOD_LABELS: authLabels.join(' / '),
      REMOTE_CONFIG_LABELS: remoteConfigLabels.join(' / '),
      ANALYTICS_LABELS: analyticsLabels.join(' / '),
    },
    {
      PUSH_NOTIFICATIONS_ENABLED: featureSet.has('push-notifications'),
      APP_RATING_ENABLED: featureSet.has('app-rating'),
      AUTH_SECTION_ENABLED: authLabels.length > 0,
      REMOTE_CONFIG_SECTION_ENABLED: remoteConfigLabels.length > 0,
      ANALYTICS_SECTION_ENABLED: analyticsLabels.length > 0,
    }
  );

  console.log('✅ 設定画面を作成しました');
  return settingsScreenPath;
}

// テンプレート機能の依存関係を取得
export function getTemplateFeatureDependencies(
  selectedFeatures: TemplateFeatureId[]
): string[] {
  const dependencies = new Set<string>();

  selectedFeatures.forEach((featureId) => {
    const feature = TEMPLATE_FEATURE_OPTIONS.find((f) => f.id === featureId);
    if (feature) {
      feature.dependencies.forEach((dep) => dependencies.add(dep));
    }
  });

  return Array.from(dependencies);
}
