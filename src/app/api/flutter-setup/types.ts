export interface SetupResult {
  success: boolean;
  appName: string;
  outputPath: string;
  steps: {
    [key: string]: {
      status: 'success' | 'error' | 'skipped';
      message: string;
      details?: Record<string, unknown>;
    };
  };
  createdFiles: string[];
  nextSteps: string[];
  errors: string[];
}

export type AppTemplateId =
  | 'blank'
  | 'counter'
  | 'todo'
  | 'stopwatch'
  | 'chat';

export interface FlutterSetupRequest {
  appName: string;
  bundleId: string;
  packageName: string;
  projectId: string;
  outputPath: string;
  separateEnvironments: boolean;
  existingStagingProjectId?: string;
  existingProductionProjectId?: string;
  singleProjectId?: string;
  selectedServices?: string[];
  useFirebase: boolean;
  templateFeatures?: string[];
  localizationLanguages?: string[];
  appTemplate?: AppTemplateId;
  advancedFeatures?: string[];
  appIcon?: string | null;
}

export interface FirebaseVersions {
  firebase_core: string;
  firebase_auth: string;
  cloud_firestore: string;
  firebase_storage: string;
  firebase_analytics: string;
  firebase_crashlytics: string;
  firebase_messaging: string;
}

export interface ProgressUpdate {
  step: string;
  status: string;
  message?: string;
}
