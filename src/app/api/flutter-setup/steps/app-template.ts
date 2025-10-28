import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import {
  createAppTemplate,
  updateMainDartWithTemplate,
} from '../app-template-utils';
import { AppTemplateId } from '../../../../config/templateOptions';

export async function runAppTemplate(
  appTemplate: AppTemplateId,
  appName: string,
  fullOutputPath: string,
  options: { settingsEnabled: boolean }
) {
  updateProgress(
    'app-template',
    'アプリテンプレートの適用',
    `${appTemplate}テンプレートを適用中...`
  );
  try {
    const templateFiles = createAppTemplate(
      appTemplate,
      appName,
      fullOutputPath,
      {
        settingsEnabled: options.settingsEnabled,
      }
    );
    templateFiles.forEach((f) => addCreatedFile(f));

    // main.dart にテンプレートの import とホーム画面を設定
    updateMainDartWithTemplate(appTemplate, fullOutputPath, appName);

    updateProgress(
      'app-template',
      '✅ アプリテンプレートを適用しました',
      `${appTemplate}テンプレートを適用しました`
    );
    recordStepResult(
      'app-template',
      'success',
      `${appTemplate}テンプレートを適用しました`,
      {
        files: templateFiles,
        template: appTemplate,
      }
    );
    return templateFiles;
  } catch (error) {
    updateProgress(
      'app-template',
      '❌ アプリテンプレートの適用に失敗しました',
      'アプリテンプレートの適用に失敗しました'
    );
    recordStepResult(
      'app-template',
      'error',
      'アプリテンプレートの適用に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
