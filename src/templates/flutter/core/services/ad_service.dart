import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Google AdMob 広告サービス
///
/// バナー広告・インタースティシャル広告・リワード広告を管理する
///
/// TODO: 以下の広告ユニットIDを実際の値に置き換えてください：
/// - _prodIosBannerId / _prodAndroidBannerId: バナー広告ID
/// - _prodIosInterstitialId / _prodAndroidInterstitialId: インタースティシャル広告ID
/// - _prodIosRewardedId / _prodAndroidRewardedId: リワード広告ID
///
/// TODO: AdMob コンソールで以下の設定を行ってください：
/// - アプリを登録
/// - 広告ユニットを作成
/// - テストデバイスIDを設定
///
/// TODO: プラットフォーム設定：
/// - iOS: Info.plist に GADApplicationIdentifier を追加
/// - Android: AndroidManifest.xml に com.google.android.gms.ads.APPLICATION_ID を追加

// --- テストID (AdMob公式テスト用) ---
const String _testIosBannerId = 'ca-app-pub-3940256099942544/2934735716';
const String _testIosInterstitialId = 'ca-app-pub-3940256099942544/4411468910';
const String _testIosRewardedId = 'ca-app-pub-3940256099942544/1712485313';
const String _testAndroidBannerId = 'ca-app-pub-3940256099942544/6300978111';
const String _testAndroidInterstitialId = 'ca-app-pub-3940256099942544/1033173712';
const String _testAndroidRewardedId = 'ca-app-pub-3940256099942544/5224354917';

// --- 本番ID ---
// TODO: 実際の広告ユニットIDに置き換えてください
const String _prodIosBannerId = 'YOUR_IOS_BANNER_AD_UNIT_ID';
const String _prodIosInterstitialId = 'YOUR_IOS_INTERSTITIAL_AD_UNIT_ID';
const String _prodIosRewardedId = 'YOUR_IOS_REWARDED_AD_UNIT_ID';
const String _prodAndroidBannerId = 'YOUR_ANDROID_BANNER_AD_UNIT_ID';
const String _prodAndroidInterstitialId = 'YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID';
const String _prodAndroidRewardedId = 'YOUR_ANDROID_REWARDED_AD_UNIT_ID';

/// AdMob 広告サービス
class AdService {
  bool _isInitialized = false;
  BannerAd? _bannerAd;
  bool _isBannerLoaded = false;
  InterstitialAd? _interstitialAd;
  bool _isInterstitialLoading = false;
  RewardedAd? _rewardedAd;
  bool _isRewardedLoading = false;

  bool get isInitialized => _isInitialized;
  bool get isBannerLoaded => _isBannerLoaded;

  // --- 広告ユニットID取得 ---
  String get bannerAdUnitId {
    if (kDebugMode) {
      return Platform.isIOS ? _testIosBannerId : _testAndroidBannerId;
    }
    return Platform.isIOS ? _prodIosBannerId : _prodAndroidBannerId;
  }

  String get interstitialAdUnitId {
    if (kDebugMode) {
      return Platform.isIOS ? _testIosInterstitialId : _testAndroidInterstitialId;
    }
    return Platform.isIOS ? _prodIosInterstitialId : _prodAndroidInterstitialId;
  }

  String get rewardedAdUnitId {
    if (kDebugMode) {
      return Platform.isIOS ? _testIosRewardedId : _testAndroidRewardedId;
    }
    return Platform.isIOS ? _prodIosRewardedId : _prodAndroidRewardedId;
  }

  /// AdMob SDKの初期化
  Future<void> initialize() async {
    try {
      await MobileAds.instance.initialize();
      _isInitialized = true;
      debugPrint('✅ AdMob initialized successfully');
    } catch (e) {
      debugPrint('⚠️ AdMob initialization failed: $e');
    }
  }

  // --- バナー広告 ---

  /// バナー広告を読み込む
  Future<void> loadBannerAd({VoidCallback? onLoaded}) async {
    if (!_isInitialized) return;

    // 既存の広告を破棄
    _bannerAd?.dispose();
    _bannerAd = null;
    _isBannerLoaded = false;

    _bannerAd = BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          debugPrint('✅ Banner ad loaded');
          _bannerAd = ad as BannerAd;
          _isBannerLoaded = true;
          onLoaded?.call();
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('❌ Banner ad failed to load: $error');
          _isBannerLoaded = false;
          ad.dispose();
          _bannerAd = null;
        },
      ),
    );

    await _bannerAd?.load();
  }

  /// バナー広告ウィジェットを取得
  ///
  /// 広告がロードされていない場合は null を返す
  Widget? getBannerWidget() {
    if (_bannerAd == null || !_isBannerLoaded) {
      return null;
    }

    return SizedBox(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      child: AdWidget(ad: _bannerAd!),
    );
  }

  /// バナー広告を破棄
  void disposeBannerAd() {
    _bannerAd?.dispose();
    _bannerAd = null;
    _isBannerLoaded = false;
  }

  // --- インタースティシャル広告 ---

  /// インタースティシャル広告を読み込む
  void loadInterstitialAd() {
    if (!_isInitialized || _isInterstitialLoading || _interstitialAd != null) {
      return;
    }

    _isInterstitialLoading = true;

    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          debugPrint('✅ Interstitial ad loaded');
          _interstitialAd = ad;
          _isInterstitialLoading = false;

          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _interstitialAd = null;
              loadInterstitialAd(); // 次の広告を事前にロード
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              debugPrint('❌ Interstitial ad failed to show: $error');
              ad.dispose();
              _interstitialAd = null;
              loadInterstitialAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('❌ Interstitial ad failed to load: $error');
          _interstitialAd = null;
          _isInterstitialLoading = false;
        },
      ),
    );
  }

  /// インタースティシャル広告を表示
  void showInterstitialAd() {
    if (_interstitialAd == null) {
      debugPrint('⚠️ Interstitial ad not ready');
      loadInterstitialAd();
      return;
    }
    _interstitialAd!.show();
  }

  // --- リワード広告 ---

  /// リワード広告を読み込む
  void loadRewardedAd() {
    if (!_isInitialized || _isRewardedLoading || _rewardedAd != null) {
      return;
    }

    _isRewardedLoading = true;

    RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          debugPrint('✅ Rewarded ad loaded');
          _rewardedAd = ad;
          _isRewardedLoading = false;

          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _rewardedAd = null;
              loadRewardedAd(); // 次の広告を事前にロード
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              debugPrint('❌ Rewarded ad failed to show: $error');
              ad.dispose();
              _rewardedAd = null;
              loadRewardedAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('❌ Rewarded ad failed to load: $error');
          _rewardedAd = null;
          _isRewardedLoading = false;
        },
      ),
    );
  }

  /// リワード広告を表示
  ///
  /// ユーザーが報酬を獲得した場合 [onRewarded] が呼ばれる
  void showRewardedAd({
    required VoidCallback onRewarded,
    VoidCallback? onFailed,
  }) {
    if (_rewardedAd == null) {
      debugPrint('⚠️ Rewarded ad not ready');
      onFailed?.call();
      loadRewardedAd();
      return;
    }

    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        debugPrint('🎁 User earned reward: ${reward.amount} ${reward.type}');
        onRewarded();
      },
    );
  }

  /// リワード広告が利用可能かどうか
  bool get isRewardedAdReady => _rewardedAd != null;

  /// すべての広告を破棄
  void dispose() {
    disposeBannerAd();
    _interstitialAd?.dispose();
    _interstitialAd = null;
    _rewardedAd?.dispose();
    _rewardedAd = null;
  }
}

/// AdService の Riverpod プロバイダー
final adServiceProvider = Provider<AdService>((ref) {
  return AdService();
});
