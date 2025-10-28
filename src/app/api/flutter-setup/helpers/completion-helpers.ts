import { addNextStep, updateProgress } from '../utils';

/**
 * セットアップ完了後の次のステップを追加
 */
export function addPostSetupSteps(
  fullOutputPath: string,
  useFirebase: boolean
) {
  addNextStep('プロジェクトディレクトリに移動: cd ' + fullOutputPath);

  if (useFirebase) {
    addNextStep(
      'アプリを実行: flutter run --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false'
    );
    addNextStep(
      'Firebase設定ファイル（google-services*.json / GoogleService-Info-*.plist）を取得した実ファイルに置き換えてください'
    );
    addNextStep(
      'iOSビルド時は --dart-define=ENVIRONMENT=<staging|production> --dart-define=PRODUCTION=<true|false> を指定してください'
    );
    addNextStep(
      'Xcodeの「Firebase Config Script」ビルドフェーズが有効化されているか確認してください'
    );
  } else {
    addNextStep('アプリを実行: flutter run');
  }
}

/**
 * セットアップ完了をマーク
 */
export function finalizeSetup() {
  updateProgress(
    'setup-complete',
    '✅ Flutterプロジェクトのセットアップが完了しました',
    'Flutterプロジェクトのセットアップが完了しました'
  );
}
