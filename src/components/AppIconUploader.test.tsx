import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppIconUploader } from './AppIconUploader';

// LocaleContext のモック
vi.mock('../context/LocaleContext', async () => {
  const actual = await vi.importActual('../context/LocaleContext');
  return {
    ...actual,
    useLocale: () => ({
      locale: 'ja',
      setLocale: vi.fn(),
      t: {
        basicInfo: {
          appIcon: 'アプリアイコン',
          appIconDescription: ['iOS/Android両対応', '各サイズを自動生成'],
          errorSquareRequired: '正方形の画像を選択してください（現在: {width}x{height}）',
          errorSizeTooSmall: '512x512px以上の画像を選択してください（現在: {width}x{height}）',
          selectFile: 'ファイルを選択',
          noFileSelected: 'ファイルが選択されていません',
          appIconRequirements: ['PNG形式推奨', '1024x1024px以上'],
          appIconSet: 'アイコンが設定されました',
        },
      },
    }),
  };
});

describe('AppIconUploader', () => {
  const defaultProps = {
    appIcon: null,
    appIconPreview: null,
    appIconFileName: null,
    onIconChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態でプレースホルダーが表示される', () => {
    render(<AppIconUploader {...defaultProps} />);

    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    expect(screen.getByText('ファイルが選択されていません')).toBeInTheDocument();
  });

  it('プレビュー画像が設定されている場合は表示される', () => {
    const propsWithPreview = {
      ...defaultProps,
      appIconPreview: 'data:image/png;base64,test',
      appIconFileName: 'icon.png',
    };

    render(<AppIconUploader {...propsWithPreview} />);

    const img = screen.getByAltText('App Icon Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,test');
    expect(screen.getByText('icon.png')).toBeInTheDocument();
  });

  it('削除ボタンをクリックするとonIconChangeがnullで呼ばれる', () => {
    const onIconChange = vi.fn();
    const propsWithPreview = {
      ...defaultProps,
      appIcon: 'data:image/png;base64,test',
      appIconPreview: 'data:image/png;base64,test',
      appIconFileName: 'icon.png',
      onIconChange,
    };

    render(<AppIconUploader {...propsWithPreview} />);

    const removeButton = screen.getByLabelText('Remove icon');
    fireEvent.click(removeButton);

    expect(onIconChange).toHaveBeenCalledWith(null, null, null);
  });

  it('appIconが設定されている場合は設定完了メッセージが表示される', () => {
    const propsWithIcon = {
      ...defaultProps,
      appIcon: 'data:image/png;base64,test',
      appIconPreview: 'data:image/png;base64,test',
    };

    render(<AppIconUploader {...propsWithIcon} />);

    expect(screen.getByText('アイコンが設定されました')).toBeInTheDocument();
  });

  it('ファイル入力要素が存在する', () => {
    render(<AppIconUploader {...defaultProps} />);

    const input = document.getElementById('app-icon-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg');
  });

  it('アイコン説明文が表示される', () => {
    render(<AppIconUploader {...defaultProps} />);

    expect(screen.getByText('iOS/Android両対応')).toBeInTheDocument();
    expect(screen.getByText('各サイズを自動生成')).toBeInTheDocument();
  });

  it('要件リストが表示される', () => {
    render(<AppIconUploader {...defaultProps} />);

    expect(screen.getByText('PNG形式推奨')).toBeInTheDocument();
    expect(screen.getByText('1024x1024px以上')).toBeInTheDocument();
  });
});
