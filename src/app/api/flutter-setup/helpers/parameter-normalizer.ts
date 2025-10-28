import {
  TEMPLATE_FEATURE_OPTIONS,
  DEFAULT_TEMPLATE_FEATURE_IDS,
  LOCALIZATION_LANGUAGE_OPTIONS,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
  ADVANCED_FEATURE_OPTIONS,
  DEFAULT_ADVANCED_FEATURE_IDS,
  TemplateFeatureId,
  LocalizationLanguageId,
  AdvancedFeatureId,
} from '../../../../config/templateOptions';

interface NormalizedParameters {
  templateFeatures: TemplateFeatureId[];
  localizationLanguages: LocalizationLanguageId[];
  advancedFeatures: AdvancedFeatureId[];
  resolvedStagingProjectId: string;
  resolvedProductionProjectId: string;
  resolvedSingleProjectId: string;
}

interface NormalizeParamsInput {
  appName: string;
  templateFeatures: unknown;
  localizationLanguages: unknown;
  advancedFeatures: unknown;
  existingStagingProjectId?: string;
  existingProductionProjectId?: string;
  singleProjectId?: string;
  projectId: string;
}

export function normalizeParameters(
  input: NormalizeParamsInput
): NormalizedParameters {
  const normalizedAppName = input.appName.toLowerCase();

  const resolvedStagingProjectId =
    (input.existingStagingProjectId && input.existingStagingProjectId.trim()) ||
    `${normalizedAppName}-staging`;
  const resolvedProductionProjectId =
    (input.existingProductionProjectId &&
      input.existingProductionProjectId.trim()) ||
    `${normalizedAppName}-production`;
  const resolvedSingleProjectId =
    (input.singleProjectId && input.singleProjectId.trim()) || input.projectId;

  // テンプレート機能の正規化
  const availableFeatureIds = new Set(
    TEMPLATE_FEATURE_OPTIONS.map((option) => option.id)
  );
  const normalizedTemplateFeatures = (
    Array.isArray(input.templateFeatures)
      ? input.templateFeatures
      : DEFAULT_TEMPLATE_FEATURE_IDS
  ).filter((featureId): featureId is TemplateFeatureId =>
    availableFeatureIds.has(featureId as TemplateFeatureId)
  );
  const effectiveTemplateFeatures =
    normalizedTemplateFeatures.length > 0
      ? normalizedTemplateFeatures
      : DEFAULT_TEMPLATE_FEATURE_IDS;

  // ローカライズ言語の正規化
  const availableLanguageIds = new Set(
    LOCALIZATION_LANGUAGE_OPTIONS.map((option) => option.id)
  );
  let normalizedLocalizationLanguages = (
    Array.isArray(input.localizationLanguages)
      ? input.localizationLanguages
      : DEFAULT_LOCALIZATION_LANGUAGE_IDS
  ).filter((languageId): languageId is LocalizationLanguageId =>
    availableLanguageIds.has(languageId as LocalizationLanguageId)
  );
  if (normalizedLocalizationLanguages.length === 0) {
    normalizedLocalizationLanguages = [...DEFAULT_LOCALIZATION_LANGUAGE_IDS];
  }

  // 高度な機能の正規化
  const availableAdvancedFeatureIds = new Set(
    ADVANCED_FEATURE_OPTIONS.map((option) => option.id)
  );
  let normalizedAdvancedFeatures = (
    Array.isArray(input.advancedFeatures)
      ? input.advancedFeatures
      : DEFAULT_ADVANCED_FEATURE_IDS
  ).filter((featureId): featureId is AdvancedFeatureId =>
    availableAdvancedFeatureIds.has(featureId as AdvancedFeatureId)
  );
  if (normalizedAdvancedFeatures.length === 0) {
    normalizedAdvancedFeatures = [...DEFAULT_ADVANCED_FEATURE_IDS];
  }

  return {
    templateFeatures: effectiveTemplateFeatures,
    localizationLanguages: normalizedLocalizationLanguages,
    advancedFeatures: normalizedAdvancedFeatures,
    resolvedStagingProjectId,
    resolvedProductionProjectId,
    resolvedSingleProjectId,
  };
}
