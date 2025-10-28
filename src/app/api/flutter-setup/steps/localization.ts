import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { createLocalizationFiles } from '../localization-utils';
import fs from 'fs';
import path from 'path';
import {
  LOCALIZATION_LANGUAGE_MAP,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
} from '../../../../config/templateOptions';

export async function runLocalization(
  appName: string,
  fullOutputPath: string,
  languages: string[]
): Promise<string[]> {
  if (!languages || languages.length === 0) {
    updateProgress(
      'localization',
      '⏭️ 多言語対応の設定',
      '選択された対応言語がないためスキップします'
    );
    recordStepResult(
      'localization',
      'skipped',
      'ローカライズ言語が選択されていないためスキップしました'
    );
    return [];
  }

  updateProgress(
    'localization',
    '多言語対応の設定',
    '多言語対応ファイルを作成中...'
  );
  try {
    const files = createLocalizationFiles(appName, fullOutputPath, languages);
    files.forEach((f) => addCreatedFile(f));
    updateProgress(
      'localization',
      '✅ 多言語対応ファイルを作成しました',
      `生成した言語: ${languages.join(', ')}`
    );
    recordStepResult(
      'localization',
      'success',
      '多言語対応ファイルを作成しました',
      {
        files,
        languages,
      }
    );
    return files;
  } catch (error) {
    updateProgress(
      'localization',
      '❌ 多言語対応ファイルの作成に失敗しました',
      '多言語対応ファイルの作成に失敗しました'
    );
    recordStepResult(
      'localization',
      'error',
      '多言語対応ファイルの作成に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}

// Ensure required localization files exist; regenerate if missing.
// Returns the paths that were (re)generated. Logs only; no progress updates.
export async function ensureLocalizationFiles(
  appName: string,
  fullOutputPath: string,
  languages: string[]
): Promise<string[]> {
  try {
    const generated: string[] = [];

    // If no languages specified, nothing to ensure
    const normalized =
      Array.isArray(languages) && languages.length > 0 ? languages : [];
    if (normalized.length === 0) {
      return generated;
    }

    // Expected files
    const expected: string[] = [];
    const l10nYamlPath = path.join(fullOutputPath, 'l10n.yaml');
    expected.push(l10nYamlPath);

    const l10nDir = path.join(fullOutputPath, 'lib', 'l10n');
    const ids = normalized;
    ids.forEach((id) => {
      const option =
        LOCALIZATION_LANGUAGE_MAP[id as keyof typeof LOCALIZATION_LANGUAGE_MAP];
      if (option) {
        expected.push(path.join(l10nDir, option.outputFileName));
      }
    });

    const missing = expected.filter((p) => !fs.existsSync(p));
    if (missing.length === 0) {
      return generated;
    }

    console.warn(
      '⚠️ 一部のローカライズファイルが見つかりません。再生成します。',
      missing
    );

    const regenerated = createLocalizationFiles(
      appName,
      fullOutputPath,
      ids.length > 0 ? ids : DEFAULT_LOCALIZATION_LANGUAGE_IDS
    );
    regenerated.forEach((f) => generated.push(f));
    return generated;
  } catch (error) {
    console.error('❌ ローカライズファイルの再生成に失敗しました', error);
    return [];
  }
}
