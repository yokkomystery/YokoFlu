import os from 'os';
import path from 'path';

/**
 * シェルメタ文字のパターン
 * exec() でシェル経由実行される際にコマンドインジェクションを引き起こす文字を検出
 */
const SHELL_META_CHARS = /[;|&`$()><'"\\!\n\r]/;

/**
 * 文字列にシェルメタ文字が含まれているかチェック
 */
export function containsShellMetaCharacters(input: string): boolean {
  return SHELL_META_CHARS.test(input);
}

/**
 * シェルメタ文字のパターン（グローバル版、置換用）
 */
const SHELL_META_CHARS_GLOBAL = /[;|&`$()><'"\\!\n\r]/g;

/**
 * シェルメタ文字を除去してサニタイズ（ログ出力用など、バリデーションではなく除去が必要な場合）
 */
export function sanitizeForShell(input: string): string {
  return input.replace(SHELL_META_CHARS_GLOBAL, '');
}

interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * アプリ名のバリデーション
 * - 1～64文字
 * - シェルメタ文字を含まない
 */
export function validateAppName(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { valid: false, sanitized: '', error: 'アプリ名は必須です' };
  }
  if (input.length > 64) {
    return {
      valid: false,
      sanitized: '',
      error: 'アプリ名は64文字以内で入力してください',
    };
  }
  if (containsShellMetaCharacters(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'アプリ名に使用できない文字が含まれています',
    };
  }
  return { valid: true, sanitized: input };
}

/**
 * Bundle ID のバリデーション
 * - 形式: com.example.app（ドット区切り、各セグメントは小文字英数字とアンダースコア）
 * - 少なくとも2セグメント必要
 */
const BUNDLE_ID_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export function validateBundleId(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { valid: false, sanitized: '', error: 'Bundle IDは必須です' };
  }
  if (containsShellMetaCharacters(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'Bundle IDに使用できない文字が含まれています',
    };
  }
  if (!BUNDLE_ID_PATTERN.test(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'Bundle IDは正しい形式で入力してください（例：com.example.app）',
    };
  }
  return { valid: true, sanitized: input };
}

/**
 * パッケージ名のバリデーション（Bundle IDと同じ形式）
 */
export function validatePackageName(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { valid: false, sanitized: '', error: 'パッケージ名は必須です' };
  }
  if (containsShellMetaCharacters(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'パッケージ名に使用できない文字が含まれています',
    };
  }
  if (!BUNDLE_ID_PATTERN.test(input)) {
    return {
      valid: false,
      sanitized: '',
      error:
        'パッケージ名は正しい形式で入力してください（例：com.example.app）',
    };
  }
  return { valid: true, sanitized: input };
}

/**
 * 出力パスのバリデーション
 * - 空でない
 * - パストラバーサル（..）を含まない
 * - シェルメタ文字を含まない
 * - ~ はホームディレクトリに展開
 */
export function validateOutputPath(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { valid: false, sanitized: '', error: '出力パスは必須です' };
  }

  // ~ をホームディレクトリに展開
  let resolved = input;
  if (resolved.startsWith('~/') || resolved === '~') {
    resolved = path.join(os.homedir(), resolved.slice(1));
  }

  // シェルメタ文字チェック（パス区切り文字は許可するため、展開後の値で検証）
  if (containsShellMetaCharacters(resolved)) {
    return {
      valid: false,
      sanitized: '',
      error: '出力パスに使用できない文字が含まれています',
    };
  }

  // パストラバーサル検出
  const normalized = path.normalize(resolved);
  if (resolved.includes('..') || normalized.includes('..')) {
    return {
      valid: false,
      sanitized: '',
      error: '出力パスにディレクトリトラバーサル（..）は使用できません',
    };
  }

  return { valid: true, sanitized: resolved };
}

/**
 * Firebase プロジェクトIDのバリデーション
 * - 小文字、数字、ハイフンのみ
 * - 先頭は小文字
 */
const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export function validateProjectId(input: string): ValidationResult {
  if (!input || input.length === 0) {
    return { valid: false, sanitized: '', error: 'プロジェクトIDは必須です' };
  }
  if (containsShellMetaCharacters(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'プロジェクトIDに使用できない文字が含まれています',
    };
  }
  if (!PROJECT_ID_PATTERN.test(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'プロジェクトIDは小文字、数字、ハイフンのみ使用可能です',
    };
  }
  return { valid: true, sanitized: input };
}
