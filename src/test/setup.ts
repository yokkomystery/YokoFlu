import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Next.js の useRouter モック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// fetch のグローバルモック（必要に応じて個別テストでオーバーライド）
global.fetch = vi.fn();

// window.matchMedia モック（テーマ切り替え用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// scrollIntoView モック
Element.prototype.scrollIntoView = vi.fn();
