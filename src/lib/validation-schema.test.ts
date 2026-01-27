import { describe, it, expect } from 'vitest';
import { createSetupSchema } from './validation-schema';

describe('validation-schema', () => {
  describe('createSetupSchema (Firebase無効)', () => {
    const schema = createSetupSchema(false);

    describe('appName', () => {
      it('空文字の場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: '',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('アプリ名は必須です');
        }
      });

      it('50文字を超える場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'a'.repeat(51),
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'アプリ名は50文字以内で入力してください'
          );
        }
      });

      it('有効なアプリ名は通過する', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(true);
      });
    });

    describe('bundleId', () => {
      it('正しい形式でない場合はエラーになる', () => {
        const invalidBundleIds = [
          'ComExample', // 大文字で始まる
          '123.example.app', // 数字で始まる
          'com..app', // 連続ドット
          'com.Example.app', // 途中が大文字
        ];

        invalidBundleIds.forEach((bundleId) => {
          const result = schema.safeParse({
            appName: 'MyApp',
            bundleId,
            packageName: 'com.example.app',
            projectId: 'my-app',
            outputPath: '/path/to/output',
            separateEnvironments: false,
            localizationLanguages: ['ja'],
          });
          expect(result.success).toBe(false);
        });
      });

      it('有効なbundleIdは通過する', () => {
        const validBundleIds = [
          'com.example.app',
          'com.example.my_app',
          'jp.co.example.app123',
        ];

        validBundleIds.forEach((bundleId) => {
          const result = schema.safeParse({
            appName: 'MyApp',
            bundleId,
            packageName: 'com.example.app',
            projectId: 'my-app',
            outputPath: '/path/to/output',
            separateEnvironments: false,
            localizationLanguages: ['ja'],
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('projectId', () => {
      it('大文字を含む場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'MyApp',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
      });

      it('有効なprojectIdは通過する', () => {
        const validProjectIds = ['my-app', 'my_app', 'myapp123', 'app-123-test'];

        validProjectIds.forEach((projectId) => {
          const result = schema.safeParse({
            appName: 'MyApp',
            bundleId: 'com.example.app',
            packageName: 'com.example.app',
            projectId,
            outputPath: '/path/to/output',
            separateEnvironments: false,
            localizationLanguages: ['ja'],
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('localizationLanguages', () => {
      it('空配列の場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: [],
        });
        expect(result.success).toBe(false);
      });

      it('日本語も英語も含まない場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['zh'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message);
          expect(messages).toContain(
            '日本語または英語のどちらか一方は必ず選択してください'
          );
        }
      });

      it('日本語のみでも通過する', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(true);
      });

      it('英語のみでも通過する', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['en'],
        });
        expect(result.success).toBe(true);
      });

      it('複数言語を選択できる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          localizationLanguages: ['ja', 'en', 'zh'],
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('createSetupSchema (Firebase有効)', () => {
    const schema = createSetupSchema(true);

    describe('環境分離が有効な場合', () => {
      it('stagingプロジェクトIDがない場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: true,
          existingStagingProjectId: '',
          existingProductionProjectId: 'prod-project',
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message);
          expect(messages).toContain(
            'ステージング環境のFirebaseプロジェクトを選択してください'
          );
        }
      });

      it('productionプロジェクトIDがない場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: true,
          existingStagingProjectId: 'staging-project',
          existingProductionProjectId: '',
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message);
          expect(messages).toContain(
            'プロダクション環境のFirebaseプロジェクトを選択してください'
          );
        }
      });

      it('両方のプロジェクトIDがあれば通過する', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: true,
          existingStagingProjectId: 'staging-project',
          existingProductionProjectId: 'prod-project',
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(true);
      });
    });

    describe('環境分離が無効な場合', () => {
      it('singleProjectIdがない場合はエラーになる', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          singleProjectId: '',
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message);
          expect(messages).toContain('Firebaseプロジェクトを選択してください');
        }
      });

      it('singleProjectIdがあれば通過する', () => {
        const result = schema.safeParse({
          appName: 'MyApp',
          bundleId: 'com.example.app',
          packageName: 'com.example.app',
          projectId: 'my-app',
          outputPath: '/path/to/output',
          separateEnvironments: false,
          singleProjectId: 'my-firebase-project',
          localizationLanguages: ['ja'],
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
