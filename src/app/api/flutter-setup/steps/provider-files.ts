import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { createProviderFiles } from '../build-scripts';

export async function runProviderFiles(
  fullOutputPath: string,
  localizationLanguages: string[]
): Promise<string[]> {
  updateProgress('provider-files', 'プロバイダーの準備', 'テーマとロケールプロバイダーを作成中...');
  try {
    const files = createProviderFiles(fullOutputPath, localizationLanguages);
    files.forEach((f) => addCreatedFile(f));
    updateProgress('provider-files', '✅ プロバイダーファイルを作成しました', 'テーマとロケールプロバイダーを作成しました');
    recordStepResult('provider-files', 'success', 'プロバイダーファイルを作成しました', { files });
    return files;
  } catch (error) {
    updateProgress('provider-files', '❌ プロバイダーファイルの作成に失敗しました', 'プロバイダーファイルの作成に失敗しました');
    recordStepResult('provider-files', 'error', 'プロバイダーファイルの作成に失敗しました', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

