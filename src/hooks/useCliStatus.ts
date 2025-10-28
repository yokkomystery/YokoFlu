import { useState, useEffect } from 'react';

interface CliStatus {
  installed: boolean;
  version?: string;
  error?: string;
  loggedIn?: boolean;
}

const EMPTY_CLI_STATUS: CliStatus = { installed: false };

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
      const data = await response.json();
      setEnvironmentStatus({
        flutter: data.flutter ?? { ...EMPTY_CLI_STATUS },
        dart: data.dart ?? { ...EMPTY_CLI_STATUS },
        flutterfire: data.flutterfire ?? { ...EMPTY_CLI_STATUS },
        firebase: {
          ...(data.firebase ?? { ...EMPTY_CLI_STATUS }),
          installed: data.firebase?.installed ?? data.cliInstalled ?? false,
          loggedIn: data.firebase?.loggedIn ?? data.loggedIn ?? false,
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
      setEnvironmentStatusError(
        'CLI の状態を確認できませんでした。CLI を直接実行できる環境（パスの設定や権限）を見直し、再度更新してください。'
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
