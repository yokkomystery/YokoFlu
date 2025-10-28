import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { createSettingsScreen } from '../settings-utils';

import { AdvancedFeatureId } from '../../../../config/templateOptions';

export async function runSettingsScreen(
  appName: string,
  fullOutputPath: string,
  advancedFeatures: AdvancedFeatureId[],
  shouldCreate: boolean
) {
  if (!shouldCreate) {
    updateProgress(
      'settings-screen',
      '⏭️ 設定画面の作成をスキップしました',
      'テンプレート設定で無効化されています'
    );
    recordStepResult(
      'settings-screen',
      'skipped',
      '設定画面テンプレートは無効化されました'
    );
    return [] as string[];
  }

  updateProgress('settings-screen', '設定画面の準備', '設定画面を作成中...');
  try {
    const filePath = createSettingsScreen(appName, fullOutputPath, {
      advancedFeatures,
    });
    addCreatedFile(filePath);
    updateProgress(
      'settings-screen',
      '✅ 設定画面を作成しました',
      '設定画面を作成しました'
    );
    recordStepResult('settings-screen', 'success', '設定画面を作成しました', {
      files: filePath,
    });
    return [filePath];
  } catch (error) {
    updateProgress(
      'settings-screen',
      '❌ 設定画面の作成に失敗しました',
      '設定画面の作成に失敗しました'
    );
    recordStepResult(
      'settings-screen',
      'error',
      '設定画面の作成に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
