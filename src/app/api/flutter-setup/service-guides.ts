export type FirebaseServiceId =
  | "firestore"
  | "storage"
  | "messaging"
  | "auth"
  | "analytics"
  | "crashlytics"
  | "functions"
  | "hosting"
  | "remote-config"
  | "app-check";

type ServiceGuide = {
  label: string;
  description: string;
  nextStep?: (projects: string[]) => string;
};

const serviceCatalog: Record<FirebaseServiceId, ServiceGuide> = {
  firestore: {
    label: "Cloud Firestore",
    description: "NoSQLデータベース",
    nextStep: (projects) =>
      `Firebase Console の Firestore で ${formatProjects(
        projects
      )} のデータベースリージョンとセキュリティルールを設定してください。`,
  },
  storage: {
    label: "Cloud Storage",
    description: "ファイルストレージ",
    nextStep: (projects) =>
      `Firebase Console の Storage で ${formatProjects(
        projects
      )} のバケットルールを確認し、必要に応じて更新してください。`,
  },
  messaging: {
    label: "Cloud Messaging",
    description: "プッシュ通知",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} の Cloud Messaging 設定で APNs / FCM のキーと証明書を登録してください。`,
  },
  auth: {
    label: "Authentication",
    description: "ユーザー認証",
    nextStep: (projects) =>
      `Firebase Console の Authentication で ${formatProjects(
        projects
      )} のサインイン方式を有効化してください。`,
  },
  analytics: {
    label: "Google Analytics",
    description: "アナリティクス",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} を Google Analytics プロパティとリンクし、レポートを有効にしてください。`,
  },
  crashlytics: {
    label: "Crashlytics",
    description: "クラッシュレポート",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} で Crashlytics ダッシュボードを確認し、テストクラッシュで動作を検証してください。`,
  },
  functions: {
    label: "Cloud Functions",
    description: "サーバーレス関数",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} の Cloud Functions 用に Firebase CLI で関数テンプレートを初期化し、必要なリージョンを設定してください。`,
  },
  hosting: {
    label: "Hosting",
    description: "Webホスティング",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} の Hosting 設定を行い、` +
      "`firebase deploy --only hosting` でデプロイ手順を確認してください。",
  },
  "remote-config": {
    label: "Remote Config",
    description: "リモート設定",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} の Remote Config テンプレートを作成し、必要なキーを定義してください。`,
  },
  "app-check": {
    label: "App Check",
    description: "アプリ保護",
    nextStep: (projects) =>
      `${formatProjects(
        projects
      )} の App Check でデバイス証明のプロバイダを有効化してください。`,
  },
};

function formatProjects(projects: string[]): string {
  const ids = projects.filter(Boolean);
  if (ids.length === 0) {
    return "対象プロジェクト";
  }
  if (ids.length === 1) {
    return `プロジェクト「${ids[0]}」`;
  }
  return `プロジェクト（${ids.join(", ")}）`;
}

export function getFirebaseServiceLabel(serviceId: string): string | null {
  const guide = serviceCatalog[serviceId as FirebaseServiceId];
  return guide?.label ?? null;
}

export function getFirebaseServiceDescription(serviceId: string): string | null {
  const guide = serviceCatalog[serviceId as FirebaseServiceId];
  return guide?.description ?? null;
}

export function getFirebaseServiceNextStep(
  serviceId: string,
  projects: string[]
): string | null {
  const guide = serviceCatalog[serviceId as FirebaseServiceId];
  if (!guide?.nextStep) {
    return null;
  }
  return guide.nextStep(projects);
}

export function formatServiceSummary(ids: string[]): string {
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds
    .map((id) => {
      const label = getFirebaseServiceLabel(id) ?? id;
      const description = getFirebaseServiceDescription(id);
      return description ? `${label}（${description}）` : label;
    })
    .join(", ");
}

