import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { createIOSConfigs } from '../ios-config';

export async function runIOSConfig(
  bundleId: string,
  appName: string,
  fullOutputPath: string,
  separateEnvironments: boolean
): Promise<string[]> {
  updateProgress('ios-config', 'iOS設定ファイルの作成', 'iOS設定ファイルを作成中...');
  try {
    const files = createIOSConfigs(bundleId, appName, fullOutputPath, separateEnvironments);
    files.forEach((f) => addCreatedFile(f));
    updateProgress('ios-config', '✅ iOS設定ファイルを作成しました', 'iOS設定ファイルを作成しました');
    recordStepResult('ios-config', 'success', 'iOS設定ファイルを作成しました', { files });
    return files;
  } catch (error) {
    updateProgress('ios-config', '❌ iOS設定ファイルの作成に失敗しました', 'iOS設定ファイルの作成に失敗しました');
    recordStepResult('ios-config', 'error', 'iOS設定ファイルの作成に失敗しました', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

