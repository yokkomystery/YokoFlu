import { useState, useEffect } from 'react';

interface CliStatus {
  installed: boolean;
  version?: string;
  error?: string;
  loggedIn?: boolean;
}

const EMPTY_CLI_STATUS: CliStatus = { installed: false };

const DEFAULT_ERROR_MESSAGE =
  'CLI の状態を確認できませんでした。CLI を直接実行できる環境（パスの設定や権限）を見直し、再度更新してください。';

interface EnvironmentStatus {
  flutter: CliStatus;
  dart: CliStatus;
  flutterfire: CliStatus;
  firebase: CliStatus;
}

interface UseCliStatusReturn {
  environmentStatus: EnvironmentStatus;
  environmentStatusError: string | null;
  fetchEnvironmentStatus: () => Promise<void>;
}

function toCliStatus(value: unknown): CliStatus {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_CLI_STATUS };
  }

  const candidate = value as Partial<CliStatus>;
  return {
    installed: candidate.installed ?? false,
    version: candidate.version,
    error: candidate.error,
    loggedIn: candidate.loggedIn,
  };
}

export function useCliStatus(): UseCliStatusReturn {
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>(
    () => ({
      flutter: { ...EMPTY_CLI_STATUS },
      dart: { ...EMPTY_CLI_STATUS },
      flutterfire: { ...EMPTY_CLI_STATUS },
      firebase: { ...EMPTY_CLI_STATUS, loggedIn: false },
    })
  );
  const [environmentStatusError, setEnvironmentStatusError] = useState<
    string | null
  >(null);

  const fetchEnvironmentStatus = async () => {
    try {
      const response = await fetch('/api/check-firebase');
      const raw = await response.text();
      let data: Record<string, unknown> = {};

      if (raw.trim().length > 0) {
        try {
          data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          throw new Error(
            response.ok
              ? 'CLI 状態APIがJSON以外のレスポンスを返しました。'
              : `CLI 状態APIが異常なレスポンスを返しました (status: ${response.status})。`
          );
        }
      }

      if (!response.ok) {
        const message =
          typeof data.error === 'string' && data.error.length > 0
            ? data.error
            : `CLI 状態APIの呼び出しに失敗しました (status: ${response.status})。`;
        throw new Error(message);
      }

      const firebaseStatus = toCliStatus(data.firebase);
      setEnvironmentStatus({
        flutter: toCliStatus(data.flutter),
        dart: toCliStatus(data.dart),
        flutterfire: toCliStatus(data.flutterfire),
        firebase: {
          ...firebaseStatus,
          installed: firebaseStatus.installed || Boolean(data.cliInstalled),
          loggedIn: firebaseStatus.loggedIn ?? Boolean(data.loggedIn),
        },
      });
      setEnvironmentStatusError(null);
    } catch (error) {
      console.error('Failed to load CLI status', error);
      setEnvironmentStatus({
        flutter: { ...EMPTY_CLI_STATUS },
        dart: { ...EMPTY_CLI_STATUS },
        flutterfire: { ...EMPTY_CLI_STATUS },
        firebase: { ...EMPTY_CLI_STATUS, loggedIn: false },
      });
      const errorMessage =
        error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;
      setEnvironmentStatusError(
        errorMessage === 'Network error' ? DEFAULT_ERROR_MESSAGE : errorMessage
      );
    }
  };

  useEffect(() => {
    fetchEnvironmentStatus();
  }, []);

  return {
    environmentStatus,
    environmentStatusError,
    fetchEnvironmentStatus,
  };
}
