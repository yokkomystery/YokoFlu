import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';

// Podfileの更新（iOSデプロイメントターゲットを13.0以上に設定）
function updatePodfile(projectPath: string) {
  const podfilePath = path.join(projectPath, 'ios', 'Podfile');

  if (fs.existsSync(podfilePath)) {
    let podfileContent = fs.readFileSync(podfilePath, 'utf8');

    // プラットフォーム設定を13.0に更新
    podfileContent = podfileContent.replace(
      /platform :ios, ['"]?\d+\.\d+['"]?/,
      "platform :ios, '13.0'"
    );

    // post_installブロックを追加または更新
    const postInstallBlock = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    
    # iOS deployment targetを13.0以上に設定
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end`;

    // 既存のpost_installブロックがある場合は置換、ない場合は追加
    if (podfileContent.includes('post_install do |installer|')) {
      podfileContent = podfileContent.replace(
        /post_install do \|installer\|[\s\S]*?end/,
        postInstallBlock.trim()
      );
    } else {
      // post_installブロックがない場合は最後に追加
      podfileContent += `\n\n${postInstallBlock}`;
    }

    fs.writeFileSync(podfilePath, podfileContent);
    console.log('✅ Podfile updated with iOS deployment target 13.0');
    return podfilePath;
  } else {
    console.log('⚠️ Podfile not found, skipping update');
    return null;
  }
}

// Xcodeプロジェクトファイルのデプロイメントターゲットを更新
function updateXcodeProjectDeploymentTarget(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (fs.existsSync(projectPbxprojPath)) {
    let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

    // IPHONEOS_DEPLOYMENT_TARGETを13.0に更新
    // 3つの設定箇所をすべて更新
    projectContent = projectContent.replace(
      /IPHONEOS_DEPLOYMENT_TARGET = \d+\.\d+;/g,
      'IPHONEOS_DEPLOYMENT_TARGET = 13.0;'
    );

    // より具体的な設定箇所も更新
    projectContent = projectContent.replace(
      /IPHONEOS_DEPLOYMENT_TARGET = 12\.0;/g,
      'IPHONEOS_DEPLOYMENT_TARGET = 13.0;'
    );

    fs.writeFileSync(projectPbxprojPath, projectContent);
    console.log(
      '✅ Xcode project.pbxproj updated with iOS deployment target 13.0'
    );
    return projectPbxprojPath;
  } else {
    console.log('⚠️ Xcode project.pbxproj not found, skipping update');
    return null;
  }
}

// XcodeプロジェクトファイルからハードコードされたバンドルIDとプロダクト名を削除
function removeHardcodedBundleIdFromXcodeProject(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (fs.existsSync(projectPbxprojPath)) {
    let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

    // Runner ターゲットのビルド設定内のPRODUCT_BUNDLE_IDENTIFIERとPRODUCT_NAMEを削除
    // RunnerTests以外のセクションで削除（RunnerTestsは維持）
    projectContent = projectContent.replace(
      /(97C147061CF9000F007C117D \/\* Debug \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
      '$1'
    );
    projectContent = projectContent.replace(
      /(97C147071CF9000F007C117D \/\* Release \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
      '$1'
    );
    projectContent = projectContent.replace(
      /(249021D4217E4FDB00AE95B9 \/\* Profile \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
      '$1'
    );

    // PRODUCT_NAMEも削除（xcconfigで設定するため）
    projectContent = projectContent.replace(
      /(97C147061CF9000F007C117D \/\* Debug \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_NAME = [^;]+;/g,
      '$1'
    );
    projectContent = projectContent.replace(
      /(97C147071CF9000F007C117D \/\* Release \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_NAME = [^;]+;/g,
      '$1'
    );
    projectContent = projectContent.replace(
      /(249021D4217E4FDB00AE95B9 \/\* Profile \*\/ = \{[^}]*buildSettings = \{[^}]*)\n\s*PRODUCT_NAME = [^;]+;/g,
      '$1'
    );

    fs.writeFileSync(projectPbxprojPath, projectContent);
    console.log(
      '✅ Removed hardcoded PRODUCT_BUNDLE_IDENTIFIER and PRODUCT_NAME from project.pbxproj'
    );
    return projectPbxprojPath;
  } else {
    console.log('⚠️ Xcode project.pbxproj not found, skipping update');
    return null;
  }
}

// XcodeプロジェクトファイルからGoogleService-Info.plistへの直接参照を削除
function removeGoogleServiceInfoPlistReference(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (fs.existsSync(projectPbxprojPath)) {
    let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

    // GoogleService-Info.plistへのすべての参照を削除
    // PBXBuildFile section
    projectContent = projectContent.replace(
      /\t\t[0-9A-F]{24} \/\* GoogleService-Info\.plist in Resources \*\/ = \{isa = PBXBuildFile; fileRef = [0-9A-F]{24} \/\* GoogleService-Info\.plist \*\/; \};\n/g,
      ''
    );

    // PBXFileReference section
    projectContent = projectContent.replace(
      /\t\t[0-9A-F]{24} \/\* GoogleService-Info\.plist \*\/ = \{isa = PBXFileReference; [^}]+\};\n/g,
      ''
    );

    // グループ内の参照
    projectContent = projectContent.replace(
      /\t\t\t\t[0-9A-F]{24} \/\* GoogleService-Info\.plist \*\/,\n/g,
      ''
    );

    // Resourcesフェーズ内の参照
    projectContent = projectContent.replace(
      /\t\t\t\t[0-9A-F]{24} \/\* GoogleService-Info\.plist in Resources \*\/,\n/g,
      ''
    );

    fs.writeFileSync(projectPbxprojPath, projectContent);
    console.log(
      '✅ Removed GoogleService-Info.plist references from project.pbxproj'
    );
    return projectPbxprojPath;
  } else {
    console.log('⚠️ Xcode project.pbxproj not found, skipping update');
    return null;
  }
}

// Xcodeプロジェクトにビルドスクリプトを自動追加
function addBuildScriptToXcodeProject(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (!fs.existsSync(projectPbxprojPath)) {
    console.log(
      '⚠️ Xcode project.pbxproj not found, skipping build script addition'
    );
    return null;
  }

  let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

  // 既にFirebaseビルドスクリプトが追加されているかチェック
  if (projectContent.includes('Firebase Config Script')) {
    console.log('✅ Firebase build script already exists in Xcode project');
    return projectPbxprojPath;
  }

  // ビルドスクリプトフェーズを追加
  const buildScriptPhase = `
		/* Begin PBXShellScriptBuildPhase section */
		/* Firebase Config Script */
		FIREBASE_CONFIG_SCRIPT_ID /* Firebase Config Script */ = {
			isa = PBXShellScriptBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			inputFileListPaths = (
			);
			inputPaths = (
				"\\"\\$(SRCROOT)/Runner/GoogleService-Info-staging.plist\\"",
				"\\"\\$(SRCROOT)/Runner/GoogleService-Info-production.plist\\"",
			);
			name = "Firebase Config Script";
			outputFileListPaths = (
			);
			outputPaths = (
				"\\"\\$(BUILT_PRODUCTS_DIR)/\\$(PRODUCT_NAME).app/GoogleService-Info.plist\\"",
			);
			runOnlyForDeploymentPostprocessing = 0;
			shellPath = /bin/bash;
			shellScript = "bash \\"\\$\\{SRCROOT\\}/Runner/firebase_config_script.sh\\"\\n";
		};
		/* End PBXShellScriptBuildPhase section */`;

  // 既存のビルドスクリプトフェーズセクションを探す
  const buildPhaseSectionRegex =
    /(\/\* Begin PBXShellScriptBuildPhase section \*\/[\s\S]*?\/\* End PBXShellScriptBuildPhase section \*\/)/;

  if (buildPhaseSectionRegex.test(projectContent)) {
    // 既存のビルドスクリプトフェーズセクションがある場合、その前に追加
    projectContent = projectContent.replace(
      buildPhaseSectionRegex,
      (match) => `${buildScriptPhase}\n\t\t${match}`
    );
  } else {
    // ビルドスクリプトフェーズセクションがない場合、適切な場所に追加
    const targetSectionRegex = /(\/\* Begin PBXNativeTarget section \*\/)/;
    if (targetSectionRegex.test(projectContent)) {
      projectContent = projectContent.replace(
        targetSectionRegex,
        `${buildScriptPhase}\n\n\t\t$1`
      );
    }
  }

  // RunnerターゲットのbuildPhasesにスクリプトを追加（RunnerTestsではなくRunner）
  const nativeTargetSectionRegex =
    /\/\* Begin PBXNativeTarget section \*\/[\s\S]*?\/\* End PBXNativeTarget section \*\//;
  const runnerTargetRegex =
    /(\b[0-9A-F]{24}\b \/\* Runner \*\/ = \{[\s\S]*?buildPhases = \([\s\S]*?\);[\s\S]*?\};)/;

  const nativeSectionMatch = projectContent.match(nativeTargetSectionRegex);
  if (nativeSectionMatch) {
    const nativeSection = nativeSectionMatch[0];
    const updatedNativeSection = nativeSection.replace(
      runnerTargetRegex,
      (runnerBlock) => {
        if (runnerBlock.includes('FIREBASE_CONFIG_SCRIPT_ID')) {
          return runnerBlock; // 既に追加済み
        }
        return runnerBlock.replace(
          /buildPhases = \(/,
          'buildPhases = (\n\t\t\t\tFIREBASE_CONFIG_SCRIPT_ID /* Firebase Config Script */,'
        );
      }
    );
    projectContent = projectContent.replace(
      nativeTargetSectionRegex,
      updatedNativeSection
    );
  }

  // ファイル参照を追加
  const fileRefSectionRegex = /(\/\* Begin PBXFileReference section \*\/)/;
  if (fileRefSectionRegex.test(projectContent)) {
    const fileRef = `
		FIREBASE_CONFIG_SCRIPT_ID /* firebase_config_script.sh */ = {isa = PBXFileReference; lastKnownFileType = text.script.sh; path = firebase_config_script.sh; sourceTree = "<group>"; };`;
    projectContent = projectContent.replace(
      fileRefSectionRegex,
      `${fileRef}\n\n\t\t$1`
    );
  }

  fs.writeFileSync(projectPbxprojPath, projectContent);
  console.log('✅ Firebase build script added to Xcode project');
  return projectPbxprojPath;
}

// iOS設定ファイルの作成
function createIOSConfigs(
  bundleId: string,
  appName: string,
  projectPath: string,
  separateEnvironments: boolean = true,
  useFirebase: boolean = false
) {
  const createdFiles: string[] = [];

  // Podfileの更新
  const podfilePath = updatePodfile(projectPath);
  if (podfilePath) {
    createdFiles.push(podfilePath);
  }

  // Xcodeプロジェクトファイルの更新
  const projectPbxprojPath = updateXcodeProjectDeploymentTarget(projectPath);
  if (projectPbxprojPath) {
    createdFiles.push(projectPbxprojPath);
  }

  // project.pbxprojからハードコードされたバンドルIDとプロダクト名を削除
  const cleanedProjectPath =
    removeHardcodedBundleIdFromXcodeProject(projectPath);
  if (cleanedProjectPath && !createdFiles.includes(cleanedProjectPath)) {
    createdFiles.push(cleanedProjectPath);
  }

  // 環境分離が有効な場合のみ環境別設定ファイルを作成
  if (separateEnvironments) {
    // シンプルで安全なアプローチ:
    // Debug/Release = Staging（開発・テスト用）
    // Profile = Production（本番リリース用）
    const debugConfigPath = path.join(projectPath, 'ios', 'Debug.xcconfig');
    const releaseConfigPath = path.join(projectPath, 'ios', 'Release.xcconfig');
    const profileConfigPath = path.join(projectPath, 'ios', 'Profile.xcconfig');

    // Debug.xcconfig (開発用 - Staging)
    const debugConfig = `#include "Generated.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}.staging
PRODUCT_NAME = ${appName}-STG
ENVIRONMENT = staging`;

    // Release.xcconfig (本番環境 - Production)
    const releaseConfig = `#include "Generated.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}
PRODUCT_NAME = ${appName}
ENVIRONMENT = production`;

    // Profile.xcconfig (本番リリース用 - Production)
    const profileConfig = `#include "Generated.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}
PRODUCT_NAME = ${appName}
ENVIRONMENT = production`;

    fs.writeFileSync(debugConfigPath, debugConfig);
    fs.writeFileSync(releaseConfigPath, releaseConfig);
    fs.writeFileSync(profileConfigPath, profileConfig);

    createdFiles.push(debugConfigPath, releaseConfigPath, profileConfigPath);

    // Flutter配下のxcconfigファイルにカスタム設定をinclude
    const flutterDebugConfigPath = path.join(
      projectPath,
      'ios',
      'Flutter',
      'Debug.xcconfig'
    );
    const flutterReleaseConfigPath = path.join(
      projectPath,
      'ios',
      'Flutter',
      'Release.xcconfig'
    );

    // Flutter/Debug.xcconfigを更新
    if (fs.existsSync(flutterDebugConfigPath)) {
      let flutterDebugContent = fs.readFileSync(flutterDebugConfigPath, 'utf8');
      if (!flutterDebugContent.includes('../Debug.xcconfig')) {
        flutterDebugContent += '\n#include "../Debug.xcconfig"\n';
        fs.writeFileSync(flutterDebugConfigPath, flutterDebugContent);
        createdFiles.push(flutterDebugConfigPath);
        console.log(
          '✅ Updated Flutter/Debug.xcconfig to include custom config'
        );
      }
    }

    // Flutter/Release.xcconfigを更新（Staging設定を読み込む）
    if (fs.existsSync(flutterReleaseConfigPath)) {
      let flutterReleaseContent = fs.readFileSync(
        flutterReleaseConfigPath,
        'utf8'
      );
      if (!flutterReleaseContent.includes('../Release.xcconfig')) {
        flutterReleaseContent += '\n#include "../Release.xcconfig"\n';
        fs.writeFileSync(flutterReleaseConfigPath, flutterReleaseContent);
        createdFiles.push(flutterReleaseConfigPath);
        console.log(
          '✅ Updated Flutter/Release.xcconfig to include custom config'
        );
      }
    }

    // Flutter/Profile.xcconfigを作成または更新（Production設定を読み込む）
    const flutterProfileConfigPath = path.join(
      projectPath,
      'ios',
      'Flutter',
      'Profile.xcconfig'
    );
    
    if (!fs.existsSync(flutterProfileConfigPath)) {
      // Profile.xcconfigを新規作成
      const flutterProfileContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"
#include "Generated.xcconfig"
#include "../Profile.xcconfig"
`;
      fs.writeFileSync(flutterProfileConfigPath, flutterProfileContent);
      createdFiles.push(flutterProfileConfigPath);
      console.log('✅ Created Flutter/Profile.xcconfig with Production config');
    } else {
      // 既存のProfile.xcconfigを更新
      let flutterProfileContent = fs.readFileSync(flutterProfileConfigPath, 'utf8');
      if (!flutterProfileContent.includes('../Profile.xcconfig')) {
        flutterProfileContent += '\n#include "../Profile.xcconfig"\n';
        fs.writeFileSync(flutterProfileConfigPath, flutterProfileContent);
        createdFiles.push(flutterProfileConfigPath);
        console.log('✅ Updated Flutter/Profile.xcconfig to include Production config');
      }
    }

    // Firebaseを使用している場合のみ設定スクリプトを追加
    if (useFirebase) {
      // Firebase設定スクリプトの作成
      const firebaseConfigScriptPath = path.join(
        projectPath,
        'ios',
        'Runner',
        'firebase_config_script.sh'
      );
      const firebaseConfigScriptTemplatePath = getTemplatePath(
        'scripts/firebase_config_script.sh'
      );

      copyTemplateFile(
        firebaseConfigScriptTemplatePath,
        firebaseConfigScriptPath,
        {
          APP_NAME: appName,
        }
      );

      // スクリプトに実行権限を付与
      fs.chmodSync(firebaseConfigScriptPath, 0o755);
      createdFiles.push(firebaseConfigScriptPath);

      // Xcodeプロジェクトにビルドスクリプトを追加
      const updatedProjectPath = addBuildScriptToXcodeProject(projectPath);
      if (updatedProjectPath) {
        createdFiles.push(updatedProjectPath);
      }

      // GoogleService-Info.plistへの直接参照を削除
      // （ビルドスクリプトで動的に生成するため、静的な参照は不要）
      const cleanedPlistRefPath =
        removeGoogleServiceInfoPlistReference(projectPath);
      if (cleanedPlistRefPath && !createdFiles.includes(cleanedPlistRefPath)) {
        createdFiles.push(cleanedPlistRefPath);
      }
    }
  } else {
    // 単一環境の場合、基本的な設定ファイルのみ作成
    const debugConfigPath = path.join(projectPath, 'ios', 'Debug.xcconfig');
    const releaseConfigPath = path.join(projectPath, 'ios', 'Release.xcconfig');

    // Debug.xcconfig
    const debugConfig = `#include "Generated.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}
PRODUCT_NAME = ${appName}`;

    // Release.xcconfig
    const releaseConfig = `#include "Generated.xcconfig"
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}
PRODUCT_NAME = ${appName}`;

    fs.writeFileSync(debugConfigPath, debugConfig);
    fs.writeFileSync(releaseConfigPath, releaseConfig);

    createdFiles.push(debugConfigPath, releaseConfigPath);
  }

  console.log('✅ iOS configuration files created');
  return createdFiles;
}

// Xcodeビルドスクリプトの作成
function createXcodeBuildScripts(projectPath: string, appName: string) {
  const iosPath = path.join(projectPath, 'ios');
  const runnerPath = path.join(iosPath, 'Runner');

  // ビルドスクリプトの内容（Qiita記事の設定に準拠）
  const buildScript =
    '#!/bin/bash\n\n' +
    '# 環境に応じてGoogleService-Info.plistをコピー\n' +
    'if [ "${CONFIGURATION}" = "Debug-Staging" ] || [ "${CONFIGURATION}" = "Release-Staging" ]; then\n' +
    '    echo "Using staging Firebase configuration"\n' +
    '    cp "${SRCROOT}/Runner/GoogleService-Info-staging.plist" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"\n' +
    'elif [ "${CONFIGURATION}" = "Debug-Production" ] || [ "${CONFIGURATION}" = "Release-Production" ]; then\n' +
    '    echo "Using production Firebase configuration"\n' +
    '    cp "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"\n' +
    'else\n' +
    '    echo "Using default Firebase configuration"\n' +
    '    cp "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"\n' +
    'fi\n\n' +
    'echo "Firebase configuration copied for ${CONFIGURATION}"';

  const scriptPath = path.join(runnerPath, 'firebase_config_script.sh');
  fs.writeFileSync(scriptPath, buildScript);
  fs.chmodSync(scriptPath, 0o755); // 実行権限を付与

  console.log('✅ Xcode build script created: firebase_config_script.sh');

  // スクリプトの使用方法をREADMEに追加するための情報を返す
  return {
    scriptPath,
    instructions: `
## Xcodeビルドスクリプトの設定

1. Xcodeでプロジェクトを開く: \`open ios/Runner.xcworkspace\`
2. 「Target」→「Runner」→「Build Phases」を選択
3. 「+」ボタン→「New Run Script Phase」を追加
4. スクリプトに以下を入力:
   \`\`\`bash
   ${scriptPath}
   \`\`\`
5. 「Input Files」に以下を追加:
   - \`\${SRCROOT}/Runner/GoogleService-Info-staging.plist\`
   - \`\${SRCROOT}/Runner/GoogleService-Info-production.plist\`
`,
  };
}

export {
  createIOSConfigs,
  createXcodeBuildScripts,
  updatePodfile,
  updateXcodeProjectDeploymentTarget,
  removeHardcodedBundleIdFromXcodeProject,
  removeGoogleServiceInfoPlistReference,
  addBuildScriptToXcodeProject,
};
