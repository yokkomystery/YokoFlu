// グローバルな進捗状態を保持
let globalProgress: {
  steps: Record<
    string,
    {
      status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
      message: string;
      details?: Record<string, unknown>;
    }
  >;
  isComplete: boolean;
} = {
  steps: {},
  isComplete: false,
};

// 進捗状態を更新する関数（他のファイルから呼び出し可能）
export const updateGlobalProgress = (
  stepId: string,
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped',
  message: string,
  details?: Record<string, unknown>
) => {
  globalProgress.steps[stepId] = {
    status,
    message,
    details,
  };
  console.log(
    `[updateGlobalProgress] Step: ${stepId}, Status: ${status}, Message: ${message}`
  );
};

// 進捗完了を設定する関数
export const setProgressComplete = () => {
  globalProgress.isComplete = true;
};

// 進捗状態をリセットする関数
export const resetProgress = () => {
  globalProgress = {
    steps: {},
    isComplete: false,
  };
};

// 進捗状態を取得する関数
export const getGlobalProgress = () => globalProgress;
