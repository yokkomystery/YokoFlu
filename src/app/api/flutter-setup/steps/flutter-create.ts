import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { updateProgress, recordStepResult } from '../utils';

const execAsync = promisify(exec);

export async function runFlutterCreate(
  appName: string,
  bundleId: string,
  outputPath: string
) {
  updateProgress(
    'flutter-create',
    'Flutterプロジェクトの作成',
    'Flutterプロジェクトを作成中...'
  );

  const fullOutputPath = path.resolve(outputPath, appName);

  if (fs.existsSync(fullOutputPath)) {
    // GUI用の簡潔なメッセージ
    const guiMessage = `❌ 同じ名前のフォルダが既に存在します\n\nフォルダ: ${fullOutputPath}\n\n💡 別のアプリ名を指定するか、既存のフォルダを削除してください。`;

    // ターミナル用の詳細なメッセージ
    const terminalMessage =
      '\n' +
      '='.repeat(80) +
      '\n' +
      `❌ プロジェクトディレクトリが既に存在します\n` +
      '='.repeat(80) +
      '\n\n' +
      `【既存のパス】\n` +
      `${fullOutputPath}\n\n` +
      `【解決方法】\n` +
      `1. 別のアプリ名を指定する\n\n` +
      `2. 既存のディレクトリを削除する：\n` +
      `   $ rm -rf "${fullOutputPath}"\n\n` +
      `3. 別の出力パスを指定する\n\n` +
      '='.repeat(80) +
      '\n';

    console.error(terminalMessage);

    updateProgress(
      'flutter-create',
      '❌ 同じ名前のフォルダが既に存在します',
      guiMessage
    );
    recordStepResult('flutter-create', 'error', guiMessage, {
      path: fullOutputPath,
      hint: 'Directory already exists - choose a different name or delete the existing directory',
    });

    // エラーをスローして処理を停止
    throw new Error(guiMessage);
  }

  try {
    const projectName = appName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const bundleIdParts = bundleId.split('.');
    
    // Bundle IDの最後の部分を除いてorg IDを計算
    // 例: com.example.app → org: com.example
    // 例: com.app → org: com
    const orgId =
      bundleIdParts.length >= 2
        ? bundleIdParts.slice(0, -1).join('.')
        : 'com.example';  // デフォルト値（通常は起こらない）

    console.log(`📝 Organization ID: ${orgId}, Project Name: ${projectName}`);
    console.log(`📝 Expected package: ${bundleId} (will be ${orgId}.${projectName} by Flutter)`);
    
    const createCommand = `flutter create --org ${orgId} --project-name ${projectName} ${fullOutputPath}`;
    await execAsync(createCommand);

    updateProgress(
      'flutter-create',
      '✅ Flutterプロジェクトを作成しました',
      'Flutterプロジェクトを作成しました'
    );
    recordStepResult(
      'flutter-create',
      'success',
      'Flutterプロジェクトを作成しました',
      { path: fullOutputPath }
    );
    return fullOutputPath;
  } catch (error) {
    const hint =
      'Flutter SDK をインストールし、`flutter --version` が実行できることを確認してください。';
    const message =
      error instanceof Error ? `${error.message}\n${hint}` : String(error);
    updateProgress(
      'flutter-create',
      '❌ Flutterプロジェクトの作成に失敗しました',
      message
    );
    recordStepResult('flutter-create', 'error', message, { error: message });
    throw new Error(message);
  }
}
