import fs from 'fs';
import path from 'path';
import { copyTemplateFile, getTemplatePath } from './template-utils';

const IOS_DEPLOYMENT_TARGET = '14.0';

// ユニークなXcode用IDを生成（24文字の16進数）
function generateXcodeId(): string {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

// Flavor用のBuild Configurationsを追加
function addFlavorBuildConfigurations(projectPath: string): boolean {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (!fs.existsSync(projectPbxprojPath)) {
    console.log('⚠️ project.pbxproj not found');
    return false;
  }

  let content = fs.readFileSync(projectPbxprojPath, 'utf8');

  // すでにFlavor設定がある場合はスキップ
  if (content.includes('Debug-staging') || content.includes('Debug-production')) {
    console.log('ℹ️ Flavor configurations already exist');
    return true;
  }

  const flavors = ['staging', 'production'];
  const baseConfigs = ['Debug', 'Release', 'Profile'];

  // 既存のConfiguration IDを取得
  const projectConfigListMatch = content.match(
    /97C146E91CF9000F007C117D \/\* Build configuration list for PBXProject "Runner" \*\/ = \{[\s\S]*?buildConfigurations = \(([\s\S]*?)\);/
  );
  const runnerConfigListMatch = content.match(
    /97C147051CF9000F007C117D \/\* Build configuration list for PBXNativeTarget "Runner" \*\/ = \{[\s\S]*?buildConfigurations = \(([\s\S]*?)\);/
  );
  const testsConfigListMatch = content.match(
    /331C8087294A63A400263BE5 \/\* Build configuration list for PBXNativeTarget "RunnerTests" \*\/ = \{[\s\S]*?buildConfigurations = \(([\s\S]*?)\);/
  );

  if (!projectConfigListMatch || !runnerConfigListMatch) {
    console.log('⚠️ Could not find configuration lists');
    return false;
  }

  // 新しいxcconfigファイル用のIDを生成
  const xcconfigFileIds: { [key: string]: string } = {};
  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      xcconfigFileIds[configName] = generateXcodeId();
    }
  }

  // PBXFileReferenceセクションに新しいxcconfigファイルを追加
  let fileReferences = '';
  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      const id = xcconfigFileIds[configName];
      fileReferences += `\t\t${id} /* ${configName}.xcconfig */ = {isa = PBXFileReference; lastKnownFileType = text.xcconfig; name = "${configName}.xcconfig"; path = "Flutter/${configName}.xcconfig"; sourceTree = "<group>"; };\n`;
    }
  }

  // PBXFileReferenceセクションの末尾に追加
  content = content.replace(
    '/* End PBXFileReference section */',
    fileReferences + '/* End PBXFileReference section */'
  );

  // Flutterグループにファイル参照を追加
  const flutterGroupMatch = content.match(
    /(9740EEB11CF90186004384FC \/\* Flutter \*\/ = \{[\s\S]*?children = \()([\s\S]*?)(\);[\s\S]*?name = Flutter;)/
  );
  if (flutterGroupMatch) {
    let newChildren = flutterGroupMatch[2];
    for (const flavor of flavors) {
      for (const base of baseConfigs) {
        const configName = `${base}-${flavor}`;
        const id = xcconfigFileIds[configName];
        newChildren += `\n\t\t\t\t${id} /* ${configName}.xcconfig */,`;
      }
    }
    content = content.replace(
      flutterGroupMatch[0],
      flutterGroupMatch[1] + newChildren + flutterGroupMatch[3]
    );
  }

  // 新しいConfiguration IDを生成
  const newConfigIds: {
    [key: string]: { project: string; runner: string; tests: string };
  } = {};

  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      newConfigIds[configName] = {
        project: generateXcodeId(),
        runner: generateXcodeId(),
        tests: generateXcodeId(),
      };
    }
  }

  // 既存のDebug/Release/Profile設定を参照して新しい設定を生成
  const projectDebugMatch = content.match(
    /(97C147031CF9000F007C117D \/\* Debug \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Debug;[\s\S]*?\};)/
  );
  const projectReleaseMatch = content.match(
    /(97C147041CF9000F007C117D \/\* Release \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Release;[\s\S]*?\};)/
  );
  const projectProfileMatch = content.match(
    /(249021D3217E4FDB00AE95B9 \/\* Profile \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Profile;[\s\S]*?\};)/
  );

  const runnerDebugMatch = content.match(
    /(97C147061CF9000F007C117D \/\* Debug \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?baseConfigurationReference[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Debug;[\s\S]*?\};)/
  );
  const runnerReleaseMatch = content.match(
    /(97C147071CF9000F007C117D \/\* Release \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?baseConfigurationReference[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Release;[\s\S]*?\};)/
  );
  const runnerProfileMatch = content.match(
    /(249021D4217E4FDB00AE95B9 \/\* Profile \*\/ = \{[\s\S]*?isa = XCBuildConfiguration;[\s\S]*?baseConfigurationReference[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?name = Profile;[\s\S]*?\};)/
  );

  if (!projectDebugMatch || !projectReleaseMatch || !runnerDebugMatch || !runnerReleaseMatch) {
    console.log('⚠️ Could not find base configuration sections');
    return false;
  }

  // 新しいXCBuildConfiguration entriesを生成
  let newConfigurations = '';

  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      const ids = newConfigIds[configName];
      const xcconfigId = xcconfigFileIds[configName];

      // Project level config
      let projectBase = '';
      if (base === 'Debug' && projectDebugMatch) {
        projectBase = projectDebugMatch[1];
      } else if (base === 'Release' && projectReleaseMatch) {
        projectBase = projectReleaseMatch[1];
      } else if (base === 'Profile' && projectProfileMatch) {
        projectBase = projectProfileMatch[1];
      }

      if (projectBase) {
        const projectConfig = projectBase
          .replace(/[0-9A-F]{24} \/\* \w+ \*\//, `${ids.project} /* ${configName} */`)
          .replace(/name = \w+;/, `name = "${configName}";`);
        newConfigurations += '\t\t' + projectConfig + '\n';
      }

      // Runner target config (with xcconfig reference pointing to flavor-specific file)
      let runnerBase = '';
      if (base === 'Debug' && runnerDebugMatch) {
        runnerBase = runnerDebugMatch[1];
      } else if (base === 'Release' && runnerReleaseMatch) {
        runnerBase = runnerReleaseMatch[1];
      } else if (base === 'Profile' && runnerProfileMatch) {
        runnerBase = runnerProfileMatch[1];
      }

      if (runnerBase) {
        // Update baseConfigurationReference to point to flavor-specific xcconfig
        let runnerConfig = runnerBase
          .replace(/[0-9A-F]{24} \/\* \w+ \*\//, `${ids.runner} /* ${configName} */`)
          .replace(/name = \w+;/, `name = "${configName}";`)
          .replace(
            /baseConfigurationReference = [0-9A-F]{24} \/\* \w+\.xcconfig \*\/;/,
            `baseConfigurationReference = ${xcconfigId} /* ${configName}.xcconfig */;`
          );
        newConfigurations += '\t\t' + runnerConfig + '\n';
      }

      // RunnerTests config
      const testsConfig = `${ids.tests} /* ${configName} */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tBUNDLE_LOADER = "$(TEST_HOST)";
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = 1;
\t\t\t\tGENERATE_INFOPLIST_FILE = YES;
\t\t\t\tMARKETING_VERSION = 1.0;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = com.example.sampleapp.RunnerTests;
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTEST_HOST = "$(BUILT_PRODUCTS_DIR)/Runner.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/Runner";
\t\t\t};
\t\t\tname = "${configName}";
\t\t};`;
      newConfigurations += '\t\t' + testsConfig + '\n';
    }
  }

  // XCBuildConfiguration sectionに新しい設定を追加
  content = content.replace(
    '/* End XCBuildConfiguration section */',
    newConfigurations + '/* End XCBuildConfiguration section */'
  );

  // Build configuration listsを更新
  const projectConfigList = projectConfigListMatch[1];
  let newProjectConfigList = projectConfigList;
  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      const id = newConfigIds[configName].project;
      newProjectConfigList += `\n\t\t\t\t${id} /* ${configName} */,`;
    }
  }
  content = content.replace(projectConfigList, newProjectConfigList);

  const runnerConfigList = runnerConfigListMatch[1];
  let newRunnerConfigList = runnerConfigList;
  for (const flavor of flavors) {
    for (const base of baseConfigs) {
      const configName = `${base}-${flavor}`;
      const id = newConfigIds[configName].runner;
      newRunnerConfigList += `\n\t\t\t\t${id} /* ${configName} */,`;
    }
  }
  content = content.replace(runnerConfigList, newRunnerConfigList);

  if (testsConfigListMatch) {
    const testsConfigList = testsConfigListMatch[1];
    let newTestsConfigList = testsConfigList;
    for (const flavor of flavors) {
      for (const base of baseConfigs) {
        const configName = `${base}-${flavor}`;
        const id = newConfigIds[configName].tests;
        newTestsConfigList += `\n\t\t\t\t${id} /* ${configName} */,`;
      }
    }
    content = content.replace(testsConfigList, newTestsConfigList);
  }

  fs.writeFileSync(projectPbxprojPath, content);
  console.log('✅ Added flavor build configurations to project.pbxproj');
  return true;
}

// Flavor用のXcode Schemeを作成
function createFlavorSchemes(projectPath: string, appName: string): string[] {
  const schemesDir = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'xcshareddata',
    'xcschemes'
  );

  fs.mkdirSync(schemesDir, { recursive: true });

  const createdFiles: string[] = [];
  const flavors = ['staging', 'production'];

  for (const flavor of flavors) {
    const schemeContent = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1510"
   version = "1.3">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "97C146ED1CF9000F007C117D"
               BuildableName = "Runner.app"
               BlueprintName = "Runner"
               ReferencedContainer = "container:Runner.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug-${flavor}"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      customLLDBInitFile = "$(SRCROOT)/Flutter/ephemeral/flutter_lldbinit"
      shouldUseLaunchSchemeArgsEnv = "YES">
      <MacroExpansion>
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "97C146ED1CF9000F007C117D"
            BuildableName = "Runner.app"
            BlueprintName = "Runner"
            ReferencedContainer = "container:Runner.xcodeproj">
         </BuildableReference>
      </MacroExpansion>
      <Testables>
         <TestableReference
            skipped = "NO"
            parallelizable = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "331C8080294A63A400263BE5"
               BuildableName = "RunnerTests.xctest"
               BlueprintName = "RunnerTests"
               ReferencedContainer = "container:Runner.xcodeproj">
            </BuildableReference>
         </TestableReference>
      </Testables>
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug-${flavor}"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      customLLDBInitFile = "$(SRCROOT)/Flutter/ephemeral/flutter_lldbinit"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      enableGPUValidationMode = "1"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "97C146ED1CF9000F007C117D"
            BuildableName = "Runner.app"
            BlueprintName = "Runner"
            ReferencedContainer = "container:Runner.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "Profile-${flavor}"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "97C146ED1CF9000F007C117D"
            BuildableName = "Runner.app"
            BlueprintName = "Runner"
            ReferencedContainer = "container:Runner.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "Debug-${flavor}">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "Release-${flavor}"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>`;

    const schemePath = path.join(schemesDir, `${flavor}.xcscheme`);
    fs.writeFileSync(schemePath, schemeContent);
    createdFiles.push(schemePath);
    console.log(`✅ Created ${flavor}.xcscheme`);
  }

  return createdFiles;
}

// Podfileの更新（iOSデプロイメントターゲットとFlavor設定）
function updatePodfile(projectPath: string, separateEnvironments: boolean = false) {
  const podfilePath = path.join(projectPath, 'ios', 'Podfile');

  if (fs.existsSync(podfilePath)) {
    let podfileContent = fs.readFileSync(podfilePath, 'utf8');

    // プラットフォーム設定を最新ターゲットに更新
    podfileContent = podfileContent.replace(
      /platform :ios, ['"]?\d+\.\d+['"]?/,
      `platform :ios, '${IOS_DEPLOYMENT_TARGET}'`
    );

    // Flavor用のproject configuration mappingを追加
    if (separateEnvironments && !podfileContent.includes('Debug-staging')) {
      const projectConfigMapping = `
project 'Runner', {
  'Debug' => :debug,
  'Debug-staging' => :debug,
  'Debug-production' => :debug,
  'Profile' => :release,
  'Profile-staging' => :release,
  'Profile-production' => :release,
  'Release' => :release,
  'Release-staging' => :release,
  'Release-production' => :release,
}
`;
      // platform行の後に追加
      podfileContent = podfileContent.replace(
        /(platform :ios, '[^']+'\n)/,
        `$1${projectConfigMapping}`
      );
    }

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

// XcodeプロジェクトファイルのターゲットデバイスをiPhoneのみに設定
function updateTargetedDeviceFamilyToIphoneOnly(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (fs.existsSync(projectPbxprojPath)) {
    let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

    const originalContent = projectContent;
    projectContent = projectContent.replace(
      /TARGETED_DEVICE_FAMILY = "1,2";/g,
      'TARGETED_DEVICE_FAMILY = "1";'
    );
    projectContent = projectContent.replace(
      /TARGETED_DEVICE_FAMILY = 1,2;/g,
      'TARGETED_DEVICE_FAMILY = "1";'
    );

    if (projectContent !== originalContent) {
      fs.writeFileSync(projectPbxprojPath, projectContent);
      console.log('✅ Updated TARGETED_DEVICE_FAMILY to iPhone only');
    } else {
      console.log('ℹ️ No TARGETED_DEVICE_FAMILY updates needed');
    }
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

// XcodeプロジェクトファイルからCODE_SIGN_IDENTITYの固定値を削除
function removeCodeSignIdentityFromXcodeProject(projectPath: string) {
  const projectPbxprojPath = path.join(
    projectPath,
    'ios',
    'Runner.xcodeproj',
    'project.pbxproj'
  );

  if (fs.existsSync(projectPbxprojPath)) {
    let projectContent = fs.readFileSync(projectPbxprojPath, 'utf8');

    const originalContent = projectContent;
    projectContent = projectContent.replace(
      /^\s*"?CODE_SIGN_IDENTITY(\[sdk=iphoneos\*\])?"?\s*=\s*".*";\n/gm,
      ''
    );

    if (projectContent !== originalContent) {
      fs.writeFileSync(projectPbxprojPath, projectContent);
      console.log('✅ Removed CODE_SIGN_IDENTITY overrides from project.pbxproj');
    } else {
      console.log('ℹ️ No CODE_SIGN_IDENTITY overrides found in project.pbxproj');
    }
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

  // Podfileの更新（Flavor設定も含む）
  recordCreatedFile(updatePodfile(projectPath, separateEnvironments));

  // Xcodeプロジェクトファイルの更新
  recordCreatedFile(updateXcodeProjectDeploymentTarget(projectPath));
  // ターゲットデバイスをiPhoneのみに設定
  recordCreatedFile(updateTargetedDeviceFamilyToIphoneOnly(projectPath));

  // project.pbxprojからハードコードされたバンドルIDとプロダクト名を削除
  recordCreatedFile(removeHardcodedBundleIdFromXcodeProject(projectPath));
  // project.pbxprojからCODE_SIGN_IDENTITYの固定値を削除
  recordCreatedFile(removeCodeSignIdentityFromXcodeProject(projectPath));

  const iosDir = path.join(projectPath, 'ios');
  const flutterDir = path.join(iosDir, 'Flutter');
  const runnerDir = path.join(iosDir, 'Runner');

  if (separateEnvironments) {
    // 標準的なFlutter Flavor方式：Build ConfigurationsとSchemesを使用
    // 1. Build Configurationsを追加（Debug-staging, Release-staging, etc.）
    addFlavorBuildConfigurations(projectPath);

    // 2. Xcode Schemesを作成（staging, production）
    const schemeFiles = createFlavorSchemes(projectPath, appName);
    schemeFiles.forEach((f) => recordCreatedFile(f));

    // 3. Flavor用のxcconfigファイルを生成
    // Staging用
    const stagingConfigPath = path.join(iosDir, 'Staging.xcconfig');
    const stagingConfigContent = `// Staging configuration
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}.staging
PRODUCT_NAME = ${appName} STG
DISPLAY_NAME = ${appName} STG
CODE_SIGN_STYLE = Automatic
DEVELOPMENT_TEAM =
PROVISIONING_PROFILE_SPECIFIER =

// Build settings
SWIFT_VERSION = 5.0
IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET}
ENABLE_BITCODE = NO
`;
    writeAndTrackFile(stagingConfigPath, stagingConfigContent);

    // Production用
    const productionConfigPath = path.join(iosDir, 'Production.xcconfig');
    const productionConfigContent = `// Production configuration
PRODUCT_BUNDLE_IDENTIFIER = ${bundleId}
PRODUCT_NAME = ${appName}
DISPLAY_NAME = ${appName}
CODE_SIGN_STYLE = Automatic
DEVELOPMENT_TEAM =
PROVISIONING_PROFILE_SPECIFIER =

// Build settings
SWIFT_VERSION = 5.0
IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET}
ENABLE_BITCODE = NO
`;
    writeAndTrackFile(productionConfigPath, productionConfigContent);

    // 4. Flutter xcconfigファイルを更新（各Flavor用）
    // Debug（デフォルトでStagingを使用）
    const flutterDebugContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.debug.xcconfig"
#include "Generated.xcconfig"
#include "../Staging.xcconfig"
`;
    writeAndTrackFile(path.join(flutterDir, 'Debug.xcconfig'), flutterDebugContent);

    // Release（デフォルトでStagingを使用）
    const flutterReleaseContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"
#include "Generated.xcconfig"
#include "../Staging.xcconfig"
`;
    writeAndTrackFile(path.join(flutterDir, 'Release.xcconfig'), flutterReleaseContent);

    // Profile
    const flutterProfileContent = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"
#include "Generated.xcconfig"
#include "../Staging.xcconfig"
`;
    writeAndTrackFile(path.join(flutterDir, 'Profile.xcconfig'), flutterProfileContent);

    // 5. Flavor別のxcconfigファイル（Build Configuration用）
    const flavors = ['staging', 'production'];
    const bases = ['Debug', 'Release', 'Profile'];

    for (const flavor of flavors) {
      const flavorConfig = flavor === 'staging' ? 'Staging.xcconfig' : 'Production.xcconfig';
      for (const base of bases) {
        const configName = `${base}-${flavor}`;
        const podsConfig = base === 'Debug' ? 'debug' : base === 'Release' ? 'release' : 'profile';
        const content = `#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.${podsConfig}.xcconfig"
#include "Generated.xcconfig"
#include "../${flavorConfig}"
`;
        writeAndTrackFile(path.join(flutterDir, `${configName}.xcconfig`), content);
      }
    }

    console.log('✅ Standard Flutter flavor setup complete');
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

    // Firebaseスクリプトのみをビルドスクリプトに追加（標準flavor方式ではrelease setupスクリプトは不要）
    recordCreatedFile(
      addBuildScriptToXcodeProject(projectPath, {
        includeReleaseSetup: false,
        includeFirebaseScript: true,
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
