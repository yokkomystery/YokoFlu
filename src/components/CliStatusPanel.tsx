'use client';

import React from 'react';
import { useLocale } from '../context/LocaleContext';

interface CliStatus {
  installed: boolean;
  version?: string;
  error?: string;
  loggedIn?: boolean;
}

interface EnvironmentStatus {
  flutter: CliStatus;
  dart: CliStatus;
  flutterfire: CliStatus;
  firebase: CliStatus;
}

const Card: React.FC<{
  label: string;
  status: CliStatus;
  description: string;
  optional?: boolean;
  footer?: React.ReactNode;
  optionalLabel?: string;
  detectedLabel?: string;
  notDetectedLabel?: string;
}> = ({
  label,
  status,
  description,
  optional = false,
  footer,
  optionalLabel,
  detectedLabel,
  notDetectedLabel,
}) => (
  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 space-y-2">
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status.installed ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <div className="text-sm font-semibold text-white">{label}</div>
      {optional && (
        <span className="text-xs text-gray-400 border border-gray-600 px-2 py-0.5 rounded-full">
          {optionalLabel}
        </span>
      )}
    </div>
    <div className="text-xs text-gray-300">
      {status.installed ? status.version || detectedLabel : notDetectedLabel}
    </div>
    <p className="text-xs text-gray-400">{description}</p>
    {!status.installed && status.error && (
      <p className="text-xs text-red-300 whitespace-pre-line break-words">
        {status.error}
      </p>
    )}
    {footer}
  </div>
);

interface Props {
  environmentStatus: EnvironmentStatus;
  environmentStatusError: string | null;
  useFirebase: boolean;
  onReload: () => void;
}

const CliStatusPanel: React.FC<Props> = ({
  environmentStatus,
  environmentStatusError,
  useFirebase,
  onReload,
}) => {
  const { t } = useLocale();
  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t.cliStatus.title}</h2>
        <button
          type="button"
          className="text-sm text-blue-300 hover:underline"
          onClick={onReload}
        >
          {t.cliStatus.reload}
        </button>
      </div>
      {environmentStatusError && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-3 py-2 rounded text-sm">
          {environmentStatusError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          label="Flutter CLI"
          status={environmentStatus.flutter}
          description={t.cliStatus.flutterDesc}
          detectedLabel={t.cliStatus.detected}
          notDetectedLabel={t.cliStatus.notDetected}
          footer={
            !environmentStatus.flutter.installed && (
              <p className="text-xs text-blue-200">
                {t.cliStatus.flutterGuide}:
                https://docs.flutter.dev/get-started/install
              </p>
            )
          }
        />
        <Card
          label="Dart SDK"
          status={environmentStatus.dart}
          description={t.cliStatus.dartDesc}
          detectedLabel={t.cliStatus.detected}
          notDetectedLabel={t.cliStatus.notDetected}
        />
        <Card
          label="flutterfire CLI"
          status={environmentStatus.flutterfire}
          description={
            useFirebase
              ? t.cliStatus.flutterfireDescRequired
              : t.cliStatus.flutterfireDescOptional
          }
          optional={!useFirebase}
          optionalLabel={t.cliStatus.optional}
          detectedLabel={t.cliStatus.detected}
          notDetectedLabel={t.cliStatus.notDetected}
          footer={
            !environmentStatus.flutterfire.installed && (
              <p className="text-xs text-blue-200">
                {useFirebase
                  ? t.cliStatus.flutterfireInstall
                  : t.cliStatus.flutterfireOptionalOnly}
              </p>
            )
          }
        />
        <Card
          label="Firebase CLI"
          status={environmentStatus.firebase}
          description={
            useFirebase
              ? t.cliStatus.firebaseDescRequired
              : t.cliStatus.firebaseDescOptional
          }
          optional={!useFirebase}
          optionalLabel={t.cliStatus.optional}
          detectedLabel={t.cliStatus.detected}
          notDetectedLabel={t.cliStatus.notDetected}
          footer={
            useFirebase ? (
              <div className="text-xs text-gray-300 space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      environmentStatus.firebase.loggedIn
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  ></span>
                  <span>
                    {environmentStatus.firebase.loggedIn
                      ? t.cliStatus.loggedIn
                      : t.cliStatus.loginRequired}
                  </span>
                </div>
                {!environmentStatus.firebase.loggedIn && (
                  <p className="text-xs text-blue-200">
                    `firebase login` → `firebase projects:list`{' '}
                    {t.cliStatus.firebaseAuthSteps}
                  </p>
                )}
              </div>
            ) : (
              !environmentStatus.firebase.installed && (
                <p className="text-xs text-blue-200">
                  {t.cliStatus.firebaseOptionalOnly}
                </p>
              )
            )
          }
        />
      </div>
    </div>
  );
};

export default CliStatusPanel;
