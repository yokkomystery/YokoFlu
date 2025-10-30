'use client';

import { useLocale } from '../context/LocaleContext';

interface BuildCommandsProps {
  useFirebase: boolean;
}

export function BuildCommands({ useFirebase }: BuildCommandsProps) {
  const { t, locale } = useLocale();

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">
          {t.build.android}
        </h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          <div className="text-green-400">
            # {t.build.staging}（{locale === 'ja' ? '開発' : 'Development'}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter run --flavor staging --dart-define=ENVIRONMENT=staging'
              : 'flutter run --flavor staging'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.staging} APK（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --release'
              : 'flutter build apk --flavor staging --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.staging} AAB（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build appbundle --flavor staging --dart-define=ENVIRONMENT=staging --release'
              : 'flutter build appbundle --flavor staging --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（{locale === 'ja' ? '開発' : 'Development'}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter run --flavor production --dart-define=ENVIRONMENT=production'
              : 'flutter run --flavor production'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production} APK（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --release'
              : 'flutter build apk --flavor production --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production} AAB（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build appbundle --flavor production --dart-define=ENVIRONMENT=production --release'
              : 'flutter build appbundle --flavor production --release'}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">
          {t.build.ios}
        </h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          <div className="text-green-400">
            # {t.build.staging}（{locale === 'ja' ? '開発' : 'Development'}）
          </div>
          <div className="text-gray-300">flutter run</div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（
            {locale === 'ja'
              ? '実機テスト - 実機のみ'
              : 'Device testing - Physical device only'}
            ）
          </div>
          <div className="text-gray-300">flutter run --release</div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（
            {locale === 'ja' ? '本番リリース' : 'Production release'}）
          </div>
          <div className="text-gray-300">flutter build ipa --release</div>
        </div>
        <div className="mt-2 bg-blue-900/30 border border-blue-700 text-blue-200 px-3 py-2 rounded text-xs whitespace-pre-line">
          {locale === 'ja'
            ? 'iOS環境の仕組み:\n• Debugモード (flutter run) → Staging環境\n  - Debug.xcconfig → Bundle ID: xxx.staging、App: AppName-STG\n  - GoogleService-Info-staging.plistを使用\n• Releaseモード (flutter run --release, flutter build ipa --release) → Production環境\n  - Release.xcconfig → Bundle ID: xxx、App: AppName\n  - GoogleService-Info-production.plistを使用\n\n注意: 環境はxcconfigファイルで決まります。--dart-defineは不要です。\nRelease実行は実機のみ対応（シミュレーター不可）\n\n【応用】シミュレーターでProduction環境をテスト:\n1. ios/Debug.xcconfigを編集（.stagingを削除、-STGを削除、ENVIRONMENT=production）\n2. flutter run\n3. テスト後、Debug.xcconfigを元に戻す'
            : 'How iOS environments work:\n• Debug mode (flutter run) → Staging environment\n  - Debug.xcconfig → Bundle ID: xxx.staging, App: AppName-STG\n  - Uses GoogleService-Info-staging.plist\n• Release mode (flutter run --release, flutter build ipa --release) → Production environment\n  - Release.xcconfig → Bundle ID: xxx, App: AppName\n  - Uses GoogleService-Info-production.plist\n\nNote: Environment is determined by xcconfig files. --dart-define is not needed.\nRelease mode only works on physical devices (not simulators)\n\n[Advanced] Test Production on Simulator:\n1. Edit ios/Debug.xcconfig (remove .staging, remove -STG, ENVIRONMENT=production)\n2. flutter run\n3. Revert Debug.xcconfig after testing'}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">
          {t.build.debug}
        </h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          <div className="text-green-400"># {t.build.android}</div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --debug'
              : 'flutter build apk --flavor staging --debug'}
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --debug'
              : 'flutter build apk --flavor production --debug'}
          </div>
          <div className="text-green-400 mt-2"># {t.build.ios}</div>
          <div className="text-gray-300">flutter build ios --debug</div>
          <div className="text-gray-300 text-xs mt-1">
            {locale === 'ja'
              ? '※ iOSは常にDebug.xcconfig（Staging）を使用'
              : '※ iOS always uses Debug.xcconfig (Staging)'}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded">
        <p className="text-sm text-blue-200">
          <strong>{t.build.tips}</strong>
        </p>
        <ul className="text-xs text-blue-300 mt-2 space-y-1 list-disc list-inside ml-2">
          <li>
            {locale === 'ja'
              ? '開発ビルド: 通常の`flutter run`を使用'
              : 'Development Build: Use regular `flutter run`'}
          </li>
          <li>
            {locale === 'ja'
              ? 'リリースビルド: `--release`フラグを追加'
              : 'Release Build: Add `--release` flag'}
          </li>
          <li>
            {locale === 'ja'
              ? 'Android環境切り替え: `--flavor`と`--dart-define=ENVIRONMENT=xxx`を指定'
              : 'Android environment switching: Specify `--flavor` and `--dart-define=ENVIRONMENT=xxx`'}
          </li>
          <li>
            {locale === 'ja'
              ? 'iOS環境切り替え: Debugモード→Staging、Releaseモード→Production（自動）'
              : 'iOS environment switching: Debug mode→Staging, Release mode→Production (automatic)'}
          </li>
        </ul>
      </div>
    </div>
  );
}
