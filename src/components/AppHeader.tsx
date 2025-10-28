'use client';

import { useLocale } from '../context/LocaleContext';

export function AppHeader() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="text-center mb-8">
      {/* 言語切り替えボタン */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
          <button
            onClick={() => setLocale('ja')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              locale === 'ja'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              locale === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
          {t.header.title}
        </h1>
        <p className="text-gray-300 text-base">{t.header.subtitle}</p>
      </div>
      <p className="text-gray-200 text-lg font-medium mb-2">
        {t.header.description}
      </p>
      <p className="text-gray-300 text-sm mb-6">
        {locale === 'ja'
          ? 'Firebase連携・多言語対応・認証機能など、すぐに使えるテンプレートコード付き'
          : 'Firebase integration, multi-language support, authentication, and more - production-ready templates included'}
      </p>
      <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-300">
        <span className="px-3 py-1.5 bg-gray-800 rounded-lg font-medium">
          v1.0.0
        </span>
        <span className="text-gray-600">•</span>
        <span className="font-medium">Created by {t.author}</span>
        <span className="text-gray-600">•</span>
        <a
          href="https://github.com/yokkomystery/yokoflu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium underline decoration-blue-400/30 hover:decoration-blue-300"
        >
          GitHub
        </a>
        <span className="text-gray-600">•</span>
        <a
          href="https://docs.flutter.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          title="Flutter公式ドキュメント"
        >
          Flutter Docs
        </a>
        <span className="text-gray-600">•</span>
        <a
          href="https://firebase.flutter.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
          title="Firebase for Flutter公式ドキュメント"
        >
          Firebase Docs
        </a>
      </div>
    </div>
  );
}
