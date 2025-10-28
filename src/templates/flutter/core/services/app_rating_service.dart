import 'dart:io';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// アプリ評価サービス
/// 
/// TODO: 以下のIDを実際の値に置き換えてください：
/// - _iosAppStoreId: App Store ConnectのアプリID
/// - _androidPackageName: Google Playのパッケージ名
/// - _androidListingId: Google Playのリスティング内部ID
/// 
/// TODO: 以下の設定を調整してください：
/// - _targetLaunchCount: 評価を促すまでの起動回数
/// - _laterIntervalDays: 「後で」選択後、再度促すまでの日数
/// - _completedIntervalDays: 評価完了後、再度促すまでの日数
class AppRatingService {
  AppRatingService(this._prefs);

  static const String _launchCountKey = 'app_rating_launch_count';
  static const String _lastPromptDateKey = 'app_rating_last_prompt_date';
  static const String _lastCompletedDateKey = 'app_rating_last_completed_date';

  // TODO: これらの値を調整してください
  static const int _targetLaunchCount = 10;
  static const int _laterIntervalDays = 14;
  static const int _completedIntervalDays = 120;

  // TODO: 実際のアプリIDに置き換えてください
  static const String _iosAppStoreId = 'YOUR_IOS_APP_STORE_ID';
  static const String _androidPackageName = 'com.example.yourapp';
  static const String _androidListingId = 'YOUR_ANDROID_LISTING_ID';

  final SharedPreferences _prefs;
  final InAppReview _inAppReview = InAppReview.instance;

  /// ファクトリーメソッド
  static Future<AppRatingService> create() async {
    final prefs = await SharedPreferences.getInstance();
    return AppRatingService(prefs);
  }

  /// アプリ起動時に呼び出す（自動的に評価を促す条件をチェック）
  Future<void> trackAppLaunch() async {
    // 評価完了後の経過日数チェック
    final lastCompletedIso = _prefs.getString(_lastCompletedDateKey);
    if (lastCompletedIso != null) {
      final lastCompleted = DateTime.tryParse(lastCompletedIso);
      if (lastCompleted != null &&
          DateTime.now().difference(lastCompleted).inDays <
              _completedIntervalDays) {
        return;
      }
    }

    // 起動回数をインクリメント
    final newCount = (_prefs.getInt(_launchCountKey) ?? 0) + 1;
    await _prefs.setInt(_launchCountKey, newCount);

    // 起動回数が目標に達していない場合はスキップ
    if (newCount < _targetLaunchCount) return;

    // 前回のプロンプト表示からの経過日数チェック
    final lastPromptIso = _prefs.getString(_lastPromptDateKey);
    if (lastPromptIso != null) {
      final lastPrompt = DateTime.tryParse(lastPromptIso);
      if (lastPrompt != null &&
          DateTime.now().difference(lastPrompt).inDays < _laterIntervalDays) {
        return;
      }
    }

    // 評価プロンプトを表示
    if (await _inAppReview.isAvailable()) {
      try {
        await _requestInAppReview();
      } catch (_) {
        // エラー時は無視
      }
    } else {
      try {
        await _openStoreListing();
      } catch (_) {
        // エラー時は無視
      }
    }
  }

  /// 手動で評価を促す（設定画面などから呼び出し）
  Future<void> requestReviewManually() async {
    await _openStoreListing();
  }

  /// アプリ内評価を要求
  Future<void> _requestInAppReview() async {
    try {
      await _inAppReview.requestReview();
      await _prefs.setString(
        _lastCompletedDateKey,
        DateTime.now().toIso8601String(),
      );
    } catch (_) {
      await _prefs.setString(
        _lastPromptDateKey,
        DateTime.now().toIso8601String(),
      );
      try {
        await _openStoreListing();
      } catch (_) {
        // エラー時は無視
      }
      rethrow;
    }
  }

  /// ストアページを開く
  Future<void> _openStoreListing() async {
    try {
      if (Platform.isIOS) {
        await _inAppReview.openStoreListing(appStoreId: _iosAppStoreId);
      } else {
        await _inAppReview.openStoreListing();
      }
      await _prefs.setString(
        _lastCompletedDateKey,
        DateTime.now().toIso8601String(),
      );
    } catch (_) {
      await _prefs.setString(
        _lastPromptDateKey,
        DateTime.now().toIso8601String(),
      );
      rethrow;
    }
  }

  /// デバッグ用の状態表示
  Map<String, dynamic> debugState() {
    return {
      'launchCount': _prefs.getInt(_launchCountKey) ?? 0,
      'lastPrompt': _prefs.getString(_lastPromptDateKey),
      'lastCompleted': _prefs.getString(_lastCompletedDateKey),
    };
  }
}

