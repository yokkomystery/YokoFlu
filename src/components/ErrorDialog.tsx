'use client';

import { useLocale } from '../context/LocaleContext';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
}

export function ErrorDialog({ isOpen, onClose, errors }: ErrorDialogProps) {
  const { t } = useLocale();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border-2 border-red-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400">
            {t.errorDialog.validation}
          </h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">{t.errorDialog.message}</p>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {errors.map((error, index) => (
              <p
                key={index}
                className="text-red-200 text-sm flex items-start gap-2"
              >
                <span className="text-red-400 font-bold">•</span>
                <span>{error}</span>
              </p>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {t.errorDialog.ok}
        </button>
      </div>
    </div>
  );
}
