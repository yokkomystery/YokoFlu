import fs from "fs";
import path from "path";
import { copyTemplateFile, getTemplatePath } from "./template-utils";

// テーマプロバイダーの作成
export function createThemeProvider(appName: string, projectPath: string) {
  const themeProviderPath = path.join(
    projectPath,
    "lib",
    "features",
    "profile",
    "providers",
    "theme_provider.dart"
  );

  // テンプレートファイルをコピー
  const templatePath = getTemplatePath("theme_provider.dart");
  copyTemplateFile(templatePath, themeProviderPath, {
    APP_NAME: appName,
  });

  console.log("✅ テーマプロバイダーを作成しました");
  return themeProviderPath;
}
