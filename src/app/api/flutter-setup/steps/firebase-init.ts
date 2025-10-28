import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { moveFirebaseConfigFiles } from '../firebase-utils';
import { updateProgress, recordStepResult } from '../utils';

const execAsync = promisify(exec);

function buildErrorMessage(error: unknown, toolLabel: string, hint?: string) {
  if (!error || typeof error !== 'object') {
    return `${toolLabel} の実行に失敗しました。${hint ?? ''}`.trim();
  }
  const stderr = (error as { stderr?: string })?.stderr || '';
  const stdout = (error as { stdout?: string })?.stdout || '';
  const message = (error as { message?: string })?.message || '';
  const body = String(message || stderr || stdout || error);
  return `${toolLabel} の実行に失敗しました:\n${body}${
    hint ? `\n${hint}` : ''
  }`;
}

// Android build.gradle.kts に環境別設定を適用
function updateAndroidBuildGradle(
  projectPath: string,
  appName: string,
  packageName: string
) {
  try {
    const buildGradlePath = path.join(
      projectPath,
      'android/app/build.gradle.kts'
    );
    const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    let updatedContent = buildGradleContent
      .replace(/namespace\s*=\s*["'].*["']/, `namespace = "${packageName}"`)
      .replace(
        /applicationId\s*=\s*["'].*["']/,
        `applicationId = "${packageName}"`
      )
      .replace(
        /ndkVersion\s*=\s*flutter\.ndkVersion/,
        `ndkVersion = "26.3.11579264"`
      );

    const productFlavorsConfig = `
    flavorDimensions += "environment"
    productFlavors {
        create("staging") {
            dimension = "environment"
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-staging"
        }
        create("production") {
            dimension = "environment"
        }
    }
    `;

    if (!updatedContent.includes('productFlavors {')) {
      updatedContent = updatedContent.replace(
        /android\s*\{/,
        (m) => `${m}\n${productFlavorsConfig}`
      );
    }

    fs.writeFileSync(buildGradlePath, updatedContent);
    console.log('✅ Android build.gradle.kts を更新しました');
  } catch (e) {
    console.warn('⚠️ Android build.gradle.kts の更新に失敗しました:', e);
  }
}

interface FirebaseInitParams {
  fullOutputPath: string;
  separateEnvironments: boolean;
  bundleId: string;
  packageName: string;
  resolvedStagingProjectId: string;
  resolvedProductionProjectId: string;
  resolvedSingleProjectId: string;
  projectId: string;
  useFirebase: boolean;
}

export async function runFirebaseInit({
  fullOutputPath,
  separateEnvironments,
  bundleId,
  packageName,
  resolvedStagingProjectId,
  resolvedProductionProjectId,
  resolvedSingleProjectId,
  projectId,
  useFirebase,
}: FirebaseInitParams) {
  if (!useFirebase) return;

  updateProgress(
    'firebase-init',
    'Firebaseプロジェクトの初期化',
    'Firebaseプロジェクトを初期化中...'
  );

  try {
    if (separateEnvironments) {
      // staging
      const stagingBundleId = `${bundleId}.staging`;
      const stagingPackageName = `${packageName}.staging`;

      updateProgress(
        'firebase-staging',
        'テスト環境の設定',
        `テスト環境「${resolvedStagingProjectId}」を設定中...`
      );

      const pubspecPath = path.join(fullOutputPath, 'pubspec.yaml');
      if (fs.existsSync(pubspecPath)) {
        const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
        console.log('📄 pubspec.yamlの内容（flutterfire configure実行前）:');
        console.log(pubspecContent.substring(0, 200) + '...');
      }

      const stagingConfigCommand = `cd ${fullOutputPath} && flutterfire configure --project=${resolvedStagingProjectId} --out=lib/firebase_options_staging.dart --ios-bundle-id=${stagingBundleId} --android-package-name=${stagingPackageName} --yes --platforms=android,ios`;
      await execAsync(stagingConfigCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          FLUTTERFIRE_NON_INTERACTIVE: 'true',
          FLUTTERFIRE_YES: 'true',
        },
      });

      updateProgress(
        'firebase-config-move-staging',
        'テスト環境の設定ファイル配置',
        'テスト環境の設定ファイルを配置中...'
      );
      await moveFirebaseConfigFiles(fullOutputPath, 'staging');
      updateProgress(
        'firebase-config-move-staging',
        '✅ テスト環境の設定ファイル配置が完了しました',
        'テスト環境の設定ファイル配置が完了しました'
      );

      updateAndroidBuildGradle(
        fullOutputPath,
        path.basename(fullOutputPath),
        packageName
      );
      updateProgress(
        'firebase-staging',
        '✅ テスト環境の設定が完了しました',
        'テスト環境の設定が完了しました'
      );

      // production
      updateProgress(
        'firebase-production',
        '本番環境の設定',
        `本番環境「${resolvedProductionProjectId}」を設定中...`
      );
      const productionConfigCommand = `cd ${fullOutputPath} && flutterfire configure --project=${resolvedProductionProjectId} --out=lib/firebase_options_production.dart --ios-bundle-id=${bundleId} --android-package-name=${packageName} --yes --platforms=android,ios`;
      await execAsync(productionConfigCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          FLUTTERFIRE_NON_INTERACTIVE: 'true',
          FLUTTERFIRE_YES: 'true',
        },
      });

      updateProgress(
        'firebase-config-move-production',
        'Firebase設定ファイル移動（本番）',
        'プロダクション環境の設定ファイルを移動中...'
      );
      await moveFirebaseConfigFiles(fullOutputPath, 'production');
      updateProgress(
        'firebase-config-move-production',
        '✅ プロダクション環境の設定ファイル移動が完了しました',
        'プロダクション環境の設定ファイル移動が完了しました'
      );

      updateProgress(
        'firebase-production',
        '✅ 本番環境の設定が完了しました',
        '本番環境の設定が完了しました'
      );
    } else {
      const singleConfigCommand = `cd ${fullOutputPath} && flutterfire configure --project=${resolvedSingleProjectId} --out=lib/firebase_options.dart --ios-bundle-id=${bundleId} --android-package-name=${packageName} --yes --platforms=android,ios`;
      await execAsync(singleConfigCommand, {
        timeout: 60000,
        env: {
          ...process.env,
          FLUTTERFIRE_NON_INTERACTIVE: 'true',
          FLUTTERFIRE_YES: 'true',
        },
      });
      updateProgress(
        'firebase-single',
        '✅ Firebase設定が完了しました',
        'Firebase設定が完了しました'
      );
    }

    updateProgress(
      'firebase-init',
      '✅ Firebase設定が完了しました',
      'Firebase設定が完了しました'
    );
    recordStepResult('firebase-init', 'success', 'Firebase設定が完了しました', {
      projectId,
    });
  } catch (error) {
    const message = buildErrorMessage(
      error,
      'Firebase設定コマンド',
      'flutterfire CLI（`dart pub global activate flutterfire_cli`）と Firebase CLI のセットアップ・認証状態を確認してください。'
    );
    updateProgress('firebase-init', '❌ Firebase設定に失敗しました', message);
    recordStepResult('firebase-init', 'error', message, { error: message });
    throw new Error(message);
  }
}
