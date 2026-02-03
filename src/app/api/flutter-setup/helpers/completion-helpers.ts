import { addNextStep, updateProgress } from '../utils';

/**
 * セットアップ完了後の次のステップを追加
 */
export function addPostSetupSteps(
  fullOutputPath: string,
  useFirebase: boolean,
  separateEnvironments: boolean
) {
  addNextStep('📖 TODO.md を確認してセットアップを完了してください');
  addNextStep('プロジェクトディレクトリに移動: cd ' + fullOutputPath);

  const runCommand = separateEnvironments
    ? 'flutter run --flavor staging --dart-define=ENVIRONMENT=staging'
    : 'flutter run';

  if (useFirebase) {
    addNextStep(
      '🔥 重要: Firebase ConsoleでFirestore Databaseを有効化してください'
    );
    addNextStep(
      '🔥 重要: Firestoreセキュリティルールを設定してください（TODO.md参照）'
    );
    addNextStep(`アプリを実行: ${runCommand}`);
    addNextStep('📋 詳細な手順はプロジェクト内の TODO.md を確認してください');
  } else {
    addNextStep(`アプリを実行: ${runCommand}`);
    addNextStep('📋 詳細な手順はプロジェクト内の TODO.md を確認してください');
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
