import { updateProgress, recordStepResult } from '../utils';
import { updatePubspecYaml } from '../build-scripts';
import { getAdvancedFeatureDependencies } from '../advanced-features-utils';
import { detectOptimalPackageVersions } from '../package-versions';

import { AdvancedFeatureId } from '../../../../config/templateOptions';

export async function runPubspecUpdate(
  fullOutputPath: string,
  useFirebase: boolean,
  advancedFeatures: AdvancedFeatureId[]
) {
  updateProgress(
    'pubspec-update',
    '必要なライブラリの追加',
    '必要なライブラリを追加中...'
  );
  try {
    // Flutter SDKバージョンを検出して最適なパッケージバージョンを取得
    console.log('🔍 Flutter SDKバージョンを検出中...');
    const { versions, flutterVersion, recommendation } =
      await detectOptimalPackageVersions();

    if (flutterVersion) {
      console.log(
        `✅ Flutter SDK ${flutterVersion} に最適化されたパッケージを使用します`
      );
      updateProgress(
        'pubspec-update',
        '必要なライブラリの追加',
        `Flutter ${flutterVersion} 用のパッケージを設定中...`
      );
    } else {
      console.log('⚠️  ' + recommendation);
      updateProgress(
        'pubspec-update',
        '必要なライブラリの追加',
        '互換性のあるパッケージバージョンを設定中...'
      );
    }

    const additionalDeps = getAdvancedFeatureDependencies(advancedFeatures);
    const pubspecPath = updatePubspecYaml(
      fullOutputPath,
      useFirebase,
      additionalDeps,
      versions // 検出されたバージョンセットを渡す
    );

    if (pubspecPath) {
      const successMessage = flutterVersion
        ? `✅ Flutter ${flutterVersion} 用のライブラリを追加しました`
        : '✅ 必要なライブラリを追加しました';

      updateProgress(
        'pubspec-update',
        successMessage,
        '必要なライブラリを追加しました'
      );
      recordStepResult(
        'pubspec-update',
        'success',
        'pubspec.yamlを更新しました',
        {
          file: pubspecPath,
          flutterVersion,
          recommendation,
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Flutter SDKバージョンの問題かどうかチェック
    if (
      errorMessage.includes('サポートされていません') ||
      errorMessage.includes('Flutter 3.0以上が必要')
    ) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ Flutter SDKバージョンエラー');
      console.error('='.repeat(80));
      console.error(errorMessage);
      console.error('='.repeat(80) + '\n');

      updateProgress(
        'pubspec-update',
        '❌ Flutter SDKのアップグレードが必要です',
        `${errorMessage}\n\n💡 詳細はターミナルを確認してください。`
      );
    } else {
      updateProgress(
        'pubspec-update',
        '❌ pubspec.yamlの更新に失敗しました',
        'pubspec.yamlの更新に失敗しました'
      );
    }

    recordStepResult(
      'pubspec-update',
      'error',
      'pubspec.yamlの更新に失敗しました',
      {
        error: errorMessage,
      }
    );
  }
}
