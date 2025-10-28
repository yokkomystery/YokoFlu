import {
  updateProgress,
  recordStepResult,
  addNextStep,
  addCreatedFile,
} from '../utils';
import {
  prepareAppIconAssets,
  runAppIconGenerator,
} from '../icon-generator-utils';

export async function runAppIcon(
  fullOutputPath: string,
  appName: string,
  appIcon: string | null | undefined
) {
  if (!appIcon) {
    updateProgress('app-icon', '⏭️ アプリアイコンの生成をスキップ', 'アイコン画像が指定されていません');
    recordStepResult('app-icon', 'skipped', 'アイコン画像が指定されていません');
    return [] as string[];
  }

  updateProgress('app-icon', 'アプリアイコンの生成', 'アプリアイコンを生成中...');
  try {
    // 1) 画像保存とpubspecへの設定追加
    const iconFilePath = prepareAppIconAssets(fullOutputPath, appIcon);
    addCreatedFile(iconFilePath);

    // 2) 実際のアイコン生成コマンド実行
    await runAppIconGenerator(fullOutputPath);

    const iconFiles = [iconFilePath];
    updateProgress('app-icon', '✅ アプリアイコンを生成しました', 'アプリアイコンを生成しました');
    recordStepResult('app-icon', 'success', 'アプリアイコンを生成しました', { files: iconFiles });
    addNextStep('アイコンが各プラットフォーム用に自動生成されました（Android: mipmap-*, iOS: AppIcon.appiconset）');
    return iconFiles;
  } catch (error) {
    updateProgress('app-icon', '⚠️ アプリアイコンの生成に失敗しました（スキップ）', 'アプリアイコンの生成に失敗しましたが、続行します');
    recordStepResult('app-icon', 'error', 'アプリアイコンの生成に失敗しました', {
      error: error instanceof Error ? error.message : String(error),
    });
    console.warn('⚠️ アイコン生成をスキップしました:', error);
    return [] as string[];
  }
}
