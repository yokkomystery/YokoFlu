'use client';

import { useLocale } from '../context/LocaleContext';

interface BuildCommandsProps {
  separateEnvironments: boolean;
}

export function BuildCommands({ separateEnvironments }: BuildCommandsProps) {
  const { t, locale } = useLocale();
  const developmentLabel = locale === 'ja' ? '開発' : 'Development';

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">
          {t.build.android}
        </h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          {separateEnvironments ? (
            <>
              <div className="text-green-400">
                # {t.build.staging}（{developmentLabel}）
              </div>
              <div className="text-gray-300">
                {'flutter run --flavor staging --dart-define=ENVIRONMENT=staging'}
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.staging} APK（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.staging} AAB（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build appbundle --flavor staging --dart-define=ENVIRONMENT=staging --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production}（{developmentLabel}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter run --flavor production --dart-define=ENVIRONMENT=production'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production} APK（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production} AAB（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build appbundle --flavor production --dart-define=ENVIRONMENT=production --release'
                }
              </div>
            </>
          ) : (
            <>
              <div className="text-green-400"># {developmentLabel}</div>
              <div className="text-gray-300">flutter run</div>
              <div className="text-green-400 mt-2">
                # APK（{t.build.release}）
              </div>
              <div className="text-gray-300">flutter build apk --release</div>
              <div className="text-green-400 mt-2">
                # AAB（{t.build.release}）
              </div>
              <div className="text-gray-300">
                flutter build appbundle --release
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">{t.build.ios}</h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          {separateEnvironments ? (
            <>
              <div className="text-green-400">
                # {t.build.staging}（{developmentLabel}）
              </div>
              <div className="text-gray-300">
                {'flutter run --flavor staging --dart-define=ENVIRONMENT=staging'}
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.staging} iOS（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build ios --flavor staging --dart-define=ENVIRONMENT=staging --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.staging} IPA（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build ipa --flavor staging --dart-define=ENVIRONMENT=staging --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production}（{developmentLabel}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter run --flavor production --dart-define=ENVIRONMENT=production'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production} iOS（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build ios --flavor production --dart-define=ENVIRONMENT=production --release'
                }
              </div>
              <div className="text-green-400 mt-2">
                # {t.build.production} IPA（{t.build.release}）
              </div>
              <div className="text-gray-300">
                {
                  'flutter build ipa --flavor production --dart-define=ENVIRONMENT=production --release'
                }
              </div>
            </>
          ) : (
            <>
              <div className="text-green-400"># {developmentLabel}</div>
              <div className="text-gray-300">flutter run</div>
              <div className="text-green-400 mt-2">
                # iOS（{t.build.release}）
              </div>
              <div className="text-gray-300">flutter build ios --release</div>
              <div className="text-green-400 mt-2">
                # IPA（{t.build.release}）
              </div>
              <div className="text-gray-300">flutter build ipa --release</div>
            </>
          )}
        </div>
        <div className="mt-2 bg-blue-900/30 border border-blue-700 text-blue-200 px-3 py-2 rounded text-xs whitespace-pre-line">
          {separateEnvironments
            ? locale === 'ja'
              ? 'iOSの注意点:\n• `--flavor` (staging/production) でXcode Schemeを選択\n• Xcodeでビルドする場合も同名のSchemeを選択\n• flutter build ios / flutter build ipa は Release ビルド（実機向け）'
              : 'iOS notes:\n• Use `--flavor` (staging/production) to select the Xcode scheme\n• If you build in Xcode, choose the matching scheme\n• flutter build ios / flutter build ipa are release builds (device only)'
            : locale === 'ja'
              ? 'iOSの注意点:\n• flutter build ios / flutter build ipa は Release ビルド（実機向け）'
              : 'iOS notes:\n• flutter build ios / flutter build ipa are release builds (device only)'}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-blue-300">
          {t.build.debug}
        </h3>
        <div className="bg-gray-900 p-3 rounded text-sm font-mono">
          {separateEnvironments ? (
            <>
              <div className="text-green-400"># {t.build.android}</div>
              <div className="text-gray-300">
                {
                  'flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --debug'
                }
              </div>
              <div className="text-gray-300">
                {
                  'flutter build apk --flavor production --dart-define=ENVIRONMENT=production --debug'
                }
              </div>
              <div className="text-green-400 mt-2"># {t.build.ios}</div>
              <div className="text-gray-300">
                {
                  'flutter build ios --flavor staging --dart-define=ENVIRONMENT=staging --debug'
                }
              </div>
              <div className="text-gray-300">
                {
                  'flutter build ios --flavor production --dart-define=ENVIRONMENT=production --debug'
                }
              </div>
            </>
          ) : (
            <>
              <div className="text-green-400"># {t.build.android}</div>
              <div className="text-gray-300">flutter build apk --debug</div>
              <div className="text-green-400 mt-2"># {t.build.ios}</div>
              <div className="text-gray-300">flutter build ios --debug</div>
            </>
          )}
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
          {separateEnvironments ? (
            <>
              <li>
                {locale === 'ja'
                  ? 'Android環境切り替え: `--flavor`と`--dart-define=ENVIRONMENT=xxx`を指定'
                  : 'Android environment switching: Specify `--flavor` and `--dart-define=ENVIRONMENT=xxx`'}
              </li>
              <li>
                {locale === 'ja'
                  ? 'iOS環境切り替え: `--flavor`でXcode Schemeを選択'
                  : 'iOS environment switching: Use `--flavor` to select the Xcode scheme'}
              </li>
            </>
          ) : (
            <li>
              {locale === 'ja'
                ? '環境分離が無効な場合は`--flavor`は不要'
                : 'When environment separation is off, `--flavor` is not needed'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
