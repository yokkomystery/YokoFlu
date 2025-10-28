import { exec } from 'child_process';
import { promisify } from 'util';
import { updateProgress, recordStepResult } from '../utils';

const execAsync = promisify(exec);

interface FirebaseCheckParams {
  useFirebase: boolean;
  separateEnvironments: boolean;
  appName: string;
  singleProjectId: string;
  projectId: string;
}

export async function runFirebaseEnvironmentCheck({
  useFirebase,
  separateEnvironments,
  appName,
  singleProjectId,
  projectId,
}: FirebaseCheckParams) {
  if (!useFirebase) return;

  updateProgress('firebase-check', 'Firebase環境の確認', 'Firebaseの設定環境を確認中...');

  // Firebase CLI の存在確認
  try {
    const versionResult = await execAsync('firebase --version');
    updateProgress(
      'firebase-check',
      '✅ Firebase環境の準備が完了しました',
      'Firebase環境の準備が完了しました'
    );
    recordStepResult('firebase-check', 'success', 'Firebase CLIがインストールされています', {
      version: versionResult.stdout.trim(),
    });
  } catch (error) {
    updateProgress('firebase-check', '❌ Firebase環境の準備ができていません', 'Firebase環境の準備ができていません');
    recordStepResult('firebase-check', 'error', 'Firebase CLIがインストールされていません', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Firebase CLI is not installed');
  }

  // Firebase ログイン状態とプロジェクト一覧
  try {
    const projectsResult = await execAsync('firebase projects:list');
    updateProgress('firebase-check', '✅ Firebaseアカウントにログイン済みです', 'Firebaseアカウントにログイン済みです');
    recordStepResult('firebase-check', 'success', 'Firebase CLIにログイン済みです', {
      projectsCount:
        projectsResult.stdout.split('\n').filter((line) => line.includes('│')).length - 1,
    });

    const availableProjects = projectsResult.stdout
      .split('\n')
      .filter((line) => line.includes('│'))
      .map((line) => line.split('│').map((part) => part.trim())[1])
      .filter(Boolean) as string[];

    if (separateEnvironments) {
      const stagingProjectId = `${appName.toLowerCase()}-staging`;
      const productionProjectId = `${appName.toLowerCase()}-production`;
      if (!availableProjects.includes(stagingProjectId)) {
        console.warn(`⚠️ Stagingプロジェクト "${stagingProjectId}" が見つかりません`);
      }
      if (!availableProjects.includes(productionProjectId)) {
        console.warn(`⚠️ Productionプロジェクト "${productionProjectId}" が見つかりません`);
      }
    } else {
      const targetProjectId = singleProjectId || projectId;
      if (targetProjectId && !availableProjects.includes(targetProjectId)) {
        console.warn(`⚠️ プロジェクト "${targetProjectId}" が見つかりません`);
        console.log('利用可能なプロジェクト:', availableProjects.join(', '));
      }
    }
  } catch (error) {
    updateProgress('firebase-check', 'Firebase CLI確認', '❌ Firebase CLIにログインしていません');
    recordStepResult('firebase-check', 'error', 'Firebase CLIにログインしていません', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Firebase CLI is not logged in');
  }
}

