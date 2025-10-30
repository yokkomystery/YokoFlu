import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { createBuildScripts } from '../build-scripts';

export async function runBuildScripts(
  appName: string,
  fullOutputPath: string,
  useFirebase: boolean,
  separateEnvironments: boolean
) {
  updateProgress('build-scripts', 'ビルドスクリプトの作成', 'ビルドスクリプトを作成中...');
  try {
    const file = createBuildScripts(
      appName,
      fullOutputPath,
      useFirebase,
      separateEnvironments
    );
    if (Array.isArray(file)) {
      file.forEach((f) => addCreatedFile(f));
    } else if (file) {
      addCreatedFile(file as string);
    }
    updateProgress('build-scripts', '✅ ビルドスクリプトを作成しました', 'ビルドスクリプトを作成しました');
    recordStepResult('build-scripts', 'success', 'ビルドスクリプトを作成しました', { files: file });
    return file;
  } catch (error) {
    updateProgress('build-scripts', '❌ ビルドスクリプトの作成に失敗しました', 'ビルドスクリプトの作成に失敗しました');
    recordStepResult('build-scripts', 'error', 'ビルドスクリプトの作成に失敗しました', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
