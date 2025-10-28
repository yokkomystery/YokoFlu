import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type CliStatus = {
  installed: boolean;
  version?: string;
  error?: string;
};

const CHECK_TARGETS = [
  {
    id: 'flutter',
    command: 'flutter --version',
    label: 'Flutter CLI',
  },
  {
    id: 'dart',
    command: 'dart --version',
    label: 'Dart SDK',
  },
  {
    id: 'flutterfire',
    command: 'flutterfire --version',
    label: 'flutterfire CLI',
  },
] as const;

const formatCliError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return 'コマンドの実行に失敗しました';
  }
  const err = error as NodeJS.ErrnoException & { stderr?: string };
  if (err.code === 'ENOENT') {
    return 'コマンドが見つかりません。PATH設定やインストール状況を確認してください。';
  }
  if (err.stderr && err.stderr.trim().length > 0) {
    return err.stderr.trim().split('\n').slice(-3).join('\n');
  }
  return err.message ?? 'コマンドの実行に失敗しました';
};

const checkCli = async (command: string): Promise<CliStatus> => {
  try {
    const { stdout } = await execAsync(command);
    const version = stdout.trim().split('\n')[0];
    return {
      installed: true,
      version,
    };
  } catch (error) {
    return {
      installed: false,
      error: formatCliError(error),
    };
  }
};

export async function GET() {
  try {
    console.log('[check-firebase] Starting CLI checks...');

    const results = await Promise.all(
      CHECK_TARGETS.map(async (target) => {
        console.log(`[check-firebase] Checking ${target.id}...`);
        const status = await checkCli(target.command);
        console.log(`[check-firebase] ${target.id} status:`, status);
        return [target.id, status] as const;
      })
    );

    const statusRecord = Object.fromEntries(results) as Record<
      (typeof CHECK_TARGETS)[number]['id'],
      CliStatus
    >;

    console.log('[check-firebase] Checking Firebase CLI...');
    const firebaseStatus = await checkCli('firebase --version');
    console.log('[check-firebase] Firebase CLI status:', firebaseStatus);

    let loggedIn = false;

    if (firebaseStatus.installed) {
      try {
        console.log('[check-firebase] Checking Firebase login status...');
        await execAsync('firebase projects:list');
        loggedIn = true;
        console.log('[check-firebase] Firebase login: OK');
      } catch (error) {
        loggedIn = false;
        console.log('[check-firebase] Firebase login: FAILED', error);
      }
    }

    const response = {
      cliInstalled: firebaseStatus.installed,
      loggedIn,
      flutter: statusRecord.flutter ?? { installed: false },
      dart: statusRecord.dart ?? { installed: false },
      flutterfire: statusRecord.flutterfire ?? { installed: false },
      firebase: {
        installed: firebaseStatus.installed,
        version: firebaseStatus.version,
        error: firebaseStatus.error,
        loggedIn,
      },
    };

    console.log(
      '[check-firebase] Response:',
      JSON.stringify(response, null, 2)
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('[check-firebase] ERROR:', error);
    console.error(
      '[check-firebase] Stack:',
      error instanceof Error ? error.stack : 'No stack'
    );
    return NextResponse.json(
      {
        cliInstalled: false,
        loggedIn: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
