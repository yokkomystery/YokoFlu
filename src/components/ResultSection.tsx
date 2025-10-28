'use client';

import React from 'react';
import { useLocale } from '../context/LocaleContext';

type StepFinalStatus = 'success' | 'error' | 'skipped';

interface StepRecord {
  status: StepFinalStatus;
  message: string;
  details?: Record<string, unknown>;
}

interface SetupResultShape {
  appName?: string;
  outputPath?: string;
  steps?: Record<string, StepRecord>;
  createdFiles?: string[];
  nextSteps?: string[];
  errors?: string[];
}

interface SuccessPayload {
  message?: string;
  result?: SetupResultShape;
}

interface Props {
  success: SuccessPayload | null;
}

const ResultSection: React.FC<Props> = ({ success }) => {
  const { t } = useLocale();
  if (!success) return null;

  const result = success.result;

  return (
    <div className="mt-10">
      {success?.message && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
          {success.message}
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-green-400">
          {t.result.title}
        </h3>
        <div className="space-y-4">
          {/* 基本情報 */}
          <div>
            <h4 className="text-lg font-medium mb-2 text-white">
              {t.result.basicInfo}
            </h4>
            <div className="bg-gray-900 p-3 rounded text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">{t.fields.appName}:</span>{' '}
                  <span className="text-white">{result?.appName}</span>
                </div>
                <div>
                  <span className="text-gray-400">{t.fields.outputPath}:</span>{' '}
                  <span className="text-white break-all whitespace-normal">
                    {result?.outputPath}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 各ステップの結果 */}
          <div>
            <h4 className="text-lg font-medium mb-2 text-white">
              {t.result.executionResult}
            </h4>
            <div className="space-y-2">
              {Object.entries(result?.steps || {}).map(([stepId, step]) => (
                <div
                  key={stepId}
                  className={`p-3 rounded border ${
                    step.status === 'success'
                      ? 'bg-green-900 border-green-600'
                      : step.status === 'error'
                      ? 'bg-red-900 border-red-600 max-h-96 overflow-y-auto'
                      : 'bg-gray-900 border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-xs mt-1 flex-shrink-0 ${
                        step.status === 'success'
                          ? 'bg-green-500 text-white'
                          : step.status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-gray-300'
                      }`}
                    >
                      {step.status === 'success'
                        ? '✓'
                        : step.status === 'error'
                        ? '✗'
                        : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium text-white ${
                        step.status === 'error' 
                          ? 'whitespace-pre-wrap break-words' 
                          : 'break-all whitespace-normal'
                      }`}>
                        {step.message}
                      </div>
                      {step.details && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.entries(step.details).map(([key, value]) => (
                            <div
                              key={key}
                              className="break-all whitespace-normal"
                            >
                              <span className="text-gray-500">{key}:</span>{' '}
                              {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 作成されたファイル */}
          {result?.createdFiles && result.createdFiles.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2 text-white">
                {t.result.createdFiles}
              </h4>
              <div className="bg-gray-900 p-3 rounded text-sm max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {result.createdFiles.slice(0, 20).map((file, index) => (
                    <div
                      key={index}
                      className="text-gray-300 font-mono text-xs break-all whitespace-normal"
                    >
                      {file}
                    </div>
                  ))}
                </div>
                {result.createdFiles.length > 20 && (
                  <div className="text-gray-500 text-xs mt-2">
                    {t.result.otherFiles.replace(
                      '{count}',
                      String(result.createdFiles.length - 20)
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 次のステップ */}
          {result?.nextSteps && result.nextSteps.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2 text-white">
                {t.result.nextSteps}
              </h4>
              <div className="bg-gray-900 p-3 rounded text-sm">
                <div className="space-y-1">
                  {result.nextSteps.map((step, index) => (
                    <div key={index} className="text-gray-300 font-mono">
                      {index + 1}. {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 追記事項 */}
          <div className="bg-blue-900/40 border border-blue-700 text-blue-100 px-3 py-3 rounded text-sm">
            {t.result.notes}
            <ul className="list-disc list-inside space-y-1 mt-2 text-blue-100/90">
              {t.result.notesList.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          {/* エラー一覧（あれば） */}
          {result?.errors && result.errors.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2 text-red-400">
                {t.result.errors}
              </h4>
              <div className="bg-red-900 p-3 rounded text-sm max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-red-300 whitespace-pre-wrap break-words">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
