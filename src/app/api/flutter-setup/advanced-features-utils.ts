import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';
import {
  ADVANCED_FEATURE_OPTIONS,
  AdvancedFeatureId,
} from '../../../config/templateOptions';

interface FeatureImplementation {
  serviceFiles?: Array<{
    templatePath: string;
    targetPath: string;
  }>;
  conditions?: Record<string, boolean>;
}

const FEATURE_IMPLEMENTATIONS: Record<
  AdvancedFeatureId,
  FeatureImplementation
> = {
  'forced-update': {
    serviceFiles: [
      {
        templatePath: 'core/services/app_version_service.dart',
        targetPath: 'lib/core/services/app_version_service.dart',
      },
    ],
  },
  'recommended-update': {
    serviceFiles: [
      {
        templatePath: 'core/services/app_version_service.dart',
        targetPath: 'lib/core/services/app_version_service.dart',
      },
    ],
  },
  'maintenance-mode': {
    serviceFiles: [
      {
        templatePath: 'core/services/app_version_service.dart',
        targetPath: 'lib/core/services/app_version_service.dart',
      },
    ],
  },
  'app-rating': {
    serviceFiles: [
      {
        templatePath: 'core/services/app_rating_service.dart',
        targetPath: 'lib/core/services/app_rating_service.dart',
      },
    ],
  },
  'anonymous-auth': {
    serviceFiles: [
      {
        templatePath: 'features/auth/auth_repository.dart',
        targetPath: 'lib/features/auth/auth_repository.dart',
      },
      {
        templatePath: 'features/auth/auth_provider.dart',
        targetPath: 'lib/features/auth/auth_provider.dart',
      },
      {
        templatePath: 'features/auth/auth_screen.dart',
        targetPath: 'lib/features/auth/auth_screen.dart',
      },
    ],
    conditions: {
      ANONYMOUS_AUTH: true,
    },
  },
  'google-signin': {
    serviceFiles: [
      {
        templatePath: 'features/auth/auth_repository.dart',
        targetPath: 'lib/features/auth/auth_repository.dart',
      },
      {
        templatePath: 'features/auth/auth_provider.dart',
        targetPath: 'lib/features/auth/auth_provider.dart',
      },
      {
        templatePath: 'features/auth/auth_screen.dart',
        targetPath: 'lib/features/auth/auth_screen.dart',
      },
    ],
    conditions: {
      GOOGLE_SIGNIN: true,
    },
  },
  'apple-signin': {
    serviceFiles: [
      {
        templatePath: 'features/auth/auth_repository.dart',
        targetPath: 'lib/features/auth/auth_repository.dart',
      },
      {
        templatePath: 'features/auth/auth_provider.dart',
        targetPath: 'lib/features/auth/auth_provider.dart',
      },
      {
        templatePath: 'features/auth/auth_screen.dart',
        targetPath: 'lib/features/auth/auth_screen.dart',
      },
    ],
    conditions: {
      APPLE_SIGNIN: true,
    },
  },
  analytics: {
    serviceFiles: [
      {
        templatePath: 'core/services/analytics_service.dart',
        targetPath: 'lib/core/services/analytics_service.dart',
      },
    ],
  },
  crashlytics: {
    serviceFiles: [
      {
        templatePath: 'core/services/crashlytics_service.dart',
        targetPath: 'lib/core/services/crashlytics_service.dart',
      },
    ],
  },
  'push-notifications': {
    serviceFiles: [
      {
        templatePath: 'core/services/push_notification_service.dart',
        targetPath: 'lib/core/services/push_notification_service.dart',
      },
      {
        templatePath: 'features/settings/notification_settings_screen.dart',
        targetPath: 'lib/features/settings/notification_settings_screen.dart',
      },
    ],
  },
  onboarding: {
    serviceFiles: [
      {
        templatePath: 'features/onboarding/onboarding_screen.dart',
        targetPath: 'lib/features/onboarding/onboarding_screen.dart',
      },
      {
        templatePath: 'features/onboarding/onboarding_state.dart',
        targetPath: 'lib/features/onboarding/onboarding_state.dart',
      },
    ],
  },
};

export function createAdvancedFeatures(
  selectedFeatures: AdvancedFeatureId[],
  appName: string,
  projectPath: string,
  packageName?: string
): string[] {
  if (!selectedFeatures || selectedFeatures.length === 0) {
    return [];
  }
  const createdFiles: string[] = [];
  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  // サービスディレクトリを作成
  const servicesDir = path.join(projectPath, 'lib', 'core', 'services');
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }

  // 認証ディレクトリを作成（必要な場合）
  const authDir = path.join(projectPath, 'lib', 'features', 'auth');
  const needsAuthFeature = selectedFeatures.some((id) =>
    ['anonymous-auth', 'google-signin', 'apple-signin'].includes(id)
  );
  if (needsAuthFeature && !fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // 各機能の条件を集約
  const allConditions: Record<string, boolean> = {
    ANONYMOUS_AUTH: selectedFeatures.includes('anonymous-auth'),
    GOOGLE_SIGNIN: selectedFeatures.includes('google-signin'),
    APPLE_SIGNIN: selectedFeatures.includes('apple-signin'),
  };

  // 処理済みのファイルパスを追跡（重複を避ける）
  const processedFiles = new Set<string>();

  selectedFeatures.forEach((featureId) => {
    const feature = ADVANCED_FEATURE_OPTIONS.find((f) => f.id === featureId);
    if (!feature) return;

    const implementation =
      FEATURE_IMPLEMENTATIONS[featureId as AdvancedFeatureId];
    if (!implementation || !implementation.serviceFiles) return;

    implementation.serviceFiles.forEach((fileConfig) => {
      const targetFullPath = path.join(projectPath, fileConfig.targetPath);

      // 既に処理済みのファイルはスキップ
      if (processedFiles.has(targetFullPath)) {
        return;
      }

      const templatePath = getTemplatePath(fileConfig.templatePath);
      if (!fs.existsSync(templatePath)) {
        console.warn(
          `⚠️ テンプレートファイルが見つかりません: ${templatePath}`
        );
        return;
      }

      // ディレクトリを作成
      const targetDir = path.dirname(targetFullPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // ファイルをコピー（集約された条件を使用）
      copyTemplateFile(
        templatePath,
        targetFullPath,
        {
          APP_NAME: normalizedAppName,
          PACKAGE_NAME: packageName || normalizedAppName,
        },
        allConditions
      );

      createdFiles.push(targetFullPath);
      processedFiles.add(targetFullPath);
      console.log(
        `✅ ${feature.label}のファイルを作成しました: ${fileConfig.targetPath}`
      );
    });
  });

  return createdFiles;
}

export function getAdvancedFeatureDependencies(
  selectedFeatures: AdvancedFeatureId[]
): string[] {
  const dependencies = new Set<string>();

  selectedFeatures.forEach((featureId) => {
    const feature = ADVANCED_FEATURE_OPTIONS.find((f) => f.id === featureId);
    if (feature) {
      feature.dependencies.forEach((dep) => dependencies.add(dep));
    }
  });

  return Array.from(dependencies);
}

export function getAdvancedFeatureTodoNotes(
  selectedFeatures: AdvancedFeatureId[]
): string[] {
  const notes: string[] = [];

  selectedFeatures.forEach((featureId) => {
    const feature = ADVANCED_FEATURE_OPTIONS.find((f) => f.id === featureId);
    if (feature && feature.todoNote) {
      notes.push(`[${feature.label}] ${feature.todoNote}`);
    }
  });

  return notes;
}
