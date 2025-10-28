import { SetupResult } from './types';
import { updateGlobalProgress } from './progress/progress-manager';

// 進捗管理用のグローバル変数
let progressComplete = false;
const progressUpdates: Array<{
  step: string;
  status: string;
  message?: string;
}> = [];

export const setProgressComplete = () => {
  progressComplete = true;
};

export const getProgressComplete = () => {
  return progressComplete;
};

export const getProgressUpdates = () => {
  return progressUpdates;
};

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

  // グローバル進捗を更新（より明確な判定）
  let progressStatus: 'pending' | 'running' | 'completed' | 'error' | 'skipped';

  // 明示的な判定（順序が重要：より具体的なものから判定）
  if (status.startsWith('✅') || status.includes('完了しました')) {
    progressStatus = 'completed';
  } else if (status.startsWith('❌') || status.includes('失敗しました')) {
    progressStatus = 'error';
  } else if (status.startsWith('⏭️') || status.includes('スキップ')) {
    progressStatus = 'skipped';
  } else if (status.startsWith('⚠️')) {
    progressStatus = 'error'; // 警告も一応エラーとして扱う
  } else {
    progressStatus = 'running';
  }

  console.log(
    `[${timestamp}] Step ${step} -> Status: ${progressStatus} (from: "${status}")`
  );
  updateGlobalProgress(step, progressStatus, message || status);

  progressUpdates.push({ step, status, message });
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
