import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';

export type AppTemplateId = 'blank' | 'counter' | 'todo' | 'stopwatch' | 'chat';

interface AppTemplateConfig {
  id: AppTemplateId;
  homeFileName: string;
  requiresFirebase: boolean;
  mainImport: string;
  homePage: string;
}

const APP_TEMPLATE_CONFIGS: Record<AppTemplateId, AppTemplateConfig> = {
  blank: {
    id: 'blank',
    homeFileName: 'blank_home.dart',
    requiresFirebase: false,
    mainImport: "import 'package:{{APP_NAME}}/blank_home.dart';",
    homePage: "const BlankHomePage(appName: '{{APP_DISPLAY_NAME}}')",
  },
  counter: {
    id: 'counter',
    homeFileName: 'counter_home.dart',
    requiresFirebase: false,
    mainImport: "import 'package:{{APP_NAME}}/counter_home.dart';",
    homePage: "const CounterHomePage(appName: '{{APP_DISPLAY_NAME}}')",
  },
  todo: {
    id: 'todo',
    homeFileName: 'todo_home.dart',
    requiresFirebase: false,
    mainImport: "import 'package:{{APP_NAME}}/todo_home.dart';",
    homePage: "const TodoHomePage(appName: '{{APP_DISPLAY_NAME}}')",
  },
  stopwatch: {
    id: 'stopwatch',
    homeFileName: 'stopwatch_home.dart',
    requiresFirebase: false,
    mainImport: "import 'package:{{APP_NAME}}/stopwatch_home.dart';",
    homePage: "const StopwatchHomePage(appName: '{{APP_DISPLAY_NAME}}')",
  },
  chat: {
    id: 'chat',
    homeFileName: 'chat_home.dart',
    requiresFirebase: true,
    mainImport: "import 'package:{{APP_NAME}}/chat_home.dart';",
    homePage: "const ChatHomePage(appName: '{{APP_DISPLAY_NAME}}')",
  },
};

interface CreateAppTemplateOptions {
  settingsEnabled: boolean;
}

export function createAppTemplate(
  appTemplate: AppTemplateId,
  appName: string,
  projectPath: string,
  options: CreateAppTemplateOptions
): string[] {
  const createdFiles: string[] = [];
  const config = APP_TEMPLATE_CONFIGS[appTemplate];

  if (!config) {
    console.warn(`⚠️ 未対応のアプリテンプレート: ${appTemplate}`);
    return createdFiles;
  }

  // 正規化されたプロジェクト名
  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  // テンプレートファイルをlib/にコピー
  const templatePath = getTemplatePath(`app_templates/${config.homeFileName}`);
  const targetPath = path.join(projectPath, 'lib', config.homeFileName);

  copyTemplateFile(
    templatePath,
    targetPath,
    {
      APP_NAME: normalizedAppName,
      APP_DISPLAY_NAME: appName,
    },
    {
      SETTINGS_ENABLED: options.settingsEnabled,
    }
  );

  createdFiles.push(targetPath);
  console.log(`✅ ${config.id}テンプレートのホーム画面を作成しました`);

  return createdFiles;
}

export function updateMainDartWithTemplate(
  appTemplate: AppTemplateId,
  projectPath: string,
  displayName: string
): string | null {
  const config = APP_TEMPLATE_CONFIGS[appTemplate];
  if (!config) return null;

  const normalizedAppName = path
    .basename(projectPath)
    .toLowerCase()
    .replace(/-/g, '_');

  const mainDartPath = path.join(projectPath, 'lib', 'main.dart');

  if (!fs.existsSync(mainDartPath)) {
    console.warn('⚠️ main.dartが見つかりません');
    return null;
  }

  let mainContent = fs.readFileSync(mainDartPath, 'utf8');

  // テンプレートに応じたインポートを追加
  const importStatement = config.mainImport.replace(
    /{{APP_NAME}}/g,
    normalizedAppName
  );

  // インポート文が存在しない場合のみ追加
  if (!mainContent.includes(importStatement)) {
    const settingsImportRegexNew = new RegExp(
      `(import 'package:.*?/features/settings/settings_screen\\.dart';)`
    );
    const settingsImportRegexOld = new RegExp(
      `(import 'package:.*?/features/profile/screens/settings_screen\\.dart';)`
    );
    if (settingsImportRegexNew.test(mainContent)) {
      mainContent = mainContent.replace(
        settingsImportRegexNew,
        `$1\n${importStatement}`
      );
    } else if (settingsImportRegexOld.test(mainContent)) {
      mainContent = mainContent.replace(
        settingsImportRegexOld,
        `$1\n${importStatement}`
      );
    } else {
      mainContent = importStatement + '\n' + mainContent;
    }
  }

  // HomeTabPlaceholderをテンプレートのホーム画面に置き換え
  const homePage = config.homePage
    .replace(/{{APP_NAME}}/g, normalizedAppName)
    .replace(/{{APP_DISPLAY_NAME}}/g, displayName);

  console.log(`🔄 HomeTabPlaceholder()を${homePage}に置き換えます`);
  mainContent = mainContent.replace(/const HomeTabPlaceholder\(\)/, homePage);

  // home: const MyHomePage(...) をテンプレートのホームに置き換え
  const myHomePattern = /const MyHomePage\(title: '.*?'\)/g;
  if (myHomePattern.test(mainContent)) {
    myHomePattern.lastIndex = 0; // .test()で進んだlastIndexをリセット
    mainContent = mainContent.replace(myHomePattern, homePage);
  }

  const removeClassDefinition = (content: string, className: string) => {
    const classIndex = content.indexOf(className);
    if (classIndex === -1) {
      console.log(
        `ℹ️ ${className} が見つかりませんでした（既に削除済みの可能性）`
      );
      return content;
    }

    let braceCount = 0;
    let inClass = false;
    let classEndIndex = classIndex;

    for (let i = classIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inClass = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inClass && braceCount === 0) {
          classEndIndex = i + 1;
          break;
        }
      }
    }

    const before = content.substring(0, classIndex);
    const after = content.substring(classEndIndex);
    console.log(`✅ ${className.trim()} を削除しました`);
    return before + after;
  };

  mainContent = removeClassDefinition(mainContent, 'class MyHomePage');
  mainContent = removeClassDefinition(mainContent, 'class _MyHomePageState');
  mainContent = removeClassDefinition(mainContent, 'class HomeTabPlaceholder');

  fs.writeFileSync(mainDartPath, mainContent);
  console.log(`✅ main.dartを${config.id}テンプレート用に更新しました`);

  return mainDartPath;
}

export function getTemplateConfig(appTemplate: AppTemplateId) {
  return APP_TEMPLATE_CONFIGS[appTemplate];
}
