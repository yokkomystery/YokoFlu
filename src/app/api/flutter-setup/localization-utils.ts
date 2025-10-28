import fs from 'fs';
import path from 'path';
import {
  LOCALIZATION_LANGUAGE_MAP,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
} from '../../../config/templateOptions';
import { copyTemplateFile, getTemplatePath } from './template-utils';

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

  const fallbackIds = DEFAULT_LOCALIZATION_LANGUAGE_IDS;
  const normalizedIds =
    languageIds && languageIds.length > 0 ? languageIds : fallbackIds;

  normalizedIds.forEach((languageId) => {
    const languageOption =
      LOCALIZATION_LANGUAGE_MAP[
        languageId as keyof typeof LOCALIZATION_LANGUAGE_MAP
      ];

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
