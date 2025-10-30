import { updateProgress, recordStepResult, addNextStep } from '../utils';
import {
  getFirebaseServiceLabel,
  getFirebaseServiceNextStep,
  formatServiceSummary,
} from '../service-guides';
import { FIREBASE_SERVICE_IDS, FirebaseServiceId } from '../service-activation';

interface FirebaseServicesStepParams {
  useFirebase: boolean;
  selectedServices: string[];
  resolvedStagingProjectId?: string;
  resolvedProductionProjectId?: string;
  resolvedSingleProjectId?: string;
  separateEnvironments: boolean;
}

export async function runFirebaseServices(params: FirebaseServicesStepParams) {
  const {
    useFirebase,
    selectedServices,
    resolvedStagingProjectId,
    resolvedProductionProjectId,
    resolvedSingleProjectId,
    separateEnvironments,
  } = params;

  updateProgress(
    'firebase-services',
    'Firebaseサービスの確認',
    '選択したFirebaseサービスを整理中...'
  );

  if (!useFirebase) {
    updateProgress(
      'firebase-services',
      '⏭️ Firebaseサービス設定',
      'Firebaseを使用しないためスキップします'
    );
    recordStepResult(
      'firebase-services',
      'skipped',
      'Firebaseを使用しないため、Firebaseサービス設定をスキップしました'
    );
    return;
  }

  const targetProjects = (
    separateEnvironments
      ? [resolvedStagingProjectId, resolvedProductionProjectId]
      : [resolvedSingleProjectId]
  )
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  const knownServiceIds = new Set<FirebaseServiceId>(FIREBASE_SERVICE_IDS);
  const normalizedServices = selectedServices
    .filter((serviceId): serviceId is FirebaseServiceId => {
      if (typeof serviceId !== 'string') return false;
      return knownServiceIds.has(serviceId.trim() as FirebaseServiceId);
    })
    .map((serviceId) => serviceId.trim() as FirebaseServiceId);

  if (normalizedServices.length > 0) {
    const uniqueServices = Array.from(new Set(normalizedServices));
    const serviceSummary = formatServiceSummary(uniqueServices);

    uniqueServices.forEach((serviceId) => {
      const nextStep = getFirebaseServiceNextStep(
        serviceId,
        targetProjects.filter(Boolean) as string[]
      );
      if (nextStep) {
        addNextStep(nextStep);
      }
    });

    updateProgress(
      'firebase-services',
      '✅ Firebaseサービスの確認が完了しました',
      `選択済みサービス: ${serviceSummary}`
    );
    recordStepResult(
      'firebase-services',
      'success',
      'Firebaseサービスの確認が完了しました',
      {
        services: uniqueServices.map(
          (serviceId) => getFirebaseServiceLabel(serviceId) ?? serviceId
        ),
        projects: targetProjects,
      }
    );
  } else {
    // Firebaseサービスが選択されていない場合は静かに終了（メッセージ不要）
    return;
  }
}
