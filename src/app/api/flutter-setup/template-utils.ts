import fs from 'fs';
import path from 'path';

// テンプレートファイルをコピーして置換する関数
export function copyTemplateFile(
  templatePath: string,
  targetPath: string,
  replacements: Record<string, string>,
  conditions?: Record<string, boolean>
): void {
  if (!fs.existsSync(templatePath)) {
    console.log(`⚠️ テンプレートファイルが見つかりません: ${templatePath}`);
    return;
  }

  // テンプレートファイルを読み込み
  let content = fs.readFileSync(templatePath, 'utf8');

  // 条件付きブロックの処理（{{#condition}} / {{^condition}}）
  if (conditions) {
    Object.entries(conditions).forEach(([condition, value]) => {
      const sectionRegex = new RegExp(
        `{{([#^])${condition}}}([\\s\\S]*?){{/${condition}}}`,
        'g'
      );
      content = content.replace(sectionRegex, (_, indicator, inner) => {
        const isPositive = indicator === '#';
        const shouldKeep = isPositive ? value : !value;
        return shouldKeep ? inner : '';
      });
    });
  }

  // 置換を実行
  Object.entries(replacements).forEach(([key, value]) => {
    // 複数のプレースホルダー形式に対応
    const placeholders = [
      `{{${key}}}`, // 従来の形式
      `__${key}__`, // 新しい形式（YAMLフォーマッター対策）
    ];

    placeholders.forEach((placeholder) => {
      if (content.includes(placeholder)) {
        console.log(`🔄 プレースホルダー置換: ${placeholder} → ${value}`);
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }
    });
  });

  // ディレクトリを作成
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // ファイルを書き込み
  fs.writeFileSync(targetPath, content);
  console.log(`✅ テンプレートファイルをコピーしました: ${targetPath}`);
  console.log(`📄 書き込まれた内容（最初の200文字）:`);
  console.log(content.substring(0, 200) + '...');
}

// テンプレートディレクトリをコピーする関数
export function copyTemplateDirectory(
  templateDir: string,
  targetDir: string,
  replacements: Record<string, string>
): string[] {
  const createdFiles: string[] = [];

  if (!fs.existsSync(templateDir)) {
    console.log(`⚠️ テンプレートディレクトリが見つかりません: ${templateDir}`);
    return createdFiles;
  }

  function copyDirectoryRecursive(src: string, dest: string): void {
    const items = fs.readdirSync(src);

    items.forEach((item) => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        // ディレクトリの場合、再帰的にコピー
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDirectoryRecursive(srcPath, destPath);
      } else {
        // ファイルの場合、テンプレートとしてコピー
        copyTemplateFile(srcPath, destPath, replacements);
        createdFiles.push(destPath);
      }
    });
  }

  copyDirectoryRecursive(templateDir, targetDir);
  return createdFiles;
}

// テンプレートファイルのパスを取得する関数
export function getTemplatePath(templateName: string): string {
  return path.join(process.cwd(), 'src', 'templates', 'flutter', templateName);
}

// Firebase使用状況に応じてpubspec.yamlテンプレートのパスを取得する関数
export function getPubspecTemplatePath(useFirebase: boolean): string {
  const templateName = useFirebase
    ? 'pubspec.yaml'
    : 'pubspec_no_firebase.yaml';
  return getTemplatePath(templateName);
}
