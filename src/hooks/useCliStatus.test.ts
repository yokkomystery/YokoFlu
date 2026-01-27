import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCliStatus } from './useCliStatus';

describe('useCliStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('初期状態では全てのCLIがインストールされていない状態', () => {
    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useCliStatus());

    expect(result.current.environmentStatus.flutter.installed).toBe(false);
    expect(result.current.environmentStatus.dart.installed).toBe(false);
    expect(result.current.environmentStatus.firebase.installed).toBe(false);
    expect(result.current.environmentStatus.flutterfire.installed).toBe(false);
  });

  it('APIからCLI状態を取得できる', async () => {
    const mockResponse = {
      flutter: { installed: true, version: '3.24.0' },
      dart: { installed: true, version: '3.5.0' },
      firebase: { installed: true, version: '13.0.0', loggedIn: true },
      flutterfire: { installed: true, version: '1.0.0' },
    };

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useCliStatus());

    await waitFor(() => {
      expect(result.current.environmentStatus.flutter.installed).toBe(true);
    });

    expect(result.current.environmentStatus.flutter.version).toBe('3.24.0');
    expect(result.current.environmentStatus.dart.installed).toBe(true);
    expect(result.current.environmentStatus.firebase.loggedIn).toBe(true);
    expect(result.current.environmentStatusError).toBe(null);
  });

  it('API呼び出しが失敗した場合はエラーメッセージが設定される', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCliStatus());

    await waitFor(() => {
      expect(result.current.environmentStatusError).not.toBe(null);
    });

    expect(result.current.environmentStatusError).toContain(
      'CLI の状態を確認できませんでした'
    );
    expect(result.current.environmentStatus.flutter.installed).toBe(false);
  });

  it('fetchEnvironmentStatusで再取得できる', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        json: async () => ({
          flutter: { installed: false },
        }),
      } as Response)
      .mockResolvedValueOnce({
        json: async () => ({
          flutter: { installed: true, version: '3.24.0' },
        }),
      } as Response);

    const { result } = renderHook(() => useCliStatus());

    // 初回取得を待つ
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // 再取得
    await act(async () => {
      await result.current.fetchEnvironmentStatus();
    });

    expect(result.current.environmentStatus.flutter.installed).toBe(true);
    expect(result.current.environmentStatus.flutter.version).toBe('3.24.0');
  });

  it('レガシーレスポンス形式（cliInstalled, loggedIn）もサポートする', async () => {
    const mockResponse = {
      flutter: { installed: true },
      dart: { installed: true },
      firebase: {},
      flutterfire: { installed: true },
      cliInstalled: true, // レガシー形式
      loggedIn: true, // レガシー形式
    };

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useCliStatus());

    await waitFor(() => {
      expect(result.current.environmentStatus.firebase.installed).toBe(true);
    });

    expect(result.current.environmentStatus.firebase.loggedIn).toBe(true);
  });
});
