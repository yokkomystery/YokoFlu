'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-red-500/50">
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              致命的なエラーが発生しました
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              アプリケーションで重大なエラーが発生しました。再試行してください。
            </p>
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
