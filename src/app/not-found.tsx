import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl font-bold text-gray-600 mb-4">404</div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          ページが見つかりません
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
