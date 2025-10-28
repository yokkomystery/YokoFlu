import { updateProgress, recordStepResult } from '../utils';
import { updateMainDart } from '../build-scripts';

import { AdvancedFeatureId } from '../../../../config/templateOptions';

export async function runMainDartUpdate(
  fullOutputPath: string,
  appName: string,
  useFirebase: boolean,
  localizationLanguages: string[],
  advancedFeatures: AdvancedFeatureId[]
) {
  updateProgress('main-dart-update', 'main.dartの更新', 'main.dartを更新中...');
  try {
    const mainDartPath = updateMainDart(
      fullOutputPath,
      appName,
      useFirebase,
      localizationLanguages,
      advancedFeatures
    );
    updateProgress(
      'main-dart-update',
      '✅ main.dartを更新しました',
      'main.dartを更新しました'
    );
    recordStepResult('main-dart-update', 'success', 'main.dartを更新しました', {
      file: mainDartPath || 'main.dart',
    });
    return mainDartPath;
  } catch (error) {
    updateProgress(
      'main-dart-update',
      '❌ main.dartの更新に失敗しました',
      'main.dartの更新に失敗しました'
    );
    recordStepResult(
      'main-dart-update',
      'error',
      'main.dartの更新に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
