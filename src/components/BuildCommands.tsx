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
              ? 'flutter run --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false'
              : 'flutter run --flavor staging'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.staging} APK（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release'
              : 'flutter build apk --flavor staging --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.staging} AAB（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build appbundle --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release'
              : 'flutter build appbundle --flavor staging --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（{locale === 'ja' ? '開発' : 'Development'}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter run --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true'
              : 'flutter run --flavor production'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production} APK（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release'
              : 'flutter build apk --flavor production --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production} AAB（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build appbundle --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release'
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
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter run --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false'
              : 'flutter run'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.staging}（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ios --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release'
              : 'flutter build ios --release'}
          </div>
          <div className="text-green-400 mt-2"># {t.build.staging} IPA</div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ipa --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release'
              : 'flutter build ipa --release'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（{locale === 'ja' ? '開発' : 'Development'}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter run --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true'
              : 'flutter run'}
          </div>
          <div className="text-green-400 mt-2">
            # {t.build.production}（{t.build.release}）
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ios --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release'
              : 'flutter build ios --release'}
          </div>
          <div className="text-green-400 mt-2"># {t.build.production} IPA</div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ipa --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release'
              : 'flutter build ipa --release'}
          </div>
        </div>
        <div className="mt-2 bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-3 py-2 rounded text-xs">
          ℹ️{' '}
          {locale === 'ja'
            ? 'iOSは`--flavor`は使用できません。Xcodeでビルド構成（Staging/Production）を選択してください。\n`flutter build ipa`は自動的にアーカイブしてIPAファイルを生成します（`build/ios/ipa/`）。'
            : 'iOS does not support `--flavor`. Select build configuration (Staging/Production) in Xcode.\n`flutter build ipa` automatically creates an archive and IPA file in `build/ios/ipa/`.'}
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
              ? 'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --debug'
              : 'flutter build apk --flavor staging --debug'}
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --debug'
              : 'flutter build apk --flavor production --debug'}
          </div>
          <div className="text-green-400 mt-2"># {t.build.ios}</div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ios --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --debug'
              : 'flutter build ios --debug'}
          </div>
          <div className="text-gray-300">
            {useFirebase
              ? 'flutter build ios --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --debug'
              : 'flutter build ios --debug'}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded">
        <p className="text-sm text-blue-200">
          💡 <strong>{t.build.tips}</strong>
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
              ? 'デバッグビルド: `--debug`フラグを追加'
              : 'Debug Build: Add `--debug` flag'}
          </li>
          <li>
            {locale === 'ja'
              ? 'Firebase使用時は環境変数を指定: `--dart-define=ENVIRONMENT=staging`など'
              : 'When using Firebase, specify environment variables: `--dart-define=ENVIRONMENT=staging`, etc.'}
          </li>
        </ul>
      </div>
    </div>
  );
}
