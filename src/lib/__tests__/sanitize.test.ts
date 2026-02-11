import { describe, it, expect } from 'vitest';
import {
  validateAppName,
  validateBundleId,
  validatePackageName,
  validateOutputPath,
  validateProjectId,
  sanitizeForShell,
  containsShellMetaCharacters,
} from '../sanitize';

describe('containsShellMetaCharacters', () => {
  it('通常の文字列はfalseを返す', () => {
    expect(containsShellMetaCharacters('hello')).toBe(false);
    expect(containsShellMetaCharacters('my_app')).toBe(false);
    expect(containsShellMetaCharacters('com.example.app')).toBe(false);
    expect(containsShellMetaCharacters('/Users/yokko/projects')).toBe(false);
  });

  it('シェルメタ文字を含む場合はtrueを返す', () => {
    expect(containsShellMetaCharacters('; rm -rf /')).toBe(true);
    expect(containsShellMetaCharacters('hello && echo pwned')).toBe(true);
    expect(containsShellMetaCharacters('test | cat /etc/passwd')).toBe(true);
    expect(containsShellMetaCharacters('$(malicious)')).toBe(true);
    expect(containsShellMetaCharacters('`whoami`')).toBe(true);
    expect(containsShellMetaCharacters('test > /dev/null')).toBe(true);
    expect(containsShellMetaCharacters('test < input')).toBe(true);
    expect(containsShellMetaCharacters("test' OR 1=1")).toBe(true);
    expect(containsShellMetaCharacters('test" OR 1=1')).toBe(true);
    expect(containsShellMetaCharacters('test\nwhoami')).toBe(true);
  });
});

describe('sanitizeForShell', () => {
  it('安全な文字列はそのまま返す', () => {
    expect(sanitizeForShell('hello')).toBe('hello');
    expect(sanitizeForShell('my_app_123')).toBe('my_app_123');
  });

  it('危険な文字を除去する', () => {
    expect(sanitizeForShell('hello;world')).toBe('helloworld');
    expect(sanitizeForShell('test$(cmd)')).toBe('testcmd');
  });
});

describe('validateAppName', () => {
  it('有効なアプリ名を受け入れる', () => {
    expect(validateAppName('my_app')).toEqual({
      valid: true,
      sanitized: 'my_app',
    });
    expect(validateAppName('MyApp')).toEqual({
      valid: true,
      sanitized: 'MyApp',
    });
    expect(validateAppName('app123')).toEqual({
      valid: true,
      sanitized: 'app123',
    });
    expect(validateAppName('my-app')).toEqual({
      valid: true,
      sanitized: 'my-app',
    });
    expect(validateAppName('a')).toEqual({ valid: true, sanitized: 'a' });
  });

  it('空文字列を拒否する', () => {
    const result = validateAppName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('シェルメタ文字を含むアプリ名を拒否する', () => {
    const result = validateAppName('app; rm -rf /');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('長すぎるアプリ名を拒否する', () => {
    const result = validateAppName('a'.repeat(65));
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('スペースを含むアプリ名を受け入れる（Flutterプロジェクト名には変換される）', () => {
    const result = validateAppName('My App');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('My App');
  });
});

describe('validateBundleId', () => {
  it('有効なBundle IDを受け入れる', () => {
    expect(validateBundleId('com.example.app')).toEqual({
      valid: true,
      sanitized: 'com.example.app',
    });
    expect(validateBundleId('com.example.my_app')).toEqual({
      valid: true,
      sanitized: 'com.example.my_app',
    });
    expect(validateBundleId('io.github.user.app')).toEqual({
      valid: true,
      sanitized: 'io.github.user.app',
    });
  });

  it('空文字列を拒否する', () => {
    const result = validateBundleId('');
    expect(result.valid).toBe(false);
  });

  it('不正な形式のBundle IDを拒否する', () => {
    expect(validateBundleId('com').valid).toBe(false);
    expect(validateBundleId('.com.example').valid).toBe(false);
    expect(validateBundleId('com..example').valid).toBe(false);
    expect(validateBundleId('com.example.').valid).toBe(false);
  });

  it('シェルメタ文字を含むBundle IDを拒否する', () => {
    expect(validateBundleId('com.example;rm -rf /').valid).toBe(false);
    expect(validateBundleId('com.$(malicious).app').valid).toBe(false);
  });
});

describe('validatePackageName', () => {
  it('有効なパッケージ名を受け入れる', () => {
    expect(validatePackageName('com.example.app')).toEqual({
      valid: true,
      sanitized: 'com.example.app',
    });
  });

  it('不正な形式を拒否する', () => {
    expect(validatePackageName('').valid).toBe(false);
    expect(validatePackageName('com').valid).toBe(false);
    expect(validatePackageName('com.example;hack').valid).toBe(false);
  });
});

describe('validateOutputPath', () => {
  it('有効な絶対パスを受け入れる', () => {
    const result = validateOutputPath('/Users/yokko/projects');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('/Users/yokko/projects');
  });

  it('ホームディレクトリの~を展開する', () => {
    const result = validateOutputPath('~/projects');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toMatch(/^\/.*\/projects$/);
  });

  it('空文字列を拒否する', () => {
    expect(validateOutputPath('').valid).toBe(false);
  });

  it('パストラバーサルを拒否する', () => {
    expect(validateOutputPath('/Users/../etc/passwd').valid).toBe(false);
    expect(validateOutputPath('/Users/yokko/../../etc').valid).toBe(false);
  });

  it('シェルメタ文字を含むパスを拒否する', () => {
    expect(validateOutputPath('/Users/yokko; rm -rf /').valid).toBe(false);
    expect(validateOutputPath('/Users/$(whoami)').valid).toBe(false);
  });
});

describe('validateProjectId', () => {
  it('有効なプロジェクトIDを受け入れる', () => {
    expect(validateProjectId('my-project')).toEqual({
      valid: true,
      sanitized: 'my-project',
    });
    expect(validateProjectId('my-project-123')).toEqual({
      valid: true,
      sanitized: 'my-project-123',
    });
  });

  it('空文字列を拒否する', () => {
    expect(validateProjectId('').valid).toBe(false);
  });

  it('不正な形式を拒否する', () => {
    expect(validateProjectId('My Project').valid).toBe(false);
    expect(validateProjectId('project;hack').valid).toBe(false);
    expect(validateProjectId('project$(cmd)').valid).toBe(false);
  });
});
