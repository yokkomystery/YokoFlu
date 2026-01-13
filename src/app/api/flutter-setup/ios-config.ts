import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';

const IOS_DEPLOYMENT_TARGET = '14.0';

// Podfileの更新（iOSデプロイメントターゲットを13.0以上に設定）
function updatePodfile(projectPath: string) {
  const podfilePath = path.join(projectPath, 'ios', 'Podfile');

  if (fs.existsSync(podfilePath)) {
    let podfileContent = fs.readFileSync(podfilePath, 'utf8');

    // プラットフォーム設定を最新ターゲットに更新
    podfileContent = podfileContent.replace(
      /platform :ios, ['"]?\d+\.\d+['"]?/,
      `platform :ios, '${IOS_DEPLOYMENT_TARGET}'`
    );

    // post_installブロックを追加または更新
    const postInstallBlock = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    
    # iOS deployment targetを${IOS_DEPLOYMENT_TARGET}以上に設定
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${IOS_DEPLOYMENT_TARGET}'
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
    console.log(
      `✅ Podfile updated with iOS deployment target ${IOS_DEPLOYMENT_TARGET}`
    );
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
      `IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET};`
    );

    fs.writeFileSync(projectPbxprojPath, projectContent);
    console.log(
      `✅ Xcode project.pbxproj updated with iOS deployment target ${IOS_DEPLOYMENT_TARGET}`
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
function addBuildScriptToXcodeProject(
  projectPath: string,
  {
    includeReleaseSetup,
    includeFirebaseScript,
  }: { includeReleaseSetup: boolean; includeFirebaseScript: boolean }
) {
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

  // RunnerターゲットのRun Scriptフェーズを上書きする
  const runScriptRegex =
    /(\/\* Run Script \*\/ = \{[\s\S]*?shellScript = ")([\s\S]*?)(";\n)/;

  const commands: string[] = [
    includeReleaseSetup
      ? 'bash "${SRCROOT}/Runner/setup_release_config.sh"'
      : null,
    '/bin/sh "$FLUTTER_ROOT/packages/flutter_tools/bin/xcode_backend.sh" build',
    includeFirebaseScript
      ? 'bash "${SRCROOT}/Runner/firebase_config_script.sh"'
      : null,
  ].filter(Boolean) as string[];

  if (!runScriptRegex.test(projectContent)) {
    console.log(
      '⚠️ Unable to locate Run Script phase in project.pbxproj, skipping update'
    );
    return null;
  }

  const encodedScript =
    commands
      .map((cmd) => cmd.replace(/"/g, '\\"'))
      .join('\\n') + '\\n';

  projectContent = projectContent.replace(
    runScriptRegex,
    `$1${encodedScript}$3`
  );

  if (projectContent.includes(encodedScript)) {
    console.log('✅ Updated Run Script phase for iOS project');
  }

  fs.writeFileSync(projectPbxprojPath, projectContent);
  console.log('✅ Firebase/Release config scripts wired into Run Script phase');
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
  const replacements = {
    BUNDLE_ID: bundleId,
    APP_NAME: appName,
    APP_NAME_STG: `${appName} STG`,
  };

  const recordCreatedFile = (filePath: string | null) => {
    if (filePath && !createdFiles.includes(filePath)) {
      createdFiles.push(filePath);
    }
  };

  const writeAndTrackFile = (filePath: string, content: string) => {
    fs.writeFileSync(filePath, content);
    recordCreatedFile(filePath);
  };

  // Podfileの更新
  recordCreatedFile(updatePodfile(projectPath));

  // Xcodeプロジェクトファイルの更新
  recordCreatedFile(updateXcodeProjectDeploymentTarget(projectPath));

  // project.pbxprojからハードコードされたバンドルIDとプロダクト名を削除
  recordCreatedFile(removeHardcodedBundleIdFromXcodeProject(projectPath));

  const iosDir = path.join(projectPath, 'ios');
  const flutterDir = path.join(iosDir, 'Flutter');
  const runnerDir = path.join(iosDir, 'Runner');

  if (separateEnvironments) {
    // HimaLinkと同様のStaging/Production設定ファイルを生成
    ['Staging.xcconfig', 'Production.xcconfig', 'Profile.xcconfig'].forEach(
      (fileName) => {
        const templatePath = getTemplatePath(`ios/${fileName}`);
        const targetPath = path.join(iosDir, fileName);
        copyTemplateFile(templatePath, targetPath, replacements);
        recordCreatedFile(targetPath);
      }
    );

    const flutterDebugConfigPath = path.join(flutterDir, 'Debug.xcconfig');
    const flutterReleaseConfigPath = path.join(flutterDir, 'Release.xcconfig');
    const flutterProfileConfigPath = path.join(flutterDir, 'Profile.xcconfig');

    const flutterDebugContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.debug.xcconfig"
#include "Generated.xcconfig"
#include "../Staging.xcconfig"

CODE_SIGN_STYLE = Automatic
CODE_SIGN_IDENTITY = iPhone Developer
`;
    writeAndTrackFile(flutterDebugConfigPath, flutterDebugContent);

    const flutterReleaseContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"
#include "Generated.xcconfig"
// Default to Staging. setup_release_config.sh rewrites this for production when PRODUCTION=true
#include "../Staging.xcconfig"
`;
    writeAndTrackFile(flutterReleaseConfigPath, flutterReleaseContent);

    const flutterProfileContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"
#include "Generated.xcconfig"
// Default to Staging. setup_release_config.sh rewrites this for production when PRODUCTION=true
#include "../Staging.xcconfig"
`;
    writeAndTrackFile(flutterProfileConfigPath, flutterProfileContent);

    // Release設定スクリプトを追加
    const releaseScriptTemplatePath = getTemplatePath(
      'scripts/setup_release_config.sh'
    );
    const releaseScriptPath = path.join(
      runnerDir,
      'setup_release_config.sh'
    );
    if (fs.existsSync(releaseScriptTemplatePath)) {
      copyTemplateFile(
        releaseScriptTemplatePath,
        releaseScriptPath,
        {}
      );
      fs.chmodSync(releaseScriptPath, 0o755);
      recordCreatedFile(releaseScriptPath);
    }
  } else {
    // 単一環境の場合はDebug/Release設定を生成
    ['Debug.xcconfig', 'Release.xcconfig'].forEach((fileName) => {
      const templatePath = getTemplatePath(`ios/${fileName}`);
      const targetPath = path.join(iosDir, fileName);
      copyTemplateFile(templatePath, targetPath, replacements);
      recordCreatedFile(targetPath);
    });

    const profileConfigPath = path.join(iosDir, 'Profile.xcconfig');
    copyTemplateFile(
      getTemplatePath('ios/Release.xcconfig'),
      profileConfigPath,
      replacements
    );
    recordCreatedFile(profileConfigPath);

    const flutterDebugConfigPath = path.join(flutterDir, 'Debug.xcconfig');
    const flutterReleaseConfigPath = path.join(flutterDir, 'Release.xcconfig');
    const flutterProfileConfigPath = path.join(flutterDir, 'Profile.xcconfig');

    const flutterSingleDebug = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.debug.xcconfig"
#include "Generated.xcconfig"
#include "../Debug.xcconfig"
`;
    writeAndTrackFile(flutterDebugConfigPath, flutterSingleDebug);

    const flutterSingleRelease = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"
#include "Generated.xcconfig"
#include "../Release.xcconfig"
`;
    writeAndTrackFile(flutterReleaseConfigPath, flutterSingleRelease);

    const flutterSingleProfile = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"
#include "Generated.xcconfig"
#include "../Profile.xcconfig"
`;
    writeAndTrackFile(flutterProfileConfigPath, flutterSingleProfile);
  }

  if (useFirebase) {
    const firebaseConfigScriptPath = path.join(
      runnerDir,
      'firebase_config_script.sh'
    );
    copyTemplateFile(
      getTemplatePath('scripts/firebase_config_script.sh'),
      firebaseConfigScriptPath,
      {
        APP_NAME: appName,
      }
    );
    fs.chmodSync(firebaseConfigScriptPath, 0o755);
    recordCreatedFile(firebaseConfigScriptPath);

    // GoogleService-Info.plistへの静的参照を削除（スクリプトで配置するため）
    recordCreatedFile(removeGoogleServiceInfoPlistReference(projectPath));
  }

  if (separateEnvironments || useFirebase) {
    recordCreatedFile(
      addBuildScriptToXcodeProject(projectPath, {
        includeReleaseSetup: separateEnvironments,
        includeFirebaseScript: useFirebase,
      })
    );
  }

  // Info.plistをテンプレートからコピー（$(DISPLAY_NAME)を使用）
  const infoPlistPath = path.join(runnerDir, 'Info.plist');
  const infoPlistTemplatePath = getTemplatePath('ios/Info.plist');
  if (fs.existsSync(infoPlistTemplatePath)) {
    copyTemplateFile(infoPlistTemplatePath, infoPlistPath, replacements);
    recordCreatedFile(infoPlistPath);
  }

  console.log('✅ iOS configuration files created');
  return createdFiles;
}

export {
  createIOSConfigs,
  updatePodfile,
  updateXcodeProjectDeploymentTarget,
  removeHardcodedBundleIdFromXcodeProject,
  removeGoogleServiceInfoPlistReference,
  addBuildScriptToXcodeProject,
};
