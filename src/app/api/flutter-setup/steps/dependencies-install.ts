import { execFile } from 'child_process';
import { promisify } from 'util';
import { updateProgress, recordStepResult } from '../utils';

const execFileAsync = promisify(execFile);

export async function runDependenciesInstall(fullOutputPath: string) {
  updateProgress(
    'dependencies-install',
    '依存関係のインストール',
    '依存関係をインストール中...'
  );
  try {
    await execFileAsync('flutter', ['pub', 'get'], { cwd: fullOutputPath });

    updateProgress(
      'dependencies-install',
      '✅ 依存関係をインストールしました',
      '依存関係をインストールしました'
    );
    recordStepResult(
      'dependencies-install',
      'success',
      '依存関係をインストールしました'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // GUI用の簡潔なメッセージ
    let shortMessage = '❌ 依存関係のインストールに失敗しました';
    let errorType = 'unknown';

    // エラーの種類を判定
    if (
      errorMessage.includes('version solving failed') ||
      errorMessage.includes('incompatible')
    ) {
      shortMessage = '❌ パッケージのバージョン競合が発生しています';
      errorType = 'version_conflict';
    } else if (
      errorMessage.includes('FLUTTER_SDK') ||
      errorMessage.includes('sdk')
    ) {
      shortMessage = '❌ Flutter SDKのバージョンが要件を満たしていません';
      errorType = 'sdk_version';
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('failed to resolve')
    ) {
      shortMessage = '❌ ネットワークエラーが発生しました';
      errorType = 'network';
    }

    // GUI用メッセージ（簡潔）
    const guiMessage = `${shortMessage}\n\n💡 詳細なエラー情報と解決方法はターミナルを確認してください。`;

    // ターミナル用メッセージ（詳細）
    let terminalMessage = '\n' + '='.repeat(80) + '\n';
    terminalMessage += '❌ 依存関係のインストールに失敗しました\n';
    terminalMessage += '='.repeat(80) + '\n\n';

    if (errorType === 'version_conflict') {
      terminalMessage += '【原因】\n';
      terminalMessage += 'パッケージのバージョン競合が発生しています。\n';
      terminalMessage +=
        'Flutter SDKのバージョンと依存パッケージの間で互換性の問題があります。\n\n';
      terminalMessage += '【解決方法】\n';
      terminalMessage += '1. Flutter SDKを最新版にアップデートする：\n';
      terminalMessage += '   $ flutter upgrade\n\n';
      terminalMessage +=
        '2. または、互換性のあるFlutter SDKバージョンを使用する：\n';
      terminalMessage += '   推奨: Flutter 3.19.0以上\n';
      terminalMessage += '   確認: $ flutter --version\n\n';
      terminalMessage += '3. キャッシュをクリアして再試行：\n';
      terminalMessage += '   $ flutter pub cache repair\n';
      terminalMessage += '   $ flutter clean\n\n';
    } else if (errorType === 'sdk_version') {
      terminalMessage += '【原因】\n';
      terminalMessage +=
        'Flutter SDKのバージョンが要件を満たしていません。\n\n';
      terminalMessage += '【解決方法】\n';
      terminalMessage += '1. 現在のFlutter SDKバージョンを確認：\n';
      terminalMessage += '   $ flutter --version\n\n';
      terminalMessage += '2. Flutter SDKを最新版にアップデート：\n';
      terminalMessage += '   $ flutter upgrade\n\n';
      terminalMessage += '3. 特定のバージョンに切り替える場合：\n';
      terminalMessage += '   $ flutter version 3.19.0\n\n';
    } else if (errorType === 'network') {
      terminalMessage += '【原因】\n';
      terminalMessage +=
        'ネットワークエラーまたはpub.devへの接続に失敗しました。\n\n';
      terminalMessage += '【解決方法】\n';
      terminalMessage += '1. インターネット接続を確認してください\n\n';
      terminalMessage += '2. プロキシ設定を確認してください\n\n';
      terminalMessage +=
        '3. VPNを使用している場合は一時的に無効化してください\n\n';
      terminalMessage += '4. しばらく待ってから再試行してください\n\n';
    } else {
      terminalMessage += '【原因】\n';
      terminalMessage +=
        '依存関係のインストール中に予期しないエラーが発生しました。\n\n';
      terminalMessage += '【解決方法】\n';
      terminalMessage += '1. Flutter環境の診断を実行：\n';
      terminalMessage += '   $ flutter doctor -v\n\n';
      terminalMessage += '2. キャッシュをクリアして再試行：\n';
      terminalMessage += '   $ flutter pub cache repair\n';
      terminalMessage += '   $ flutter clean\n\n';
      terminalMessage += '3. 生成されたプロジェクトで直接実行：\n';
      terminalMessage += `   $ cd ${fullOutputPath}\n`;
      terminalMessage += '   $ flutter pub get\n\n';
    }

    terminalMessage += '【詳細なエラーメッセージ】\n';
    terminalMessage += '-'.repeat(80) + '\n';
    terminalMessage += errorMessage + '\n';
    terminalMessage += '-'.repeat(80) + '\n';

    // ターミナルに詳細を出力
    console.error(terminalMessage);

    // GUIには簡潔なメッセージ
    updateProgress('dependencies-install', shortMessage, guiMessage);
    recordStepResult('dependencies-install', 'error', guiMessage, {
      error: errorMessage,
      errorType,
      hint: 'Check terminal for detailed error information and solutions',
    });
    throw new Error(guiMessage);
  }
}
