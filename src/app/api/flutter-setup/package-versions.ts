/**
 * Flutter SDK バージョンに応じたパッケージバージョン自動管理
 */

export interface PackageVersionSet {
  // SDK要件
  sdkConstraint: string;

  // 基本パッケージ
  flutter_riverpod: string;
  shared_preferences: string;
  // intl は明示的に指定しない（flutter_localizationsが要求するバージョンを自動使用）

  // Firebase関連
  firebase_core: string;
  firebase_auth: string;
  cloud_firestore: string;
  firebase_storage: string;
  firebase_analytics: string;
  firebase_crashlytics: string;
  firebase_messaging: string;
  firebase_remote_config: string;

  // ユーティリティ
  package_info_plus: string;
  device_info_plus: string;
  url_launcher: string;

  // 高度な機能
  in_app_review: string;
  google_sign_in: string;
  sign_in_with_apple: string;
  flutter_local_notifications: string;
  permission_handler: string;

  // 収益化
  purchases_flutter: string;
  google_mobile_ads: string;
  app_tracking_transparency: string;

  // AI
  firebase_vertexai: string;

  // メディア
  image_picker: string;
  image_cropper: string;
  flutter_image_compress: string;

  // dev dependencies
  flutter_lints: string;
}

/**
 * Flutter SDK 3.x 対応パッケージバージョン
 */
const FLUTTER_3_UNIVERSAL: PackageVersionSet = {
  sdkConstraint: '>=3.0.0 <4.0.0',
  flutter_riverpod: '^2.6.1',
  shared_preferences: '^2.3.3',
  // intl: flutter_localizationsが要求するバージョンを自動使用
  firebase_core: '^3.15.2',
  firebase_auth: '^5.7.0',
  cloud_firestore: '^5.6.12',
  firebase_storage: '^12.4.10',
  firebase_analytics: '^11.6.0',
  firebase_crashlytics: '^4.3.10',
  firebase_messaging: '^15.2.1',
  firebase_remote_config: '^5.4.3',
  package_info_plus: '^8.1.2',
  device_info_plus: '^11.4.0',
  url_launcher: '^6.3.1',
  in_app_review: '^2.0.10',
  google_sign_in: '^6.2.3',
  sign_in_with_apple: '^6.1.3',
  flutter_local_notifications: '^18.0.1',
  permission_handler: '^11.3.1',
  purchases_flutter: '^8.9.0',
  google_mobile_ads: '^5.3.0',
  app_tracking_transparency: '^2.0.6',
  firebase_vertexai: '^1.2.0',
  image_picker: '^1.1.2',
  image_cropper: '^9.0.0',
  flutter_image_compress: '^2.4.0',
  flutter_lints: '^5.0.0',
};

/**
 * Flutter SDKバージョンを検出してパッケージセットを取得
 */
export async function detectOptimalPackageVersions(): Promise<{
  versions: PackageVersionSet;
  flutterVersion: string | null;
  recommendation: string;
}> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    // Flutter SDKバージョンを取得（情報提供用）
    const { stdout } = await execAsync('flutter --version');
    const versionMatch = stdout.match(/Flutter\s+(\d+)\.(\d+)\.(\d+)/i);

    if (!versionMatch) {
      console.log(
        '⚠️  Flutter SDKバージョンの検出に失敗。ユニバーサルパッケージセットを使用します。'
      );
      return {
        versions: FLUTTER_3_UNIVERSAL,
        flutterVersion: null,
        recommendation:
          'Flutter SDKバージョンの検出に失敗しました。Flutter 3.0以上を推奨します。\n' +
          'flutter pub getが自動的に互換性のあるパッケージバージョンを解決します。',
      };
    }

    const major = parseInt(versionMatch[1]);
    const minor = parseInt(versionMatch[2]);
    const flutterVersion = `${major}.${minor}.${versionMatch[3]}`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📱 検出されたFlutter SDKバージョン: ${flutterVersion}`);
    console.log(`${'='.repeat(80)}\n`);

    // Flutter 3.0未満はサポート外
    if (major < 3) {
      console.log(
        '❌ Flutter 3.0未満: サポートされていません。アップグレードが必要です'
      );
      throw new Error(
        `Flutter ${flutterVersion} はサポートされていません。Flutter 3.0以上が必要です。\n` +
          `アップグレード: flutter upgrade`
      );
    }

    // Flutter 3.xの場合、バージョンに応じた情報メッセージを表示
    let infoMessage = '';
    if (minor >= 24) {
      infoMessage = '✅ Flutter 3.24以上: 最新機能をフル活用できます';
    } else if (minor >= 19) {
      infoMessage = '✅ Flutter 3.19-3.23: 最新のパッケージを使用します';
    } else if (minor >= 10) {
      infoMessage =
        '✅ Flutter 3.10-3.18: pub getが互換性のあるバージョンを自動選択します';
    } else {
      infoMessage =
        '⚠️  Flutter 3.0-3.9: 古いバージョンです。Flutter 3.19以上へのアップグレードを推奨します';
    }
    console.log(infoMessage);

    console.log(`\n📦 パッケージバージョン管理方式:`);
    console.log(`   ✓ SDK制約: >=3.0.0 <4.0.0 (Flutter 3.x全体で互換)`);
    console.log(`   ✓ 最新のパッケージバージョンを指定`);
    console.log(`   ✓ flutter pub getが自動的に互換性のあるバージョンを解決`);
    console.log(`   ✓ ユーザーのSDKで利用可能な最新機能を使用\n`);

    const recommendation =
      minor < 10
        ? `Flutter ${flutterVersion} で動作しますが、Flutter 3.19以上へのアップグレードを推奨します。\n` +
          `flutter pub getが自動的に互換性のあるパッケージバージョンを選択します。`
        : `Flutter ${flutterVersion} で最適なパッケージバージョンが自動選択されます。`;

    return {
      versions: FLUTTER_3_UNIVERSAL, // 常に統一パッケージセットを使用
      flutterVersion,
      recommendation,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Flutter 3.0未満のエラーはそのまま投げる
    if (errorMessage.includes('サポートされていません')) {
      throw error;
    }

    console.error('⚠️  Flutter SDKバージョンの検出中にエラーが発生:', error);
    console.log('📦 ユニバーサルパッケージセットを使用します');

    return {
      versions: FLUTTER_3_UNIVERSAL,
      flutterVersion: null,
      recommendation:
        'Flutter SDKバージョンの検出に失敗しました。\n' +
        'Flutter 3.0以上を使用していることを確認してください。\n' +
        'flutter pub getが自動的に互換性のあるパッケージバージョンを解決します。\n\n' +
        '確認: flutter --version\n' +
        'アップグレード: flutter upgrade',
    };
  }
}

/**
 * パッケージバージョンセットをpubspec.yaml形式の文字列に変換
 */
export function formatDependencyVersions(
  versions: PackageVersionSet,
  useFirebase: boolean
): {
  sdkConstraint: string;
  dependencies: string;
} {
  let dependencies = `  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  flutter_riverpod: ${versions.flutter_riverpod}
  shared_preferences: ${versions.shared_preferences}`;
  // intl は flutter_localizations が要求するバージョンを自動使用

  if (useFirebase) {
    dependencies += `
  firebase_core: ${versions.firebase_core}
  firebase_auth: ${versions.firebase_auth}
  cloud_firestore: ${versions.cloud_firestore}
  firebase_storage: ${versions.firebase_storage}
  firebase_analytics: ${versions.firebase_analytics}
  firebase_crashlytics: ${versions.firebase_crashlytics}
  firebase_messaging: ${versions.firebase_messaging}
  firebase_remote_config: ${versions.firebase_remote_config}`;
  }

  return {
    sdkConstraint: versions.sdkConstraint,
    dependencies,
  };
}
