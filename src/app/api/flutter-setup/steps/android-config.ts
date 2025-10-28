import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import fs from 'fs';
import path from 'path';

function createAndroidConfigs(
  packageName: string,
  appName: string,
  projectPath: string,
  separateEnvironments: boolean = true
) {
  const buildGradlePath = path.join(
    projectPath,
    'android',
    'app',
    'build.gradle'
  );
  const createdFiles: string[] = [];

  if (fs.existsSync(buildGradlePath)) {
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // 環境分離が有効な場合のみflavor設定を追加
    if (separateEnvironments) {
      // flavorDimensionsの追加
      if (!buildGradleContent.includes('flavorDimensions')) {
        buildGradleContent = buildGradleContent.replace(
          /android\s*{/,
          `android {
    flavorDimensions "environment"`
        );
      }

      // productFlavorsの追加
      if (!buildGradleContent.includes('productFlavors')) {
        buildGradleContent = buildGradleContent.replace(
          /buildTypes\s*{/,
          `buildTypes {
        }
        
        productFlavors {
            staging {
                dimension "environment"
                applicationIdSuffix ".staging"
                resValue "string", "app_name", "${appName} (Staging)"
                buildConfigField "String", "ENVIRONMENT", '"staging"'
            }
            production {
                dimension "environment"
                resValue "string", "app_name", "${appName}"
                buildConfigField "String", "ENVIRONMENT", '"production"'
            }
        }`
        );
      }
    }

    fs.writeFileSync(buildGradlePath, buildGradleContent);
    createdFiles.push(buildGradlePath);
  }

  // strings.xmlの更新
  const stringsPath = path.join(
    projectPath,
    'android',
    'app',
    'src',
    'main',
    'res',
    'values',
    'strings.xml'
  );
  if (fs.existsSync(stringsPath)) {
    let stringsContent = fs.readFileSync(stringsPath, 'utf8');
    stringsContent = stringsContent.replace(
      /<string name="app_name">.*?<\/string>/,
      `<string name="app_name">${appName}</string>`
    );
    fs.writeFileSync(stringsPath, stringsContent);
    createdFiles.push(stringsPath);
  }

  // 環境分離が有効な場合のみ環境別strings.xmlを作成
  if (separateEnvironments) {
    const stagingStringsPath = path.join(
      projectPath,
      'android',
      'app',
      'src',
      'staging',
      'res',
      'values'
    );
    const productionStringsPath = path.join(
      projectPath,
      'android',
      'app',
      'src',
      'production',
      'res',
      'values'
    );

    fs.mkdirSync(stagingStringsPath, { recursive: true });
    fs.mkdirSync(productionStringsPath, { recursive: true });

    const stagingStrings = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName} (Staging)</string>
</resources>`;

    const productionStrings = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;

    fs.writeFileSync(
      path.join(stagingStringsPath, 'strings.xml'),
      stagingStrings
    );
    createdFiles.push(path.join(stagingStringsPath, 'strings.xml'));
    fs.writeFileSync(
      path.join(productionStringsPath, 'strings.xml'),
      productionStrings
    );
    createdFiles.push(path.join(productionStringsPath, 'strings.xml'));
  }

  return createdFiles;
}

export async function runAndroidConfig(
  packageName: string,
  appName: string,
  fullOutputPath: string,
  separateEnvironments: boolean
): Promise<string[]> {
  updateProgress(
    'android-config',
    'Android設定ファイルの作成',
    'Android設定ファイルを作成中...'
  );
  try {
    const files = createAndroidConfigs(
      packageName,
      appName,
      fullOutputPath,
      separateEnvironments
    );
    files.forEach((f) => addCreatedFile(f));
    updateProgress(
      'android-config',
      '✅ Android設定ファイルを作成しました',
      'Android設定ファイルを作成しました'
    );
    recordStepResult(
      'android-config',
      'success',
      'Android設定ファイルを作成しました',
      { files }
    );
    return files;
  } catch (error) {
    updateProgress(
      'android-config',
      '❌ Android設定ファイルの作成に失敗しました',
      'Android設定ファイルの作成に失敗しました'
    );
    recordStepResult(
      'android-config',
      'error',
      'Android設定ファイルの作成に失敗しました',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
