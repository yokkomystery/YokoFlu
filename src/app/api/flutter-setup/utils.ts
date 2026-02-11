import { SetupResult } from './types';
import { updateGlobalProgress } from './progress/progress-manager';

export type ProgressStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'error'
  | 'skipped';

/**
 * ステータス文字列から進捗ステータスを判定する
 * emoji や日本語文字列に依存した判定を型安全なユーティリティに集約
 */
export function resolveProgressStatus(status: string): ProgressStatus {
  if (status.startsWith('✅') || status.includes('完了しました')) {
    return 'completed';
  }
  if (status.startsWith('❌') || status.includes('失敗しました')) {
    return 'error';
  }
  if (status.startsWith('⏭️') || status.includes('スキップ')) {
    return 'skipped';
  }
  if (status.startsWith('⚠️')) {
    return 'error';
  }
  return 'running';
}

export const updateProgress = (
  step: string,
  status: string,
  message?: string
) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] === ${step}: ${status} ===`);
  if (message) {
    console.log(`[${timestamp}] ${message}`);
  }

  const progressStatus = resolveProgressStatus(status);

  console.log(
    `[${timestamp}] Step ${step} -> Status: ${progressStatus} (from: "${status}")`
  );
  updateGlobalProgress(step, progressStatus, message || status);
};

// グローバルなsetupResultオブジェクト
let globalSetupResult: SetupResult | null = null;

// グローバルなsetupResultを設定
export const setGlobalSetupResult = (result: SetupResult) => {
  globalSetupResult = result;
};

// ステップ結果の記録
export const recordStepResult = (
  stepId: string,
  status: 'success' | 'error' | 'skipped',
  message: string,
  details?: Record<string, unknown>
) => {
  if (globalSetupResult) {
    globalSetupResult.steps[stepId] = {
      status,
      message,
      details,
    };

    if (status === 'error') {
      globalSetupResult.errors.push(message);
    }
  }
  console.log(`Step ${stepId}: ${status} - ${message}`, details);
};

// 作成されたファイルの記録
export const addCreatedFile = (filePath: string) => {
  if (globalSetupResult) {
    globalSetupResult.createdFiles.push(filePath);
  }
  console.log(`Created file: ${filePath}`);
};

// 次のステップの追加
export const addNextStep = (step: string) => {
  if (globalSetupResult) {
    globalSetupResult.nextSteps.push(step);
  }
  console.log(`Next step: ${step}`);
};

// セットアップ結果の初期化
export const initializeSetupResult = (
  appName: string,
  outputPath: string
): SetupResult => {
  return {
    success: false,
    appName,
    outputPath,
    steps: {},
    createdFiles: [],
    nextSteps: [],
    errors: [],
  };
};
