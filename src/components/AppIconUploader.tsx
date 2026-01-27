'use client';

import React, { useCallback } from 'react';
import { useLocale } from '../context/LocaleContext';

interface AppIconUploaderProps {
  appIcon: string | null;
  appIconPreview: string | null;
  appIconFileName: string | null;
  onIconChange: (icon: string | null, preview: string | null, fileName: string | null) => void;
}

export function AppIconUploader({
  appIcon,
  appIconPreview,
  appIconFileName,
  onIconChange,
}: AppIconUploaderProps) {
  const { t, locale } = useLocale();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        img.src = base64;

        img.onload = () => {
          // 正方形チェック
          if (img.width !== img.height) {
            alert(
              t.basicInfo.errorSquareRequired
                .replace('{width}', String(img.width))
                .replace('{height}', String(img.height))
            );
            return;
          }

          // 最小サイズチェック（512x512px）
          if (img.width < 512 || img.height < 512) {
            alert(
              t.basicInfo.errorSizeTooSmall
                .replace('{width}', String(img.width))
                .replace('{height}', String(img.height))
            );
            return;
          }

          // すべてOKなら設定
          onIconChange(base64, base64, file.name);
        };
      };

      reader.readAsDataURL(file);
    },
    [t.basicInfo.errorSquareRequired, t.basicInfo.errorSizeTooSmall, onIconChange]
  );

  const handleRemove = useCallback(() => {
    onIconChange(null, null, null);
  }, [onIconChange]);

  return (
    <div className="mb-6 bg-gray-900/40 border border-gray-700 rounded-lg p-4">
      <label className="block text-sm font-medium mb-2">
        {t.basicInfo.appIcon}
      </label>

      {/* 自動生成機能の説明 */}
      <div className="bg-blue-900/20 border border-blue-700 rounded px-3 py-2 mb-3">
        <p className="text-xs text-blue-200 mb-1">
          <strong>
            {locale === 'ja' ? 'アイコン自動生成機能' : 'Auto Icon Generation'}
          </strong>
        </p>
        <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside ml-2">
          {t.basicInfo.appIconDescription.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </div>

      {/* 注意事項 */}
      <div className="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 mb-3">
        <p className="text-xs text-gray-400">
          <strong>{locale === 'ja' ? '注意' : 'Note'}</strong>:
          {locale === 'ja'
            ? 'アイコンを設定しない場合、Flutterのデフォルトアイコン（青い羽根のロゴ）が使用されます。本番リリース前に必ず独自のアイコンに差し替えることをお勧めします。'
            : "If you do not set an icon, Flutter's default icon (blue feather logo) will be used. We recommend replacing it with your own icon before production release."}
        </p>
      </div>

      {/* 必須条件・推奨サイズ */}
      <p className="text-xs text-yellow-400 mb-3">
        <strong>{locale === 'ja' ? '必須条件' : 'Requirements'}</strong>:{' '}
        {locale === 'ja'
          ? '正方形の画像（幅 = 高さ）'
          : 'Square image (width = height)'}
        <br />
        <strong>{locale === 'ja' ? '推奨サイズ' : 'Recommended Size'}</strong>:
        1024x1024px {locale === 'ja' ? 'または 2048x2048px' : 'or 2048x2048px'}
        <br />
        <strong>{locale === 'ja' ? '形式' : 'Format'}</strong>: PNG (
        {locale === 'ja' ? '透過なし推奨' : 'no transparency recommended'})
      </p>

      {/* プレビューとファイル選択 */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {appIconPreview ? (
            <div className="relative">
              <img
                src={appIconPreview}
                alt="App Icon Preview"
                className="w-24 h-24 rounded-lg border-2 border-blue-500 object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                aria-label="Remove icon"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="relative">
            <input
              type="file"
              id="app-icon-input"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="app-icon-input"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md cursor-pointer transition-colors"
            >
              {t.basicInfo.selectFile}
            </label>
            <span className="ml-3 text-sm text-gray-400">
              {appIconFileName || t.basicInfo.noFileSelected}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-2 space-y-1">
            {t.basicInfo.appIconRequirements.map((req, index) => (
              <p key={index}>{req}</p>
            ))}
          </div>

          {appIcon && (
            <p className="text-xs text-green-400 mt-1">{t.basicInfo.appIconSet}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppIconUploader;
