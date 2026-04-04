import fs from 'fs';
import path from 'path';
import {
  LOCALIZATION_LANGUAGE_MAP,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
} from '../../../config/templateOptions';
import { copyTemplateFile, getTemplatePath } from './template-utils';

const LOCALIZATION_FALLBACKS: Record<string, string[]> = {
  pt_BR: ['pt'],
  zh_CN: ['zh'],
  zh_TW: ['zh'],
};

const LOCALIZATION_TEMPLATE_OVERRIDES: Record<
  string,
  { templatePath: string; outputFileName: string }
> = {
  pt: {
    templatePath: 'localization/app_pt.arb',
    outputFileName: 'app_pt.arb',
  },
  zh: {
    templatePath: 'localization/app_zh.arb',
    outputFileName: 'app_zh.arb',
  },
};

export function resolveLocalizationLanguageIds(
  languageIds: string[]
): string[] {
  const normalizedIds =
    languageIds && languageIds.length > 0
      ? languageIds
      : DEFAULT_LOCALIZATION_LANGUAGE_IDS;

  const resolved = new Set<string>(normalizedIds);

  normalizedIds.forEach((languageId) => {
    const fallbackIds = LOCALIZATION_FALLBACKS[languageId] ?? [];
    fallbackIds.forEach((fallbackId) => resolved.add(fallbackId));
  });

  return [...resolved];
}

export function createLocalizationFiles(
  appName: string,
  projectPath: string,
  languageIds: string[]
): string[] {
  const createdFiles: string[] = [];
  const l10nPath = path.join(projectPath, 'lib', 'l10n');

  if (!fs.existsSync(l10nPath)) {
    fs.mkdirSync(l10nPath, { recursive: true });
  }

  // l10n.yamlをコピー
  const l10nYamlTemplatePath = getTemplatePath('core/l10n.yaml');
  const l10nYamlTargetPath = path.join(projectPath, 'l10n.yaml');

  if (fs.existsSync(l10nYamlTemplatePath)) {
    copyTemplateFile(l10nYamlTemplatePath, l10nYamlTargetPath, {
      APP_NAME: appName,
    });
    createdFiles.push(l10nYamlTargetPath);
    console.log('✅ l10n.yamlを作成しました');
  } else {
    console.warn('⚠️ l10n.yamlテンプレートが見つかりません');
  }

  const normalizedIds = resolveLocalizationLanguageIds(languageIds);

  normalizedIds.forEach((languageId) => {
    const languageOption =
      LOCALIZATION_LANGUAGE_MAP[
        languageId as keyof typeof LOCALIZATION_LANGUAGE_MAP
      ] ?? LOCALIZATION_TEMPLATE_OVERRIDES[languageId];

    if (!languageOption) {
      console.warn(
        `⚠️ 未対応のローカライズ言語が指定されました: ${languageId}`
      );
      return;
    }

    const targetPath = path.join(l10nPath, languageOption.outputFileName);
    const templatePath = getTemplatePath(languageOption.templatePath);

    copyTemplateFile(templatePath, targetPath, {
      APP_NAME: appName,
    });
    createdFiles.push(targetPath);
  });

  console.log('✅ ローカライゼーションファイルを作成しました');
  return createdFiles;
}
