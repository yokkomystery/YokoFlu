import {
  updateProgress,
  recordStepResult,
  addCreatedFile,
  addNextStep,
} from '../utils';
import {
  createAdvancedFeatures,
  getAdvancedFeatureTodoNotes,
} from '../advanced-features-utils';
import { AdvancedFeatureId } from '../../../../config/templateOptions';

export async function runAdvancedFeatures(
  features: AdvancedFeatureId[],
  appName: string,
  fullOutputPath: string
) {
  if (!features || features.length === 0) {
    updateProgress(
      'advanced-features',
      '⏭️ 高度な機能の適用をスキップ',
      '高度な機能が選択されていません'
    );
    recordStepResult(
      'advanced-features',
      'skipped',
      '高度な機能が選択されていません'
    );
    return [];
  }

  updateProgress(
    'advanced-features',
    '高度な機能の適用',
    `選択された機能を適用中... (${features.length}件)`
  );
  try {
    const files = createAdvancedFeatures(features, appName, fullOutputPath);
    files.forEach((f) => addCreatedFile(f));

    const todoNotes = getAdvancedFeatureTodoNotes(features);
    todoNotes.forEach((note) => addNextStep(note));

    updateProgress(
      'advanced-features',
      '✅ 高度な機能を適用しました',
      `${features.length}件の機能を適用しました`
    );
    recordStepResult(
      'advanced-features',
      'success',
      '高度な機能を適用しました',
      {
        files,
        features,
        todoNotes,
      }
    );
    return files;
  } catch (error) {
    updateProgress(
      'advanced-features',
      '❌ 高度な機能の適用に失敗しました',
      '高度な機能の適用に失敗しました'
    );
    recordStepResult(
      'advanced-features',
      'error',
      '高度な機能の適用に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
