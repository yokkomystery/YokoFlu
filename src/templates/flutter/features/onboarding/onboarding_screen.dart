import 'dart:ui';

import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<_OnboardingPageData> _pages = [
    const _OnboardingPageData(
      title: 'ようこそ 👋',
      description: '最初の 5 分でアプリの全体像とゴールが分かります。',
      accentColor: Color(0xFF60A5FA),
      titleBadge: 'STEP 01',
      highlights: [
        'TODO: 自社プロダクトの特徴を1行でまとめる',
        'TODO: 初回設定で押さえてほしいポイントを書き換える',
      ],
    ),
    const _OnboardingPageData(
      title: '便利な機能',
      description: '通知やオフライン対応など、実務で役立つ Tips を紹介します。',
      accentColor: Color(0xFFF472B6),
      titleBadge: 'STEP 02',
      highlights: [
        'TODO: 代表的なユースケースを箇条書きで記載',
        'TODO: セキュリティ・サポート情報を差し替える',
      ],
    ),
    const _OnboardingPageData(
      title: 'さあ始めましょう',
      description: '直感的な UI とドキュメントで、すぐに開発をスタートできます。',
      accentColor: Color(0xFF34D399),
      titleBadge: 'READY',
      highlights: [
        'TODO: 最新のアップデート情報を記載',
        'TODO: コミュニティや問い合わせ窓口を案内',
      ],
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _completeOnboarding() {
    widget.onComplete();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _skip() => _completeOnboarding();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Stack(
        children: [
          // グラデーション背景
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  colorScheme.surface,
                  colorScheme.surfaceVariant.withOpacity(0.4),
                ],
              ),
            ),
          ),
          // 背景のぼかしサークル
          Positioned(
            top: -80,
            right: -60,
            child: _blurCircle(colorScheme.primary.withOpacity(0.15)),
          ),
          Positioned(
            bottom: 40,
            left: -80,
            child: _blurCircle(colorScheme.tertiary.withOpacity(0.12)),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  // ヘッダー
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_currentPage + 1} / ${_pages.length}',
                        style: Theme.of(context)
                            .textTheme
                            .labelLarge
                            ?.copyWith(color: colorScheme.primary),
                      ),
                      TextButton(
                        onPressed: _skip,
                        child: const Text('スキップ'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // ページビュー
                  Expanded(
                    child: PageView.builder(
                      controller: _pageController,
                      itemCount: _pages.length,
                      onPageChanged: (index) {
                        setState(() {
                          _currentPage = index;
                        });
                      },
                      itemBuilder: (context, index) {
                        final page = _pages[index];
                        return _OnboardingPage(
                          data: page,
                          accentColor: page.accentColor,
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                  // インジケーター
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _pages.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 6),
                        height: 6,
                        width: _currentPage == index ? 28 : 10,
                        decoration: BoxDecoration(
                          color: _currentPage == index
                              ? colorScheme.primary
                              : colorScheme.outlineVariant,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // アクションボタン
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _nextPage,
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Text(
                        _currentPage == _pages.length - 1
                            ? 'はじめる'
                            : '次へ進む',
                        style: const TextStyle(fontSize: 17),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: _skip,
                    child: const Text('後で設定'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _blurCircle(Color color) {
    return ClipOval(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
        child: Container(
          height: 180,
          width: 180,
          color: color,
        ),
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({
    required this.data,
    required this.accentColor,
  });

  final _OnboardingPageData data;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      children: [
        Expanded(
          child: Container(
            margin: const EdgeInsets.only(top: 8, bottom: 16),
            decoration: BoxDecoration(
              color: accentColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(32),
            ),
            child: Stack(
              children: [
                Positioned(
                  top: 24,
                  right: 24,
                  child: Icon(
                    Icons.auto_awesome,
                    color: accentColor.withOpacity(0.6),
                    size: 28,
                  ),
                ),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: AspectRatio(
                          aspectRatio: 1.0,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(28),
                                boxShadow: [
                                  BoxShadow(
                                    color: accentColor.withOpacity(0.25),
                                    blurRadius: 30,
                                    offset: const Offset(0, 20),
                                  ),
                                ],
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.image_not_supported_outlined,
                                    size: 48,
                                    color: accentColor.withOpacity(0.6),
                                  ),
                                  const SizedBox(height: 8),
                                  Flexible(
                                    child: Text(
                                      'No Image',
                                      style: textTheme.labelMedium?.copyWith(
                                        color: accentColor.withOpacity(0.7),
                                        fontSize: 12,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Flexible(
                                    child: Text(
                                      '画像を差し替えてください',
                                      style: textTheme.bodySmall?.copyWith(
                                        color: accentColor.withOpacity(0.7),
                                        fontSize: 10,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          data.titleBadge,
                          style: textTheme.labelMedium?.copyWith(
                            color: accentColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Text(
          data.title,
          style: textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          data.description,
          style: textTheme.bodyMedium?.copyWith(
            color: Colors.grey[700],
            height: 1.4,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: data.highlights.map((text) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 1),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: accentColor, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      text,
                      style: textTheme.bodySmall?.copyWith(fontSize: 13),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _OnboardingPageData {
  final String title;
  final String description;
  final Color accentColor;
  final String titleBadge;
  final List<String> highlights;

  const _OnboardingPageData({
    required this.title,
    required this.description,
    required this.accentColor,
    this.titleBadge = '3分で分かる',
    this.highlights = const [
      'TODO: ハイライトを差し替えてください',
    ],
  });
}
