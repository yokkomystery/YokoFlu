import { updateProgress, recordStepResult, addCreatedFile } from '../utils';
import { copyTemplateFile, getTemplatePath } from '../template-utils';
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
  const buildGradleKtsPath = path.join(
    projectPath,
    'android',
    'app',
    'build.gradle.kts'
  );
  const createdFiles: string[] = [];

  // build.gradle.kts (Kotlin DSL) の処理
  if (fs.existsSync(buildGradleKtsPath)) {
    let buildGradleContent = fs.readFileSync(buildGradleKtsPath, 'utf8');

    // namespaceを正しいpackageNameに修正
    buildGradleContent = buildGradleContent.replace(
      /namespace\s*=\s*"[^"]+"/,
      `namespace = "${packageName}"`
    );

    // applicationIdを正しいpackageNameに修正
    buildGradleContent = buildGradleContent.replace(
      /applicationId\s*=\s*"[^"]+"/,
      `applicationId = "${packageName}"`
    );

    // Java/Kotlinのバージョンを17に更新
    buildGradleContent = buildGradleContent.replace(
      /sourceCompatibility\s*=\s*JavaVersion\.VERSION_\d+/,
      'sourceCompatibility = JavaVersion.VERSION_17'
    );
    buildGradleContent = buildGradleContent.replace(
      /targetCompatibility\s*=\s*JavaVersion\.VERSION_\d+/,
      'targetCompatibility = JavaVersion.VERSION_17'
    );
    buildGradleContent = buildGradleContent.replace(
      /jvmTarget\s*=\s*JavaVersion\.VERSION_\d+\.toString\(\)/,
      'jvmTarget = JavaVersion.VERSION_17.toString()'
    );

    // versionNameの後にresValueでapp_nameを追加（環境分離がない場合も必要）
    if (!buildGradleContent.includes('resValue')) {
      buildGradleContent = buildGradleContent.replace(
        /(versionName\s*=\s*flutter\.versionName)/,
        `$1\n        resValue("string", "app_name", "${appName}")`
      );
    }

    // 環境分離が有効な場合のみflavor設定を追加
    if (separateEnvironments) {
      // flavorDimensionsの追加（Kotlin DSL形式）
      if (!buildGradleContent.includes('flavorDimensions')) {
        buildGradleContent = buildGradleContent.replace(
          /defaultConfig\s*{/,
          `flavorDimensions += "environment"\n\n    defaultConfig {`
        );
      }

      // productFlavorsの追加（buildTypesセクションの後に追加）
      if (!buildGradleContent.includes('productFlavors')) {
        // buildTypesセクションを探して、その後に追加
        const buildTypesRegex = /(buildTypes\s*\{[\s\S]*?\n    \})/;
        if (buildTypesRegex.test(buildGradleContent)) {
          buildGradleContent = buildGradleContent.replace(
            buildTypesRegex,
            `$1

    productFlavors {
        create("staging") {
            dimension = "environment"
            applicationIdSuffix = ".staging"
            resValue("string", "app_name", "${appName} (Staging)")
        }
        create("production") {
            dimension = "environment"
            resValue("string", "app_name", "${appName}")
        }
    }`
          );
        }
      }
    }

    fs.writeFileSync(buildGradleKtsPath, buildGradleContent);
    createdFiles.push(buildGradleKtsPath);
  }
  // build.gradle (Groovy) の処理
  else if (fs.existsSync(buildGradlePath)) {
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // namespaceを正しいpackageNameに修正
    buildGradleContent = buildGradleContent.replace(
      /namespace\s+["']([^"']+)["']/,
      `namespace "${packageName}"`
    );

    // applicationIdを正しいpackageNameに修正
    buildGradleContent = buildGradleContent.replace(
      /applicationId\s+["']([^"']+)["']/,
      `applicationId "${packageName}"`
    );

    // Java/Kotlinのバージョンを17に更新
    buildGradleContent = buildGradleContent.replace(
      /sourceCompatibility\s+JavaVersion\.VERSION_\d+/,
      'sourceCompatibility JavaVersion.VERSION_17'
    );
    buildGradleContent = buildGradleContent.replace(
      /targetCompatibility\s+JavaVersion\.VERSION_\d+/,
      'targetCompatibility JavaVersion.VERSION_17'
    );
    buildGradleContent = buildGradleContent.replace(
      /jvmTarget\s*=\s*["']\d+["']/,
      `jvmTarget = '17'`
    );

    // versionNameの後にresValueでapp_nameを追加（環境分離がない場合も必要）
    if (!buildGradleContent.includes('resValue')) {
      buildGradleContent = buildGradleContent.replace(
        /(versionName\s+flutterVersionName)/,
        `$1\n        resValue "string", "app_name", "${appName}"`
      );
    }

    // 環境分離が有効な場合のみflavor設定を追加
    if (separateEnvironments) {
      // flavorDimensionsの追加
      if (!buildGradleContent.includes('flavorDimensions')) {
        buildGradleContent = buildGradleContent.replace(
          /defaultConfig\s*{/,
          `flavorDimensions "environment"\n\n    defaultConfig {`
        );
      }

      // productFlavorsの追加（buildTypesセクションの後に追加）
      if (!buildGradleContent.includes('productFlavors')) {
        const buildTypesRegex = /(buildTypes\s*\{[\s\S]*?\n    \})/;
        if (buildTypesRegex.test(buildGradleContent)) {
          buildGradleContent = buildGradleContent.replace(
            buildTypesRegex,
            `$1

    productFlavors {
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            resValue "string", "app_name", "${appName} (Staging)"
        }
        production {
            dimension "environment"
            resValue "string", "app_name", "${appName}"
        }
    }`
          );
        }
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

  // AndroidManifest.xmlをテンプレートからコピー（@string/app_nameを使用）
  const androidManifestPath = path.join(
    projectPath,
    'android',
    'app',
    'src',
    'main',
    'AndroidManifest.xml'
  );
  const androidManifestTemplatePath = getTemplatePath('android/AndroidManifest.xml');
  if (fs.existsSync(androidManifestTemplatePath)) {
    copyTemplateFile(androidManifestTemplatePath, androidManifestPath, {});
    createdFiles.push(androidManifestPath);
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
