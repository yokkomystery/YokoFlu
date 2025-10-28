import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const FLUTTER_LAUNCHER_VERSION = '^0.13.1';

export function prepareAppIconAssets(
  projectPath: string,
  iconBase64: string
): string {
  // assetsディレクトリを作成
  const assetsDir = path.join(projectPath, 'assets', 'icons');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Base64画像をデコードして保存
  const iconPath = path.join(assetsDir, 'app_icon.png');
  const base64Data = iconBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(iconPath, buffer);
  console.log(`✅ アイコン画像を保存しました: ${iconPath}`);

  // pubspec.yamlの更新
  const pubspecPath = path.join(projectPath, 'pubspec.yaml');
  let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');

  // dev_dependenciesにflutter_launcher_iconsを追加
  if (!pubspecContent.includes('flutter_launcher_icons:')) {
    pubspecContent = pubspecContent.replace(
      /(flutter_lints: \^[0-9.]+)/,
      `$1\n  flutter_launcher_icons: ${FLUTTER_LAUNCHER_VERSION}`
    );
    fs.writeFileSync(pubspecPath, pubspecContent);
    console.log('✅ dev_dependenciesにflutter_launcher_iconsを追加しました');
  }

  // flutter_launcher_icons設定を追加
  pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
  const iconConfigPattern = /^flutter_launcher_icons:/m;
  if (!iconConfigPattern.test(pubspecContent)) {
    const iconConfig = `
# App Icon Configuration
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#FFFFFF"
  adaptive_icon_foreground: "assets/icons/app_icon.png"
  remove_alpha_ios: true
`;
    pubspecContent += iconConfig;
    fs.writeFileSync(pubspecPath, pubspecContent);
    console.log('✅ flutter_launcher_icons設定を追加しました');
  }

  // assetsセクションに追加
  pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
  if (!pubspecContent.includes('assets/icons/app_icon.png')) {
    const materialDesignMatch = pubspecContent.match(
      /(\s+)(uses-material-design:\s+true)/
    );

    if (materialDesignMatch) {
      const indent = materialDesignMatch[1];
      const assetsBlock = `${materialDesignMatch[0]}\n${indent}assets:\n${indent}  - assets/icons/app_icon.png`;
      pubspecContent = pubspecContent.replace(
        materialDesignMatch[0],
        assetsBlock
      );
      fs.writeFileSync(pubspecPath, pubspecContent);
      console.log('✅ pubspec.yamlにアイコンのassets設定を追加しました');
    } else {
      console.warn('⚠️ uses-material-design: trueが見つかりませんでした');
    }
  }

  return iconPath;
}

export async function runAppIconGenerator(projectPath: string) {
  console.log('🎨 flutter_launcher_icons を実行中...');
  const result = await execAsync(
    `cd ${projectPath} && dart run flutter_launcher_icons`
  );
  console.log('✅ アイコン生成完了:', result.stdout);
}
