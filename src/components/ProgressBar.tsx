'use client';

import React from 'react';
import { useLocale } from '../context/LocaleContext';

type ProgressStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

export interface ProgressStepItem {
  id: string;
  title: string;
  status: ProgressStatus;
  message?: string;
}

interface Props {
  steps: ProgressStepItem[];
  isComplete?: boolean;
  onClose?: () => void;
}

const ProgressBar: React.FC<Props> = ({ steps, isComplete, onClose }) => {
  const { t } = useLocale();
  // セットアップが完了したかどうか（isCompleteがtrue、またはすべてがcompleted/skipped/errorでrunningがない）
  const allCompleted =
    isComplete ||
    steps.every(
      (s) =>
        s.status === 'completed' ||
        s.status === 'skipped' ||
        s.status === 'error'
    );

  // エラーが発生したかどうか
  const hasError = steps.some((s) => s.status === 'error');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">
            {isComplete && allCompleted
              ? hasError
                ? t.progressBar.errorOccurred
                : t.progressBar.setupComplete
              : t.progressBar.setupProgress}
          </h3>
          <span className="text-sm text-gray-300">
            {steps.filter((s) => s.status === 'completed').length} /{' '}
            {steps.length}
          </span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {steps.map((step, index) => (
            <div
              key={`${step.id}-${index}`}
              className="flex items-start space-x-3"
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'running'
                    ? 'bg-blue-500 animate-pulse'
                    : step.status === 'error'
                    ? 'bg-red-500'
                    : step.status === 'skipped'
                    ? 'bg-gray-500'
                    : 'bg-gray-600'
                }`}
              >
                {step.status === 'completed' && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {step.status === 'running' && (
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    step.status === 'completed'
                      ? 'text-green-400'
                      : step.status === 'running'
                      ? 'text-blue-400'
                      : step.status === 'error'
                      ? 'text-red-400'
                      : step.status === 'skipped'
                      ? 'text-gray-400'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
                {/* エラー時やrunning時にメッセージを表示 */}
                {step.message &&
                  (step.status === 'error' || step.status === 'running') && (
                    <div
                      className={`text-xs mt-1 whitespace-pre-wrap break-words ${
                        step.status === 'error'
                          ? 'text-red-300'
                          : 'text-blue-300'
                      }`}
                    >
                      {step.message}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
        {isComplete && allCompleted && onClose && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t.progressBar.closeButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
