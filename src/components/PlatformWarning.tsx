'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';

type PlatformInfo = {
  platform: string;
  displayName: string;
  canDevelopIos: boolean;
  canDevelopAndroid: boolean;
  warnings: {
    en: string[];
    ja: string[];
  };
};

export default function PlatformWarning() {
  const { locale } = useLocale();
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlatformInfo() {
      try {
        const response = await fetch('/api/platform-info');
        if (response.ok) {
          const data = await response.json();
          setPlatformInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch platform info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlatformInfo();
  }, []);

  if (isLoading || !platformInfo) {
    return null;
  }

  const warnings = platformInfo.warnings[locale];

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {locale === 'ja'
              ? `プラットフォーム: ${platformInfo.displayName}`
              : `Platform: ${platformInfo.displayName}`}
          </h3>
          <div className="mt-2 text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
          {!platformInfo.canDevelopIos && (
            <div className="mt-3 text-xs text-yellow-600">
              {locale === 'ja' ? (
                <>
                  💡 iOS アプリを開発する場合は、macOS が必要です。
                  <br />
                  Android アプリは引き続き開発できます。
                </>
              ) : (
                <>
                  💡 To develop iOS apps, you need macOS.
                  <br />
                  You can still develop Android apps.
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
