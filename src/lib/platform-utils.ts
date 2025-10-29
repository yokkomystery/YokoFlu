/**
 * プラットフォーム判定ユーティリティ
 */

export type Platform = 'macos' | 'windows' | 'linux' | 'unknown';

/**
 * 現在のプラットフォームを判定
 */
export function detectPlatform(): Platform {
  if (typeof process === 'undefined') {
    return 'unknown';
  }

  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
}

/**
 * iOS開発が可能か判定
 */
export function canDevelopIos(platform?: Platform): boolean {
  const currentPlatform = platform || detectPlatform();
  return currentPlatform === 'macos';
}

/**
 * Android開発が可能か判定
 */
export function canDevelopAndroid(platform?: Platform): boolean {
  const currentPlatform = platform || detectPlatform();
  // Android開発はすべてのプラットフォームで可能（理論上）
  return ['macos', 'windows', 'linux'].includes(currentPlatform);
}

/**
 * プラットフォーム名を表示用文字列に変換
 */
export function getPlatformDisplayName(
  platform?: Platform,
  locale: 'en' | 'ja' = 'en'
): string {
  const currentPlatform = platform || detectPlatform();

  const names = {
    en: {
      macos: 'macOS',
      windows: 'Windows',
      linux: 'Linux',
      unknown: 'Unknown',
    },
    ja: {
      macos: 'macOS',
      windows: 'Windows',
      linux: 'Linux',
      unknown: '不明',
    },
  };

  return names[locale][currentPlatform];
}

/**
 * プラットフォーム固有の警告メッセージを取得
 */
export function getPlatformWarnings(
  platform?: Platform,
  locale: 'en' | 'ja' = 'en'
): string[] {
  const currentPlatform = platform || detectPlatform();
  const warnings: string[] = [];

  const messages = {
    en: {
      windowsIos:
        '⚠️ iOS development is not supported on Windows. You can only develop Android apps.',
      linuxIos:
        '⚠️ iOS development is not supported on Linux. You can only develop Android apps.',
      linuxUntested:
        '⚠️ YOKOFLU has not been tested on Linux. Android development should work, but you may encounter issues.',
      unknownPlatform:
        '⚠️ Your platform could not be detected. YOKOFLU may not work correctly.',
    },
    ja: {
      windowsIos:
        '⚠️ Windows では iOS 開発ができません。Android アプリのみ開発可能です。',
      linuxIos:
        '⚠️ Linux では iOS 開発ができません。Android アプリのみ開発可能です。',
      linuxUntested:
        '⚠️ YOKOFLU は Linux 上でテストされていません。Android 開発は動作すると思われますが、問題が発生する可能性があります。',
      unknownPlatform:
        '⚠️ プラットフォームを検出できませんでした。YOKOFLU が正常に動作しない可能性があります。',
    },
  };

  switch (currentPlatform) {
    case 'windows':
      warnings.push(messages[locale].windowsIos);
      break;
    case 'linux':
      warnings.push(messages[locale].linuxIos);
      warnings.push(messages[locale].linuxUntested);
      break;
    case 'unknown':
      warnings.push(messages[locale].unknownPlatform);
      break;
  }

  return warnings;
}

/**
 * サーバーサイドでプラットフォーム情報を取得
 * （APIルート用）
 */
export function getServerPlatformInfo() {
  const platform = detectPlatform();

  return {
    platform,
    displayName: getPlatformDisplayName(platform),
    canDevelopIos: canDevelopIos(platform),
    canDevelopAndroid: canDevelopAndroid(platform),
    warnings: {
      en: getPlatformWarnings(platform, 'en'),
      ja: getPlatformWarnings(platform, 'ja'),
    },
  };
}
