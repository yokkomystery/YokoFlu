'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProgressBar from './ProgressBar';
import ResultSection from './ResultSection';
import CliStatusPanel from './CliStatusPanel';
import ProjectSelectorModal from './ProjectSelectorModal';
import TemplateSelector from './TemplateSelector';
import LocalizationSelector from './LocalizationSelector';
import AdvancedFeaturesSelector from './AdvancedFeaturesSelector';
import useSetupProgress from '../hooks/useSetupProgress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DEFAULT_TEMPLATE_FEATURE_IDS,
  DEFAULT_LOCALIZATION_LANGUAGE_IDS,
  DEFAULT_APP_TEMPLATE_ID,
  AppTemplateId,
  DEFAULT_ADVANCED_FEATURE_IDS,
  TEMPLATE_FEATURE_OPTIONS,
  LocalizationLanguageId,
} from '../config/templateOptions';
import { createSetupSchema } from '../lib/validation-schema';
import { useCliStatus } from '../hooks/useCliStatus';
import { AppHeader } from './AppHeader';
import { BuildCommands } from './BuildCommands';
import { CollapsibleSection } from './CollapsibleSection';
import { ErrorDialog } from './ErrorDialog';
import { useLocale } from '../context/LocaleContext';

interface FirebaseProject {
  projectId: string;
  displayName: string;
  projectNumber: string;
  state: string;
}

interface ProgressStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  message?: string;
}

export default function FlutterSetupForm() {
  const { t, locale } = useLocale();
  const [useFirebase, setUseFirebase] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplateId>(
    DEFAULT_APP_TEMPLATE_ID
  );
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [appIconPreview, setAppIconPreview] = useState<string | null>(null);

  // CLIステータス管理は useCliStatus フックに分離
  const { environmentStatus, environmentStatusError, fetchEnvironmentStatus } =
    useCliStatus();

  // チャットテンプレート選択時にFirebaseを強制的に有効化
  useEffect(() => {
    if (selectedTemplate === 'chat' && !useFirebase) {
      setUseFirebase(true);
    }
  }, [selectedTemplate, useFirebase]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    result?: {
      appName?: string;
      outputPath?: string;
      steps?: Record<
        string,
        {
          status: 'success' | 'error' | 'skipped';
          message: string;
          details?: Record<string, unknown>;
        }
      >;
      createdFiles?: string[];
      nextSteps?: string[];
      errors?: string[];
    };
    message?: string;
  } | null>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [isProgressComplete, setIsProgressComplete] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [firebaseProjects, setFirebaseProjects] = useState<FirebaseProject[]>(
    []
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<
    'staging' | 'production' | 'single' | null
  >(null);

  // useFirebaseに基づいて動的にスキーマを作成
  const setupSchema = useMemo(
    () => createSetupSchema(useFirebase),
    [useFirebase]
  );

  type SetupFormData = z.infer<typeof setupSchema>;

  const defaultValues: Partial<SetupFormData> = {
    appName: '',
    bundleId: '',
    packageName: '',
    projectId: '',
    outputPath: '',
    separateEnvironments: true,
    existingStagingProjectId: '',
    existingProductionProjectId: '',
    singleProjectId: '',
    templateFeatures: [...DEFAULT_TEMPLATE_FEATURE_IDS],
    localizationLanguages: [...DEFAULT_LOCALIZATION_LANGUAGE_IDS],
    advancedFeatures: [...DEFAULT_ADVANCED_FEATURE_IDS],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues,
  });

  const separateEnvironments = watch('separateEnvironments');
  const localizationLanguages = watch('localizationLanguages');

  const buildProgressSteps = (config: {
    useFirebase: boolean;
    separateEnvironments: boolean;
  }): ProgressStep[] => {
    const steps: ProgressStep[] = [];

    if (config.useFirebase) {
      steps.push({
        id: 'firebase-check',
        title: 'Firebase環境の確認',
        status: 'pending',
      });
      steps.push({
        id: 'firebase-init',
        title: 'Firebaseプロジェクトの初期化',
        status: 'pending',
      });
    }

    steps.push({
      id: 'flutter-create',
      title: 'Flutterアプリの作成',
      status: 'pending',
    });

    if (config.useFirebase) {
      if (config.separateEnvironments) {
        steps.push(
          {
            id: 'firebase-staging',
            title: 'テスト環境の設定',
            status: 'pending',
          },
          {
            id: 'firebase-config-move-staging',
            title: 'テスト環境の設定ファイル配置',
            status: 'pending',
          },
          {
            id: 'firebase-production',
            title: '本番環境の設定',
            status: 'pending',
          },
          {
            id: 'firebase-config-move-production',
            title: '本番環境の設定ファイル配置',
            status: 'pending',
          }
        );
      } else {
        steps.push({
          id: 'firebase-single',
          title: 'Firebaseプロジェクトの設定',
          status: 'pending',
        });
      }
    }

    steps.push({
      id: 'firebase-services',
      title: 'Firebaseサービスの確認',
      status: 'pending',
    });

    steps.push(
      {
        id: 'pubspec-update',
        title: '必要なライブラリの追加',
        status: 'pending',
      },
      { id: 'ios-config', title: 'iOSアプリの設定', status: 'pending' },
      { id: 'android-config', title: 'Androidアプリの設定', status: 'pending' },
      { id: 'localization', title: '多言語対応の設定', status: 'pending' },
      { id: 'provider-files', title: 'プロバイダーの準備', status: 'pending' },
      { id: 'settings-screen', title: '設定画面の準備', status: 'pending' },
      { id: 'main-dart-update', title: 'main.dartの更新', status: 'pending' },
      {
        id: 'app-template',
        title: 'アプリテンプレートの適用',
        status: 'pending',
      },
      { id: 'advanced-features', title: '高度な機能の適用', status: 'pending' },
      { id: 'build-scripts', title: 'ビルドコマンドの準備', status: 'pending' },
      {
        id: 'dependencies-install',
        title: '依存関係のインストール',
        status: 'pending',
      },
      { id: 'app-icon', title: 'アプリアイコンの生成', status: 'pending' },
      { id: 'setup-complete', title: 'セットアップ完了', status: 'pending' }
    );

    return steps;
  };

  // 進捗ステップの初期化
  const initializeProgressSteps = () => {
    setProgressSteps(
      buildProgressSteps({
        useFirebase,
        separateEnvironments: !!separateEnvironments,
      })
    );
  };

  // Firebaseプロジェクト一覧を取得
  const fetchFirebaseProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/firebase-projects');
      if (response.ok) {
        const data = await response.json();
        setFirebaseProjects(data.projects);
      } else {
        console.error('Failed to fetch Firebase projects');
      }
    } catch (error) {
      console.error('Error fetching Firebase projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // プロジェクト選択ハンドラー
  const handleProjectSelect = (
    project: FirebaseProject,
    type: 'staging' | 'production' | 'single'
  ) => {
    if (type === 'single') {
      setValue('singleProjectId', project.projectId);
    } else if (type === 'staging') {
      setValue('existingStagingProjectId', project.projectId);
    } else if (type === 'production') {
      setValue('existingProductionProjectId', project.projectId);
    }
    setShowProjectSelector(false);
    setSelectedProjectType(null);
  };

  const onSubmit = async (data: SetupFormData) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    setShowProgress(true);
    // setProgressComplete は useSetupProgress フックで管理
    initializeProgressSteps();

    try {
      // バリデーションエラーをチェック
      const validationResult = setupSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => err.message);
        setValidationErrors(errors);
        setShowErrorDialog(true);
        setIsSubmitting(false);

        // 最初のエラーフィールドまでスクロール
        setTimeout(() => {
          const firstErrorElement = document.querySelector('.text-red-400');
          if (firstErrorElement) {
            firstErrorElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 100);

        return;
      }

      // useFirebase、テンプレートID、高度な機能、アイコンを含むデータを送信
      const requestData = {
        ...data,
        useFirebase,
        appTemplate: selectedTemplate,
        advancedFeatures: data.advancedFeatures || [],
        appIcon: appIcon, // Base64エンコードされた画像
      };

      const response = await fetch('/api/flutter-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result);
        // 進捗ポーリングが完了するまで、isSubmitting は true のまま
        // handleProgressComplete が setIsSubmitting(false) を呼び出す
      } else {
        setError(result.error || 'エラーが発生しました');

        // エラー時は進捗状態を一度取得して反映
        try {
          const progressResponse = await fetch('/api/flutter-setup/progress');
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData?.steps) {
              setProgressSteps((prev) =>
                prev.map((step) => {
                  const apiStep = progressData.steps?.[step.id];
                  if (apiStep) {
                    return {
                      ...step,
                      status: apiStep.status,
                      message: apiStep.message,
                    } as typeof step;
                  }
                  return step;
                })
              );
            }
          }
        } catch (progressError) {
          console.error('Failed to fetch progress on error:', progressError);
        }

        setIsSubmitting(false);
        setIsProgressComplete(true); // エラーでも完了扱いにして「閉じる」ボタンを表示
      }
    } catch (err) {
      console.error('Failed to submit setup request', err);
      setError('ネットワークエラーが発生しました');

      // エラー時は進捗状態を一度取得して反映
      try {
        const progressResponse = await fetch('/api/flutter-setup/progress');
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData?.steps) {
            setProgressSteps((prev) =>
              prev.map((step) => {
                const apiStep = progressData.steps?.[step.id];
                if (apiStep) {
                  return {
                    ...step,
                    status: apiStep.status,
                    message: apiStep.message,
                  } as typeof step;
                }
                return step;
              })
            );
          }
        }
      } catch (progressError) {
        console.error('Failed to fetch progress on error:', progressError);
      }

      setIsSubmitting(false);
      setIsProgressComplete(true); // エラーでも完了扱いにして「閉じる」ボタンを表示
    }
  };

  // 進捗更新（フック化）
  const handleProgressUpdate = useCallback(
    (progressData: {
      steps?: Record<
        string,
        {
          status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
          message: string;
          details?: Record<string, unknown>;
        }
      >;
      isComplete?: boolean;
    }) => {
      if (!progressData?.steps) return;
      setProgressSteps((prev) =>
        prev.map((step) => {
          const apiStep = progressData.steps?.[step.id];
          if (apiStep) {
            return {
              ...step,
              status: apiStep.status,
              message: apiStep.message,
            } as typeof step;
          }
          return step;
        })
      );
    },
    []
  );

  const handleProgressComplete = useCallback(() => {
    setIsSubmitting(false);
    setIsProgressComplete(true);
    // 自動で閉じない（ユーザーがボタンをクリックして閉じる）
  }, []);

  useSetupProgress(isSubmitting, {
    onUpdate: handleProgressUpdate,
    onComplete: handleProgressComplete,
    intervalMs: 1000,
  });

  // モーダルは使わないため、ここでの追加表示制御は不要

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー */}
        <AppHeader />

        {/* フォーム開始 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* CLIステータス確認 */}
          <CliStatusPanel
            environmentStatus={environmentStatus}
            environmentStatusError={environmentStatusError}
            useFirebase={useFirebase}
            onReload={() => {
              fetchEnvironmentStatus();
            }}
          />

          {/* 基本情報 */}
          <div
            id="basic-info-section"
            className="bg-gray-800 p-6 rounded-lg scroll-mt-6"
          >
            <h2 className="text-xl font-semibold mb-4">{t.basicInfo.title}</h2>
            <p className="text-sm text-gray-400 mb-6">{t.basicInfo.subtitle}</p>

            {/* アプリアイコン */}
            <div className="mb-6 bg-gray-900/40 border border-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                {t.basicInfo.appIcon}
              </label>
              <div className="bg-blue-900/20 border border-blue-700 rounded px-3 py-2 mb-3">
                <p className="text-xs text-blue-200 mb-1">
                  <strong>
                    {locale === 'ja'
                      ? 'アイコン自動生成機能'
                      : 'Auto Icon Generation'}
                  </strong>
                </p>
                <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside ml-2">
                  {t.basicInfo.appIconDescription.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 mb-3">
                <p className="text-xs text-gray-400">
                  <strong>{locale === 'ja' ? '注意' : 'Note'}</strong>:
                  {locale === 'ja'
                    ? 'アイコンを設定しない場合、Flutterのデフォルトアイコン（青い羽根のロゴ）が使用されます。本番リリース前に必ず独自のアイコンに差し替えることをお勧めします。'
                    : "If you do not set an icon, Flutter's default icon (blue feather logo) will be used. We recommend replacing it with your own icon before production release."}
                </p>
              </div>
              <p className="text-xs text-yellow-400 mb-3">
                <strong>{locale === 'ja' ? '必須条件' : 'Requirements'}</strong>
                :{' '}
                {locale === 'ja'
                  ? '正方形の画像（幅 = 高さ）'
                  : 'Square image (width = height)'}
                <br />
                <strong>
                  {locale === 'ja' ? '推奨サイズ' : 'Recommended Size'}
                </strong>
                : 1024x1024px{' '}
                {locale === 'ja' ? 'または 2048x2048px' : 'or 2048x2048px'}
                <br />
                <strong>{locale === 'ja' ? '形式' : 'Format'}</strong>: PNG (
                {locale === 'ja'
                  ? '透過なし推奨'
                  : 'no transparency recommended'}
                )
              </p>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {appIconPreview ? (
                    <div className="relative">
                      <img
                        src={appIconPreview}
                        alt="App Icon Preview"
                        className="w-24 h-24 rounded-lg border-2 border-blue-500 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAppIcon(null);
                          setAppIconPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // 画像の検証
                        const img = new Image();
                        const reader = new FileReader();

                        reader.onload = (e) => {
                          const base64 = e.target?.result as string;
                          img.src = base64;

                          img.onload = () => {
                            // 正方形かチェック
                            if (img.width !== img.height) {
                              alert(
                                `画像は正方形である必要があります。\n現在のサイズ: ${img.width}x${img.height}px\n\n正方形（例: 1024x1024px）の画像を選択してください。`
                              );
                              return;
                            }

                            // サイズチェック（最小512x512px）
                            if (img.width < 512 || img.height < 512) {
                              alert(
                                `画像サイズが小さすぎます。\n現在のサイズ: ${img.width}x${img.height}px\n\n最低512x512px以上、推奨1024x1024pxの画像を使用してください。`
                              );
                              return;
                            }

                            // すべてOKなら設定
                            setAppIcon(base64);
                            setAppIconPreview(base64);
                          };
                        };

                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    {t.basicInfo.appIconRequirements.map((req, index) => (
                      <p key={index}>{req}</p>
                    ))}
                  </div>
                  {appIcon && (
                    <p className="text-xs text-green-400 mt-1">
                      {t.basicInfo.appIconSet}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.basicInfo.appNameLabel}
                </label>
                <input
                  {...register('appName')}
                  type="text"
                  placeholder={t.basicInfo.appNameExample}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.basicInfo.appNameDesc}
                </p>
                {errors.appName && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.appName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.basicInfo.projectIdLabel}
                </label>
                <input
                  {...register('projectId')}
                  type="text"
                  placeholder={t.basicInfo.projectIdExample}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.basicInfo.projectIdDesc}
                </p>
                {errors.projectId && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.projectId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.basicInfo.bundleIdLabel}
                </label>
                <input
                  {...register('bundleId')}
                  type="text"
                  placeholder={t.basicInfo.bundleIdExample}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.basicInfo.bundleIdDesc}
                </p>
                <p className="text-xs text-yellow-400 mt-1">
                  {t.basicInfo.bundleIdWarning}
                </p>
                {errors.bundleId && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.bundleId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.basicInfo.packageNameLabel}
                </label>
                <input
                  {...register('packageName')}
                  type="text"
                  placeholder={t.basicInfo.packageNameExample}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.basicInfo.packageNameDesc}
                </p>
                <p className="text-xs text-yellow-400 mt-1">
                  {t.basicInfo.packageNameWarning}
                </p>
                {errors.packageName && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.packageName.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {t.basicInfo.outputPathLabel}
                </label>
                <input
                  {...register('outputPath')}
                  type="text"
                  placeholder={t.basicInfo.outputPathExample}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 break-all font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.basicInfo.outputPathDesc}
                </p>
                {errors.outputPath && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.outputPath.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* アプリテンプレート選択 */}
          <div className="mt-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={(id) => setSelectedTemplate(id)}
            />
          </div>

          {/* Firebase利用有無の選択 */}
          <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">Firebase設定</h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300 mb-2">
                <strong>Firebaseとは？</strong>
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Googleが提供するバックエンドサービス（BaaS）。サーバーを構築せずに、以下の機能をアプリに追加できます：
              </p>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside ml-2">
                <li>
                  <strong>Authentication</strong>: ログイン・ユーザー管理
                </li>
                <li>
                  <strong>Firestore</strong>: データベース
                </li>
                <li>
                  <strong>Storage</strong>: 画像・ファイル保存
                </li>
                <li>
                  <strong>Analytics</strong>: ユーザー行動分析
                </li>
                <li>
                  <strong>Remote Config</strong>: アプリの動的設定変更
                </li>
              </ul>
            </div>
            {selectedTemplate === 'chat' && (
              <div className="mb-4 bg-yellow-900/40 border border-yellow-700 text-yellow-200 px-4 py-3 rounded text-sm">
                ⚠️ {t.form.firebase.required}
              </div>
            )}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={useFirebase}
                onChange={(e) => setUseFirebase(e.target.checked)}
                disabled={selectedTemplate === 'chat'}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded disabled:opacity-50"
              />
              <div>
                <div className="font-medium">{t.form.firebase.enable}</div>
                <div className="text-sm text-gray-400">
                  {t.form.firebase.services}
                </div>
              </div>
            </label>
            {!useFirebase && (
              <div className="mt-4 bg-blue-900/30 border border-blue-700 text-blue-200 px-4 py-3 rounded text-sm">
                ℹ️{' '}
                {locale === 'ja'
                  ? 'Firebaseなしでも、カウンター、TODO、ストップウォッチのテンプレートは完全に動作します'
                  : 'Counter, TODO, and Stopwatch templates work fully without Firebase'}
              </div>
            )}
          </div>

          {/* 基本機能 */}
          <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">{t.features.title}</h2>
            <div className="space-y-6">
              <div>
                <div className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 mb-3">
                  <p className="text-xs text-gray-400">
                    <strong>
                      📱{' '}
                      {locale === 'ja'
                        ? t.features.settingsScreen
                        : '📱 ' + t.features.settingsScreen}
                    </strong>{' '}
                    {locale === 'ja' ? 'について' : ''}
                    <br />
                    {t.features.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {TEMPLATE_FEATURE_OPTIONS.map((feature) => (
                    <label
                      key={feature.id}
                      className="flex items-start space-x-3 bg-gray-900/40 border border-gray-700 rounded-lg p-3"
                    >
                      <input
                        type="checkbox"
                        value={feature.id}
                        defaultChecked={DEFAULT_TEMPLATE_FEATURE_IDS.includes(
                          feature.id
                        )}
                        {...register('templateFeatures')}
                        className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {feature.label}
                        </div>
                        <p className="text-xs text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <LocalizationSelector
                selected={
                  (localizationLanguages as LocalizationLanguageId[]) ?? []
                }
                onChange={(next) => setValue('localizationLanguages', next)}
                error={errors.localizationLanguages?.message}
              />
            </div>
          </div>

          {/* 高度な機能 */}
          <div className="mt-6">
            <CollapsibleSection
              title="高度な機能（オプション）"
              defaultOpen={false}
            >
              <AdvancedFeaturesSelector
                useFirebase={useFirebase}
                selected={watch('advancedFeatures') ?? []}
                onChange={(next) => setValue('advancedFeatures', next)}
              />
            </CollapsibleSection>
          </div>

          {/* Firebase環境設定 */}
          {useFirebase && (
            <div className="bg-gray-800 p-6 rounded-lg mt-6">
              <h2 className="text-xl font-semibold mb-4">
                🔧 Firebase環境設定
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                開発用（Staging）と本番用（Production）でFirebaseプロジェクトを分けることを推奨します。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('separateEnvironments')}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>ステージングとプロダクション環境を分離する</span>
                  </label>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 px-3 py-2 rounded text-xs text-gray-400">
                  <p className="mb-1">📝 環境分離のメリット：</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>開発中のテストデータが本番環境に影響しない</li>
                    <li>安全にデバッグや実験ができる</li>
                    <li>本番データを保護できる</li>
                  </ul>
                </div>

                {separateEnvironments ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        ステージング環境のFirebaseプロジェクトID
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          {...register('existingStagingProjectId')}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例: my-app-staging"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectType('staging');
                            setShowProjectSelector(true);
                            fetchFirebaseProjects();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          一覧から選択
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Firebase
                        コンソールで事前に作成したステージング用プロジェクト ID
                        を入力するか、一覧から選択してください。
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        プロダクション環境のFirebaseプロジェクトID
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          {...register('existingProductionProjectId')}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例: my-app-production"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectType('production');
                            setShowProjectSelector(true);
                            fetchFirebaseProjects();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          一覧から選択
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        本番用の Firebase プロジェクト ID
                        を直接入力することも可能です。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      FirebaseプロジェクトID
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        {...register('singleProjectId')}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例: my-app"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectType('single');
                          setShowProjectSelector(true);
                          fetchFirebaseProjects();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        一覧から選択
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      CLI が利用できない場合でも、Firebase コンソールで作成した
                      ID を直接入力できます。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flutterビルドコマンド表示 */}
          <div className="mt-6">
            <CollapsibleSection
              title="Flutterビルドコマンド"
              defaultOpen={false}
            >
              <BuildCommands useFirebase={useFirebase} />
            </CollapsibleSection>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? '作成中...' : 'Flutterアプリを作成'}
          </button>
        </form>

        {/* エラーダイアログ */}
        <ErrorDialog
          isOpen={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          errors={validationErrors}
        />

        {/* 成功モーダルは廃止。結果は上部に表示済み */}

        {/* プロジェクト選択モーダル */}
        <ProjectSelectorModal
          isOpen={showProjectSelector}
          isLoading={isLoadingProjects}
          projects={firebaseProjects}
          onClose={() => {
            setShowProjectSelector(false);
            setSelectedProjectType(null);
          }}
          onReload={fetchFirebaseProjects}
          onPick={(project) => {
            if (!selectedProjectType) return;
            handleProjectSelect(project, selectedProjectType);
          }}
        />

        {/* 進捗インジケーター */}
        {showProgress && (
          <ProgressBar
            steps={progressSteps}
            isComplete={isProgressComplete}
            onClose={() => setShowProgress(false)}
          />
        )}

        {/* 完了結果（ページ最下部に表示） */}
        <ResultSection success={success} />

        {/* フッター */}
        {!showProgress && (
          <footer className="mt-16 pt-8 border-t border-gray-700 text-center">
            <div className="text-sm text-gray-400 space-y-2">
              <p>
                Created for Flutter Developers by{' '}
                <span className="font-medium text-gray-300">横川 智士</span>
              </p>
              <p className="text-xs text-gray-500">
                <a
                  href="https://github.com/yokkomystery/yokoflu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  GitHub
                </a>
                {' • '}
                <a
                  href="https://github.com/yokkomystery/yokoflu/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  MIT License
                </a>
                {' • '}
                <a
                  href="mailto:contact@mysterylog.com"
                  className="text-blue-400 hover:underline"
                >
                  Contact
                </a>
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
