import { describe, it, expect } from 'vitest';
import { normalizeParameters } from '../parameter-normalizer';
import {
  DEFAULT_TEMPLATE_FEATURE_IDS,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
  DEFAULT_ADVANCED_FEATURE_IDS,
} from '../../../../../config/templateOptions';

describe('normalizeParameters', () => {
  const baseInput = {
    appName: 'MyApp',
    templateFeatures: ['settings-screen'],
    localizationLanguages: ['ja', 'en'],
    advancedFeatures: [],
    projectId: 'my-project',
  };

  describe('プロジェクトID解決', () => {
    it('existingStagingProjectIdが指定されていればそれを使用する', () => {
      const result = normalizeParameters({
        ...baseInput,
        existingStagingProjectId: 'custom-staging',
      });
      expect(result.resolvedStagingProjectId).toBe('custom-staging');
    });

    it('existingStagingProjectIdがない場合はアプリ名からステージングIDを生成する', () => {
      const result = normalizeParameters({
        ...baseInput,
        existingStagingProjectId: '',
      });
      expect(result.resolvedStagingProjectId).toBe('myapp-staging');
    });

    it('existingProductionProjectIdが指定されていればそれを使用する', () => {
      const result = normalizeParameters({
        ...baseInput,
        existingProductionProjectId: 'custom-prod',
      });
      expect(result.resolvedProductionProjectId).toBe('custom-prod');
    });

    it('existingProductionProjectIdがない場合はアプリ名からプロダクションIDを生成する', () => {
      const result = normalizeParameters({
        ...baseInput,
        existingProductionProjectId: '',
      });
      expect(result.resolvedProductionProjectId).toBe('myapp-production');
    });

    it('singleProjectIdが指定されていればそれを使用する', () => {
      const result = normalizeParameters({
        ...baseInput,
        singleProjectId: 'single-project',
      });
      expect(result.resolvedSingleProjectId).toBe('single-project');
    });

    it('singleProjectIdがない場合はprojectIdを使用する', () => {
      const result = normalizeParameters({
        ...baseInput,
        singleProjectId: '',
      });
      expect(result.resolvedSingleProjectId).toBe('my-project');
    });

    it('アプリ名が大文字でも小文字に変換される', () => {
      const result = normalizeParameters({
        ...baseInput,
        appName: 'MyAppTest',
        existingStagingProjectId: '',
      });
      expect(result.resolvedStagingProjectId).toBe('myapptest-staging');
    });
  });

  describe('テンプレート機能の正規化', () => {
    it('有効なテンプレート機能が正規化される', () => {
      const result = normalizeParameters({
        ...baseInput,
        templateFeatures: ['settings-screen'],
      });
      expect(result.templateFeatures).toEqual(['settings-screen']);
    });

    it('無効なテンプレート機能はフィルタリングされる', () => {
      const result = normalizeParameters({
        ...baseInput,
        templateFeatures: ['settings-screen', 'invalid-feature'],
      });
      expect(result.templateFeatures).toEqual(['settings-screen']);
    });

    it('templateFeaturesが配列でない場合はデフォルト値が使用される', () => {
      const result = normalizeParameters({
        ...baseInput,
        templateFeatures: null,
      });
      expect(result.templateFeatures).toEqual(DEFAULT_TEMPLATE_FEATURE_IDS);
    });

    it('空配列は尊重される（ユーザーが意図的にすべてチェックを外した場合）', () => {
      const result = normalizeParameters({
        ...baseInput,
        templateFeatures: [],
      });
      expect(result.templateFeatures).toEqual([]);
    });
  });

  describe('ローカライズ言語の正規化', () => {
    it('有効な言語が正規化される', () => {
      const result = normalizeParameters({
        ...baseInput,
        localizationLanguages: ['ja', 'en'],
      });
      // 現在サポートされている言語は日本語と英語のみ
      expect(result.localizationLanguages).toEqual(['ja', 'en']);
    });

    it('無効な言語はフィルタリングされる', () => {
      const result = normalizeParameters({
        ...baseInput,
        localizationLanguages: ['ja', 'invalid-lang'],
      });
      expect(result.localizationLanguages).toEqual(['ja']);
    });

    it('localizationLanguagesが配列でない場合はデフォルト値が使用される', () => {
      const result = normalizeParameters({
        ...baseInput,
        localizationLanguages: undefined,
      });
      expect(result.localizationLanguages).toEqual(
        DEFAULT_LOCALIZATION_LANGUAGE_IDS
      );
    });

    it('空配列の場合はデフォルト値にフォールバックする', () => {
      const result = normalizeParameters({
        ...baseInput,
        localizationLanguages: [],
      });
      expect(result.localizationLanguages).toEqual(
        DEFAULT_LOCALIZATION_LANGUAGE_IDS
      );
    });

    it('フィルタリング後に空になった場合もデフォルト値にフォールバックする', () => {
      const result = normalizeParameters({
        ...baseInput,
        localizationLanguages: ['invalid1', 'invalid2'],
      });
      expect(result.localizationLanguages).toEqual(
        DEFAULT_LOCALIZATION_LANGUAGE_IDS
      );
    });
  });

  describe('高度な機能の正規化', () => {
    it('有効な高度な機能が正規化される', () => {
      const result = normalizeParameters({
        ...baseInput,
        advancedFeatures: ['forced-update', 'maintenance-mode'],
      });
      expect(result.advancedFeatures).toContain('forced-update');
      expect(result.advancedFeatures).toContain('maintenance-mode');
    });

    it('無効な機能はフィルタリングされる', () => {
      const result = normalizeParameters({
        ...baseInput,
        advancedFeatures: ['forced-update', 'non-existent-feature'],
      });
      expect(result.advancedFeatures).toContain('forced-update');
      expect(result.advancedFeatures).not.toContain('non-existent-feature');
    });

    it('advancedFeaturesが配列でない場合はデフォルト値が使用される', () => {
      const result = normalizeParameters({
        ...baseInput,
        advancedFeatures: null,
      });
      expect(result.advancedFeatures).toEqual(DEFAULT_ADVANCED_FEATURE_IDS);
    });

    it('空配列の場合はデフォルト値にフォールバックする', () => {
      const result = normalizeParameters({
        ...baseInput,
        advancedFeatures: [],
      });
      expect(result.advancedFeatures).toEqual(DEFAULT_ADVANCED_FEATURE_IDS);
    });
  });

  describe('統合テスト', () => {
    it('すべてのパラメータが正しく正規化される', () => {
      const result = normalizeParameters({
        appName: 'TestApp',
        templateFeatures: ['settings-screen'],
        localizationLanguages: ['ja', 'en'],
        advancedFeatures: ['forced-update'],
        existingStagingProjectId: 'test-staging',
        existingProductionProjectId: 'test-prod',
        singleProjectId: 'test-single',
        projectId: 'test-project',
      });

      expect(result).toEqual({
        templateFeatures: ['settings-screen'],
        localizationLanguages: ['ja', 'en'],
        advancedFeatures: ['forced-update'],
        resolvedStagingProjectId: 'test-staging',
        resolvedProductionProjectId: 'test-prod',
        resolvedSingleProjectId: 'test-single',
      });
    });
  });
});
