import { FirebaseVersions } from './types';
import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Firebase設定ファイルの移動処理（Qiita記事の手順に準拠）
export const moveFirebaseConfigFiles = async (
  projectPath: string,
  environment: 'staging' | 'production'
) => {
  try {
    console.log(
      `Moving Firebase config files for ${environment} environment...`
    );

    // iOS設定ファイルの移動
    const iosSourcePath = path.join(
      projectPath,
      'ios/Runner/GoogleService-Info.plist'
    );
    const iosDestPath = path.join(
      projectPath,
      `ios/Runner/GoogleService-Info-${environment}.plist`
    );

    if (fs.existsSync(iosSourcePath)) {
      fs.renameSync(iosSourcePath, iosDestPath);
      console.log(`✅ Moved iOS config:`);
      console.log(`   From: ${iosSourcePath}`);
      console.log(`   To:   ${iosDestPath}`);
    } else {
      console.log(`⚠️ iOS config file not found:`);
      console.log(`   ${iosSourcePath}`);
    }

    // Android設定ファイルの移動
    const androidSourcePath = path.join(
      projectPath,
      'android/app/google-services.json'
    );
    const androidDestDir = path.join(
      projectPath,
      `android/app/src/${environment}`
    );
    const androidDestPath = path.join(androidDestDir, 'google-services.json');

    if (fs.existsSync(androidSourcePath)) {
      // ディレクトリが存在しない場合は作成
      if (!fs.existsSync(androidDestDir)) {
        fs.mkdirSync(androidDestDir, { recursive: true });
        console.log(`✅ Created directory:`);
        console.log(`   ${androidDestDir}`);
      }

      fs.renameSync(androidSourcePath, androidDestPath);
      console.log(`✅ Moved Android config:`);
      console.log(`   From: ${androidSourcePath}`);
      console.log(`   To:   ${androidDestPath}`);
    } else {
      console.log(`⚠️ Android config file not found:`);
      console.log(`   ${androidSourcePath}`);
    }

    return {
      iosFile: iosDestPath,
      androidFile: androidDestPath,
      environment,
    };
  } catch (error) {
    console.error(
      `Error moving Firebase config files for ${environment}:`,
      error
    );
    throw error;
  }
};

// 環境別ディレクトリ構造の作成
export const createEnvironmentDirectories = (projectPath: string) => {
  const directories = [
    path.join(projectPath, 'android', 'app', 'src', 'staging'),
    path.join(projectPath, 'android', 'app', 'src', 'production'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
};

// flutterfire configureコマンドの実行
export const runFlutterfireConfigure = async (
  projectPath: string,
  projectId: string,
  bundleId: string,
  packageName: string,
  environment: 'staging' | 'production'
) => {
  try {
    const isStaging = environment === 'staging';
    const outputFile = isStaging
      ? 'lib/firebase_options_staging.dart'
      : 'lib/firebase_options_production.dart';

    const bundleIdSuffix = isStaging ? '.staging' : '';
    const packageNameSuffix = isStaging ? '.staging' : '';

    console.log(`🔄 Running flutterfire configure for ${environment}...`);
    const { stderr } = await execFileAsync(
      'flutterfire',
      [
        'configure',
        `--project=${projectId}-${environment}`,
        `--out=${outputFile}`,
        `--ios-bundle-id=${bundleId}${bundleIdSuffix}`,
        `--android-package-name=${packageName}${packageNameSuffix}`,
      ],
      { cwd: projectPath }
    );

    if (stderr) {
      console.log(`⚠️ flutterfire configure warnings: ${stderr}`);
    }

    console.log(`✅ flutterfire configure completed for ${environment}`);
    return true;
  } catch (error) {
    console.error(`❌ flutterfire configure failed for ${environment}:`, error);
    return false;
  }
};

// 設定ファイルのリネーム
export const renameFirebaseConfigFiles = (
  projectPath: string,
  environment: 'staging' | 'production'
) => {
  const iosConfigPath = path.join(projectPath, 'ios', 'Runner');
  const androidConfigPath = path.join(projectPath, 'android', 'app');

  // iOS設定ファイルのリネーム
  const iosSource = path.join(iosConfigPath, 'GoogleService-Info.plist');
  const iosDest = path.join(
    iosConfigPath,
    `GoogleService-Info-${environment}.plist`
  );

  if (fs.existsSync(iosSource)) {
    fs.renameSync(iosSource, iosDest);
    console.log(`✅ Renamed iOS config: ${iosSource} → ${iosDest}`);
  }

  // Android設定ファイルの移動
  const androidSource = path.join(androidConfigPath, 'google-services.json');
  const androidDest = path.join(
    androidConfigPath,
    'src',
    environment,
    'google-services.json'
  );

  if (fs.existsSync(androidSource)) {
    // ディレクトリが存在しない場合は作成
    const androidDestDir = path.dirname(androidDest);
    if (!fs.existsSync(androidDestDir)) {
      fs.mkdirSync(androidDestDir, { recursive: true });
    }

    fs.renameSync(androidSource, androidDest);
    console.log(`✅ Moved Android config: ${androidSource} → ${androidDest}`);
  }
};

// Firebaseパッケージの推奨バージョンを取得
// NOTE: 将来的にはpub.dev APIから動的に取得することも検討
export function getLatestFirebaseVersions(): FirebaseVersions {
  return {
    firebase_core: '^3.15.2',
    firebase_auth: '^5.7.0',
    cloud_firestore: '^5.6.12',
    firebase_storage: '^12.4.10',
    firebase_analytics: '^11.6.0',
    firebase_crashlytics: '^4.3.10',
    firebase_messaging: '^15.2.1',
  };
}

// Firebase設定ファイルの作成（改善版）
export async function createFirebaseConfigs(
  appName: string,
  projectPath: string,
  separateEnvironments: boolean,
  firebaseProjectId?: string,
  bundleId?: string,
  packageName?: string
) {
  const createdFiles: string[] = [];

  // 環境別ディレクトリ構造の作成
  if (separateEnvironments) {
    createEnvironmentDirectories(projectPath);
  }

  // firebase_config.dartの作成（lib/coreディレクトリに配置）
  const coreDir = path.join(projectPath, 'lib', 'core');
  if (!fs.existsSync(coreDir)) {
    fs.mkdirSync(coreDir, { recursive: true });
  }

  const firebaseConfigPath = path.join(coreDir, 'firebase_config.dart');

  const templatePath = getTemplatePath('core/firebase_config.dart');
  copyTemplateFile(
    templatePath,
    firebaseConfigPath,
    {
      APP_NAME: appName.toLowerCase(),
    },
    {
      ENVIRONMENT_SEPARATION: separateEnvironments,
    }
  );

  createdFiles.push(firebaseConfigPath);

  // 環境別設定が必要で、Firebaseプロジェクト情報が提供されている場合
  if (separateEnvironments && firebaseProjectId && bundleId && packageName) {
    console.log(
      '🔄 Setting up Firebase configurations for both environments...'
    );

    // Staging環境の設定
    const stagingSuccess = await runFlutterfireConfigure(
      projectPath,
      firebaseProjectId,
      bundleId,
      packageName,
      'staging'
    );

    if (stagingSuccess) {
      renameFirebaseConfigFiles(projectPath, 'staging');
    }

    // Production環境の設定
    const productionSuccess = await runFlutterfireConfigure(
      projectPath,
      firebaseProjectId,
      bundleId,
      packageName,
      'production'
    );

    if (productionSuccess) {
      renameFirebaseConfigFiles(projectPath, 'production');
    }

    console.log('✅ Firebase環境別設定が完了しました');
    console.log('ℹ️ 以下のファイルが作成されました:');
    console.log('  - lib/firebase_options_staging.dart');
    console.log('  - lib/firebase_options_production.dart');
    console.log('  - ios/Runner/GoogleService-Info-staging.plist');
    console.log('  - ios/Runner/GoogleService-Info-production.plist');
    console.log('  - android/app/src/staging/google-services.json');
    console.log('  - android/app/src/production/google-services.json');
  } else {
    console.log(
      '✅ Firebase設定ファイル（firebase_config.dart）を作成しました'
    );
    console.log(
      'ℹ️ 環境別設定が必要な場合は、flutterfire configureコマンドを手動で実行してください'
    );
  }

  return createdFiles.join(', ');
}
