import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSetupProgress from './useSetupProgress';

describe('useSetupProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isSubmittingがfalseの場合はポーリングしない', () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    renderHook(() => useSetupProgress(false, { onUpdate, onComplete }));

    vi.advanceTimersByTime(3000);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('isSubmittingがtrueの場合は定期的にAPIを呼び出す', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        steps: { step1: { status: 'running', message: 'Running...' } },
        isComplete: false,
      }),
    } as Response);

    renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 1000 })
    );

    // 最初のインターバル
    await vi.advanceTimersByTimeAsync(1000);

    expect(global.fetch).toHaveBeenCalledWith('/api/flutter-setup/progress');
    expect(onUpdate).toHaveBeenCalledWith({
      steps: { step1: { status: 'running', message: 'Running...' } },
      isComplete: false,
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('isCompleteがtrueの場合はonCompleteが呼ばれてポーリングが停止する', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          steps: {},
          isComplete: false,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          steps: {},
          isComplete: true,
        }),
      } as Response);

    renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 1000 })
    );

    // 最初のインターバル
    await vi.advanceTimersByTimeAsync(1000);
    expect(onComplete).not.toHaveBeenCalled();

    // 2回目のインターバル（完了）
    await vi.advanceTimersByTimeAsync(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // 完了後はポーリングが停止する
    await vi.advanceTimersByTimeAsync(2000);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('APIエラーが発生してもポーリングは継続する', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          steps: {},
          isComplete: false,
        }),
      } as Response);

    renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 1000 })
    );

    // エラー発生
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).not.toHaveBeenCalled();

    // リトライで成功
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('レスポンスがokでない場合はonUpdateが呼ばれない', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 1000 })
    );

    await vi.advanceTimersByTimeAsync(1000);

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('カスタムintervalMsを使用できる', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ steps: {}, isComplete: false }),
    } as Response);

    renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 500 })
    );

    await vi.advanceTimersByTimeAsync(500);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(500);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('アンマウント時にクリーンアップされる', async () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ steps: {}, isComplete: false }),
    } as Response);

    const { unmount } = renderHook(() =>
      useSetupProgress(true, { onUpdate, onComplete, intervalMs: 1000 })
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    unmount();

    await vi.advanceTimersByTimeAsync(2000);
    // アンマウント後は呼び出されない
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
