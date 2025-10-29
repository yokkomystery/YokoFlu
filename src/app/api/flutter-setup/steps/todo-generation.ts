import { copyTemplateFile, getTemplatePath } from '../template-utils';
import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { AdvancedFeatureId } from '../../../../config/templateOptions';

export interface TodoGenerationParams {
  fullOutputPath: string;
  appName: string;
  useFirebase: boolean;
  separateEnvironments: boolean;
  stagingProjectId?: string;
  productionProjectId?: string;
  singleProjectId?: string;
  advancedFeatures: AdvancedFeatureId[];
}

export function runTodoGeneration({
  fullOutputPath,
  appName,
  useFirebase,
  separateEnvironments,
  stagingProjectId,
  productionProjectId,
  singleProjectId,
  advancedFeatures,
}: TodoGenerationParams) {
  updateProgress(
    'todo-generation',
    'TODO.mdの生成',
    'セットアップ手順をまとめています...'
  );

  try {
    const templatePathJa = getTemplatePath('core/TODO_ja.md');
    const templatePathEn = getTemplatePath('core/TODO_en.md');
    const todoJaPath = `${fullOutputPath}/TODO_ja.md`;
    const todoEnPath = `${fullOutputPath}/TODO.md`;

    // 高度な機能に応じた条件フラグを作成
    const conditions: Record<string, boolean> = {
      FIREBASE_ENABLED: useFirebase,
      ENVIRONMENT_SEPARATION: separateEnvironments,
      ANONYMOUS_AUTH: advancedFeatures.includes('anonymous-auth'),
      GOOGLE_SIGNIN: advancedFeatures.includes('google-signin'),
      APPLE_SIGNIN: advancedFeatures.includes('apple-signin'),
      ANALYTICS_ENABLED: advancedFeatures.includes('analytics'),
      CRASHLYTICS_ENABLED: advancedFeatures.includes('crashlytics'),
      PUSH_NOTIFICATIONS_ENABLED:
        advancedFeatures.includes('push-notifications'),
      FIREBASE_STORAGE_ENABLED: useFirebase, // Firebaseを使う場合は基本的にStorage有効
      REMOTE_CONFIG_ENABLED:
        advancedFeatures.includes('forced-update') ||
        advancedFeatures.includes('recommended-update') ||
        advancedFeatures.includes('maintenance-mode'),
      FORCED_UPDATE_ENABLED: advancedFeatures.includes('forced-update'),
      RECOMMENDED_UPDATE_ENABLED:
        advancedFeatures.includes('recommended-update'),
      MAINTENANCE_MODE_ENABLED: advancedFeatures.includes('maintenance-mode'),
      APP_RATING_ENABLED: advancedFeatures.includes('app-rating'),
      ONBOARDING_ENABLED: advancedFeatures.includes('onboarding'),
    };

    // プレースホルダー置換用のデータ
    const placeholders: Record<string, string> = {
      APP_NAME: appName,
      STAGING_PROJECT_ID: stagingProjectId || 'your-staging-project',
      PRODUCTION_PROJECT_ID: productionProjectId || 'your-production-project',
      SINGLE_PROJECT_ID: singleProjectId || 'your-firebase-project',
    };

    // 日本語版
    copyTemplateFile(templatePathJa, todoJaPath, placeholders, conditions);
    addCreatedFile(todoJaPath);

    // 英語版（デフォルトは英語を TODO.md として配置）
    copyTemplateFile(templatePathEn, todoEnPath, placeholders, conditions);
    addCreatedFile(todoEnPath);

    updateProgress(
      'todo-generation',
      '✅ TODO.mdを生成しました',
      'セットアップ手順を確認してください'
    );

    recordStepResult('todo-generation', 'success', 'TODO.mdを生成しました', {
      files: [todoEnPath, todoJaPath],
    });

    console.log('✅ TODO.md を生成しました');
    return todoEnPath;
  } catch (error) {
    updateProgress(
      'todo-generation',
      '⚠️ TODO.mdの生成をスキップしました',
      'TODO.mdの生成中にエラーが発生しました'
    );

    recordStepResult(
      'todo-generation',
      'error',
      'TODO.mdの生成中にエラーが発生しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );

    console.warn('⚠️ TODO.md の生成に失敗しました:', error);
    return null;
  }
}
