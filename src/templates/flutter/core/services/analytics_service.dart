import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

/// Firebase Analytics サービス
/// 
/// ユーザー行動の分析とイベントトラッキングを行う
/// 
/// TODO: Firebase Consoleで以下の設定を行ってください：
/// - Google Analytics を有効化
/// - 必要なイベントを定義
/// - ユーザープロパティを設定
class AnalyticsService {
  static final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  /// Firebase Analytics の初期化
  static Future<void> initialize() async {
    try {
      // デフォルトのデータ収集を有効化
      await _analytics.setAnalyticsCollectionEnabled(true);
      
      debugPrint('✅ Firebase Analytics initialized successfully');
    } catch (e) {
      debugPrint('⚠️ Firebase Analytics initialization failed: $e');
    }
  }

  /// カスタムイベントを記録
  /// 
  /// 例: logEvent('purchase', {'product_id': 'abc123', 'price': 999})
  static Future<void> logEvent(
    String name, {
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logEvent(
        name: name,
        parameters: parameters,
      );
      debugPrint('📊 Event logged: $name');
    } catch (e) {
      debugPrint('❌ Failed to log event: $e');
    }
  }

  /// スクリーンビューを記録
  /// 
  /// 例: logScreenView(screenName: 'HomePage')
  static Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
      debugPrint('📊 Screen view logged: $screenName');
    } catch (e) {
      debugPrint('❌ Failed to log screen view: $e');
    }
  }

  /// ユーザープロパティを設定
  /// 
  /// 例: setUserProperty(name: 'user_type', value: 'premium')
  static Future<void> setUserProperty({
    required String name,
    required String value,
  }) async {
    try {
      await _analytics.setUserProperty(name: name, value: value);
      debugPrint('📊 User property set: $name = $value');
    } catch (e) {
      debugPrint('❌ Failed to set user property: $e');
    }
  }

  /// ユーザーIDを設定
  /// 
  /// 例: setUserId('user123')
  static Future<void> setUserId(String? userId) async {
    try {
      await _analytics.setUserId(userId);
      if (userId != null) {
        debugPrint('📊 User ID set: $userId');
      } else {
        debugPrint('📊 User ID cleared');
      }
    } catch (e) {
      debugPrint('❌ Failed to set user ID: $e');
    }
  }

  /// ログインイベント
  static Future<void> logLogin({String? loginMethod}) async {
    try {
      await _analytics.logLogin(loginMethod: loginMethod);
      debugPrint('📊 Login event logged');
    } catch (e) {
      debugPrint('❌ Failed to log login: $e');
    }
  }

  /// 購入イベント（アプリ内課金用）
  static Future<void> logPurchase({
    required String transactionId,
    required String currency,
    required double value,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logPurchase(
        currency: currency,
        value: value,
        transactionId: transactionId,
        parameters: parameters,
      );
      debugPrint('📊 Purchase logged: $transactionId');
    } catch (e) {
      debugPrint('❌ Failed to log purchase: $e');
    }
  }
}

