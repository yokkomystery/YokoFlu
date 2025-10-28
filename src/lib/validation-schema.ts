import { z } from 'zod';
import {
  DEFAULT_TEMPLATE_FEATURE_IDS,
  DEFAULT_ADVANCED_FEATURE_IDS,
  LocalizationLanguageId,
} from '../config/templateOptions';

/**
 * Firebaseを使用する場合のバリデーションスキーマ
 */
export function createSetupSchema(useFirebase: boolean) {
  return z
    .object({
      appName: z
        .string()
        .min(1, 'アプリ名は必須です')
        .max(50, 'アプリ名は50文字以内で入力してください'),
      bundleId: z
        .string()
        .min(1, 'Bundle IDは必須です')
        .regex(
          /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
          'Bundle IDは正しい形式で入力してください（例：com.example.app）'
        ),
      packageName: z
        .string()
        .min(1, 'パッケージ名は必須です')
        .regex(
          /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
          'パッケージ名は正しい形式で入力してください（例：com.example.app）'
        ),
      projectId: z
        .string()
        .min(1, 'プロジェクトIDは必須です')
        .regex(
          /^[a-z][a-z0-9_-]*$/,
          'プロジェクトIDは小文字、数字、ハイフンのみ使用可能です'
        ),
      outputPath: z.string().min(1, '出力パスは必須です'),
      separateEnvironments: z.boolean(),
      existingStagingProjectId: z.string().optional(),
      existingProductionProjectId: z.string().optional(),
      singleProjectId: z.string().optional(),
      templateFeatures: z
        .array(z.string())
        .default(DEFAULT_TEMPLATE_FEATURE_IDS),
      localizationLanguages: z
        .array(z.string() as z.ZodType<LocalizationLanguageId>)
        .min(1, 'ローカライズ対象言語を1つ以上選択してください')
        .refine(
          (languages) => languages.includes('ja') || languages.includes('en'),
          {
            message: '日本語または英語のどちらか一方は必ず選択してください',
          }
        ),
      advancedFeatures: z
        .array(z.string())
        .default(DEFAULT_ADVANCED_FEATURE_IDS),
    })
    .superRefine((data, ctx) => {
      // Firebaseを利用しない場合はFirebase関連のバリデーションをスキップ
      if (!useFirebase) {
        return;
      }

      // 環境分離が有効な場合、stagingとproductionのプロジェクトIDが必要
      if (data.separateEnvironments) {
        if (!data.existingStagingProjectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'ステージング環境のFirebaseプロジェクトを選択してください',
            path: ['existingStagingProjectId'],
          });
        }
        if (!data.existingProductionProjectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'プロダクション環境のFirebaseプロジェクトを選択してください',
            path: ['existingProductionProjectId'],
          });
        }
      } else {
        // 環境分離が無効な場合、単一のプロジェクトIDが必要
        if (!data.singleProjectId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Firebaseプロジェクトを選択してください',
            path: ['singleProjectId'],
          });
        }
      }
    });
}

export type SetupFormData = z.infer<ReturnType<typeof createSetupSchema>>;
