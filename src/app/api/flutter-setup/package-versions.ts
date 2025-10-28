/**
 * Flutter SDK バージョンに応じたパッケージバージョン自動管理
 *
 * ユーザーのFlutter SDKバージョンを検出し、互換性のあるパッケージバージョンを自動選択
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
  url_launcher: string;

  // 高度な機能
  in_app_review: string;
  google_sign_in: string;
  sign_in_with_apple: string;

  // dev dependencies
  flutter_lints: string;
}

/**
 * Flutter SDK 3.24以上 (2024年後半~)
 * SDK制約を緩和: >=3.19.0 でも動作するように
 */
const FLUTTER_3_24_PLUS: PackageVersionSet = {
  sdkConstraint: '>=3.19.0 <4.0.0', // 緩和: 3.19以上で動作
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
  url_launcher: '^6.3.1',
  in_app_review: '^2.0.10',
  google_sign_in: '^6.2.2',
  sign_in_with_apple: '^6.1.3',
  flutter_lints: '^5.0.0',
};

/**
 * Flutter SDK 3.19-3.23 (2024年前半)
 * SDK制約を緩和: >=3.10.0 でも動作するように
 */
const FLUTTER_3_19_TO_3_23: PackageVersionSet = {
  sdkConstraint: '>=3.10.0 <4.0.0', // 緩和: 3.10以上で動作
  flutter_riverpod: '^2.5.1',
  shared_preferences: '^2.2.3',
  // intl: flutter_localizationsが要求するバージョンを自動使用
  firebase_core: '^3.6.0',
  firebase_auth: '^5.3.0',
  cloud_firestore: '^5.4.0',
  firebase_storage: '^12.3.0',
  firebase_analytics: '^11.3.0',
  firebase_crashlytics: '^4.1.0',
  firebase_messaging: '^15.1.0',
  firebase_remote_config: '^5.1.0',
  package_info_plus: '^7.0.0',
  url_launcher: '^6.3.0',
  in_app_review: '^2.0.9',
  google_sign_in: '^6.2.1',
  sign_in_with_apple: '^6.1.2',
  flutter_lints: '^4.0.0',
};

/**
 * Flutter SDK 3.10-3.18 (2023年)
 * SDK制約を緩和: >=3.0.0 でも動作するように
 */
const FLUTTER_3_10_TO_3_18: PackageVersionSet = {
  sdkConstraint: '>=3.0.0 <4.0.0', // 緩和: 3.0以上で動作
  flutter_riverpod: '^2.4.0',
  shared_preferences: '^2.2.2',
  // intl: flutter_localizationsが要求するバージョンを自動使用
  firebase_core: '^2.24.0',
  firebase_auth: '^4.15.0',
  cloud_firestore: '^4.13.0',
  firebase_storage: '^11.5.0',
  firebase_analytics: '^10.7.0',
  firebase_crashlytics: '^3.4.0',
  firebase_messaging: '^14.7.0',
  firebase_remote_config: '^4.3.0',
  package_info_plus: '^4.2.0',
  url_launcher: '^6.2.0',
  in_app_review: '^2.0.8',
  google_sign_in: '^6.1.6',
  sign_in_with_apple: '^5.0.0',
  flutter_lints: '^3.0.0',
};

/**
 * Flutter SDK 3.0-3.9 (2022-2023)
 * 最も広い互換性を持つバージョン
 */
const FLUTTER_3_0_TO_3_9: PackageVersionSet = {
  sdkConstraint: '>=3.0.0 <4.0.0',
  flutter_riverpod: '^2.3.0',
  shared_preferences: '^2.1.0',
  // intl: flutter_localizationsが要求するバージョンを自動使用
  firebase_core: '^2.10.0',
  firebase_auth: '^4.4.0',
  cloud_firestore: '^4.5.0',
  firebase_storage: '^11.1.0',
  firebase_analytics: '^10.2.0',
  firebase_crashlytics: '^3.1.0',
  firebase_messaging: '^14.4.0',
  firebase_remote_config: '^4.0.0',
  package_info_plus: '^4.0.0',
  url_launcher: '^6.1.10',
  in_app_review: '^2.0.6',
  google_sign_in: '^6.1.0',
  sign_in_with_apple: '^4.3.0',
  flutter_lints: '^2.0.0',
};

/**
 * Flutter SDKバージョンを検出して最適なパッケージセットを取得
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
    // Flutter SDKバージョンを取得
    const { stdout } = await execAsync('flutter --version');
    const versionMatch = stdout.match(/Flutter\s+(\d+)\.(\d+)\.(\d+)/i);

    if (!versionMatch) {
      console.log(
        '⚠️  Flutter SDKバージョンの検出に失敗。最も互換性の高いバージョンを使用します。'
      );
      return {
        versions: FLUTTER_3_10_TO_3_18,
        flutterVersion: null,
        recommendation:
          'Flutter SDKバージョンの検出に失敗しました。Flutter 3.10以上を推奨します。',
      };
    }

    const major = parseInt(versionMatch[1]);
    const minor = parseInt(versionMatch[2]);
    const flutterVersion = `${major}.${minor}.${versionMatch[3]}`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📱 検出されたFlutter SDKバージョン: ${flutterVersion}`);
    console.log(`${'='.repeat(80)}\n`);

    // バージョンに応じたパッケージセットを選択
    let selectedVersions: PackageVersionSet;
    let selectionReason: string;

    if (major === 3 && minor >= 24) {
      console.log(
        '✅ Flutter 3.24以上: 最新のパッケージバージョンを使用します'
      );
      selectedVersions = FLUTTER_3_24_PLUS;
      selectionReason = `Flutter ${flutterVersion} で最適化されたパッケージを使用します。`;
    } else if (major === 3 && minor >= 19) {
      console.log(
        '✅ Flutter 3.19-3.23: 互換性のあるパッケージバージョンを使用します'
      );
      selectedVersions = FLUTTER_3_19_TO_3_23;
      selectionReason = `Flutter ${flutterVersion} と互換性のあるパッケージを使用します。`;
    } else if (major === 3 && minor >= 10) {
      console.log(
        '✅ Flutter 3.10-3.18: 互換性のあるパッケージバージョンを使用します'
      );
      selectedVersions = FLUTTER_3_10_TO_3_18;
      selectionReason = `Flutter ${flutterVersion} と互換性のあるパッケージを使用します。`;
    } else if (major === 3 && minor >= 0) {
      console.log(
        '⚠️  Flutter 3.0-3.9: 古いバージョンです。アップグレードを推奨します'
      );
      selectedVersions = FLUTTER_3_0_TO_3_9;
      selectionReason = `Flutter ${flutterVersion} は古いバージョンです。Flutter 3.19以上へのアップグレードを推奨します。`;
    } else {
      console.log(
        '❌ Flutter 3.0未満: サポートされていません。アップグレードが必要です'
      );
      throw new Error(
        `Flutter ${flutterVersion} はサポートされていません。Flutter 3.0以上が必要です。\n` +
          `アップグレード: flutter upgrade`
      );
    }

    // SDK制約は固定で緩い制約を使用（最大の互換性を確保）
    // pubspec.yamlのSDK制約はDart SDKのバージョンを指定するため、
    // Flutter SDKバージョンから直接計算するのは不正確
    // より安全な方法として、広範囲をサポートする制約を使用
    const safeConstraint = '>=3.0.0 <4.0.0';

    console.log(`📦 安全なSDK制約を設定: ${safeConstraint}`);
    console.log(`   (Flutter 3.0以上のすべてのバージョンで動作します)`);
    console.log(`   選択されたパッケージセット: Flutter ${flutterVersion} 用`);

    return {
      versions: {
        ...selectedVersions,
        sdkConstraint: safeConstraint, // 広範囲の互換性を確保
      },
      flutterVersion,
      recommendation: selectionReason,
    };
  } catch (error) {
    console.error('⚠️  Flutter SDKバージョンの検出中にエラーが発生:', error);
    console.log(
      '📦 デフォルトのパッケージバージョンを使用します (Flutter 3.10-3.18互換)'
    );

    return {
      versions: FLUTTER_3_10_TO_3_18,
      flutterVersion: null,
      recommendation:
        'Flutter SDKバージョンの検出に失敗しました。\n' +
        'Flutter 3.10以上を使用していることを確認してください。\n' +
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

  dependencies += `
  package_info_plus: ${versions.package_info_plus}
  url_launcher: ${versions.url_launcher}`;

  return {
    sdkConstraint: versions.sdkConstraint,
    dependencies,
  };
}
