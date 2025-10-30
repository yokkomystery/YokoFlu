import { NextRequest, NextResponse } from 'next/server';
import {
  setProgressComplete,
  resetProgress,
} from './progress/progress-manager';

import { SetupResult, FlutterSetupRequest } from './types';
import {
  initializeSetupResult,
  addCreatedFile,
  setGlobalSetupResult,
} from './utils';
import { runFirebaseEnvironmentCheck } from './steps/firebase-check';
import { runFlutterCreate } from './steps/flutter-create';
import { runFirebaseInit } from './steps/firebase-init';
import { runPubspecUpdate } from './steps/pubspec-update';
import { runIOSConfig } from './steps/ios-config';
import { runAndroidConfig } from './steps/android-config';
import { runLocalization, ensureLocalizationFiles } from './steps/localization';
import { runProviderFiles } from './steps/provider-files';
import { runSettingsScreen } from './steps/settings-screen';
import { runMainDartUpdate } from './steps/main-dart';
import { runDependenciesInstall } from './steps/dependencies-install';
import { runAppIcon } from './steps/app-icon';
import { runBuildScripts } from './steps/build-scripts';
import { runAppTemplate } from './steps/app-template';
import { runAdvancedFeatures } from './steps/advanced-features';
import { normalizeParameters } from './helpers/parameter-normalizer';
import { addPostSetupSteps, finalizeSetup } from './helpers/completion-helpers';
import { runTodoGeneration } from './steps/todo-generation';

let setupResult: SetupResult;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      appName,
      bundleId,
      packageName,
      projectId,
      outputPath,
      separateEnvironments = true,
      existingStagingProjectId,
      existingProductionProjectId,
      singleProjectId,
      useFirebase = false,
      templateFeatures,
      localizationLanguages,
      appTemplate = 'counter',
      advancedFeatures = [],
      appIcon = null,
    }: FlutterSetupRequest = body;

    console.log('=== Flutter Setup Process Started ===');
    console.log('Parameters:', {
      appName,
      bundleId,
      packageName,
      projectId,
      outputPath,
      separateEnvironments,
      existingStagingProjectId,
      existingProductionProjectId,
      singleProjectId,
      useFirebase,
      templateFeatures,
      localizationLanguages,
    });

    // 進捗をリセットし、結果オブジェクトを初期化（早めに実行して例外時も安全に扱えるように）
    resetProgress();
    setupResult = initializeSetupResult(appName, outputPath);
    setGlobalSetupResult(setupResult);

    // パラメータの正規化（ヘルパー関数で処理）
    const {
      templateFeatures: effectiveTemplateFeatures,
      localizationLanguages: normalizedLocalizationLanguages,
      advancedFeatures: normalizedAdvancedFeatures,
      resolvedStagingProjectId,
      resolvedProductionProjectId,
      resolvedSingleProjectId,
    } = normalizeParameters({
      appName,
      templateFeatures,
      localizationLanguages,
      advancedFeatures,
      existingStagingProjectId,
      existingProductionProjectId,
      singleProjectId,
      projectId,
    });

    const selectedTemplateFeatureSet = new Set(effectiveTemplateFeatures);

    console.log(
      'テンプレート機能:',
      Array.from(selectedTemplateFeatureSet).join(', ')
    );
    console.log(
      '高度な機能:',
      normalizedAdvancedFeatures.length > 0
        ? normalizedAdvancedFeatures.join(', ')
        : 'なし'
    );
    console.log(
      'ローカライズ言語:',
      normalizedLocalizationLanguages.join(', ')
    );

    const shouldCreateSettingsScreen =
      selectedTemplateFeatureSet.has('settings-screen');

    // プロジェクトIDの決定ロジックをログ出力
    // localization files will be generated via step; regeneration handled later

    if (useFirebase) {
      if (separateEnvironments) {
        console.log('環境分離モード - 使用予定のプロジェクトID:');
        console.log(`  Staging: ${resolvedStagingProjectId}`);
        console.log(`  Production: ${resolvedProductionProjectId}`);
      } else {
        console.log('単一環境モード - 使用予定のプロジェクトID:');
        console.log(`  singleProjectId: ${singleProjectId || '未指定'}`);
        console.log(`  projectId: ${projectId}`);
        console.log(`  実際に使用されるID: ${resolvedSingleProjectId}`);
      }
    }

    // ここまでで初期化済み

    // Step 1: Firebase環境の確認（分割）
    await runFirebaseEnvironmentCheck({
      useFirebase,
      separateEnvironments,
      appName,
      singleProjectId: resolvedSingleProjectId,
      projectId,
    });

    // Step 2: Flutterプロジェクトの作成（分割）
    const fullOutputPath = await runFlutterCreate(
      appName,
      bundleId,
      outputPath
    );

    // Step 3: Firebaseプロジェクトの設定（分割）
    await runFirebaseInit({
      fullOutputPath,
      separateEnvironments,
      bundleId,
      packageName,
      resolvedStagingProjectId,
      resolvedProductionProjectId,
      resolvedSingleProjectId,
      projectId,
      useFirebase,
    });

    // Step 4: pubspec.yamlの更新（分割）
    await runPubspecUpdate(
      fullOutputPath,
      useFirebase,
      normalizedAdvancedFeatures,
      effectiveTemplateFeatures
    );

    // Step 6: iOS設定ファイルの作成（分割）
    await runIOSConfig(
      bundleId,
      appName,
      fullOutputPath,
      separateEnvironments,
      useFirebase
    );

    // Step 7: Android設定ファイルの作成（分割）
    await runAndroidConfig(
      packageName,
      appName,
      fullOutputPath,
      separateEnvironments
    );

    // Step 8: 多言語対応の設定（分割）
    await runLocalization(
      appName,
      fullOutputPath,
      normalizedLocalizationLanguages
    );

    // Step 9: プロバイダーファイルの作成（分割）
    await runProviderFiles(fullOutputPath, normalizedLocalizationLanguages);

    // Step 10: 設定画面の作成（分割）
    await runSettingsScreen(
      appName,
      fullOutputPath,
      normalizedAdvancedFeatures,
      shouldCreateSettingsScreen
    );

    // Step 11: main.dartの更新（分割）
    await runMainDartUpdate(
      fullOutputPath,
      appName,
      useFirebase,
      normalizedLocalizationLanguages,
      normalizedAdvancedFeatures,
      shouldCreateSettingsScreen
    );

    // Step 12: アプリテンプレートの適用（分割）
    await runAppTemplate(appTemplate, appName, fullOutputPath, {
      settingsEnabled: shouldCreateSettingsScreen,
    });

    // Step 13: 高度な機能の適用（分割）
    await runAdvancedFeatures(
      normalizedAdvancedFeatures,
      appName,
      fullOutputPath
    );

    // Step 14: ビルドスクリプトの作成（分割）
    await runBuildScripts(
      appName,
      fullOutputPath,
      useFirebase,
      separateEnvironments
    );

    // localizationファイルの最終確認・不足時の再生成（ステップへ委譲）
    const regenerated = await ensureLocalizationFiles(
      appName,
      fullOutputPath,
      normalizedLocalizationLanguages
    );
    if (regenerated.length > 0) {
      regenerated.forEach((file) => addCreatedFile(file));
    }

    // Step 15: 依存関係のインストール（分割）
    await runDependenciesInstall(fullOutputPath);

    // Step 16: アプリアイコン生成（分割）
    await runAppIcon(fullOutputPath, appName, appIcon);

    // セットアップ完了
    setupResult.success = true;
    setupResult.appName = appName;
    setupResult.outputPath = fullOutputPath;

    // Step 17: TODO.mdの生成
    runTodoGeneration({
      fullOutputPath,
      appName,
      useFirebase,
      separateEnvironments,
      stagingProjectId: resolvedStagingProjectId,
      productionProjectId: resolvedProductionProjectId,
      singleProjectId: resolvedSingleProjectId,
      advancedFeatures: normalizedAdvancedFeatures,
    });

    // 次のステップの追加
    addPostSetupSteps(fullOutputPath, useFirebase);

    // 最終的な結果をグローバルに設定
    setGlobalSetupResult(setupResult);

    // セットアップ完了をマーク
    finalizeSetup();

    // isComplete フラグを設定（進捗ポーリングの完了判定に必要）
    setProgressComplete();

    // 少し待ってから返す（進捗が確実に更新されるように）
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 結果を返す
    return NextResponse.json({
      success: true,
      message: `Flutterアプリ「${appName}」の作成が完了しました`,
      result: setupResult,
    });
  } catch (error) {
    console.error('Flutter setup error:', error);

    setupResult.success = false;
    setupResult.errors.push(
      error instanceof Error ? error.message : String(error)
    );

    setProgressComplete();

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        result: setupResult,
      },
      { status: 500 }
    );
  }
}

// removed unused updateAndroidBuildGradle (duplicated in steps/android-config)
