import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

/// Firebase Crashlytics サービス
/// 
/// クラッシュレポートとエラートラッキングを行う
/// 
/// TODO: Firebase Consoleで以下の設定を行ってください：
/// - Crashlytics を有効化
/// - iOS: dSYM ファイルのアップロードを設定
/// - Android: ProGuard マッピングファイルのアップロードを設定
class CrashlyticsService {
  static final FirebaseCrashlytics _crashlytics =
      FirebaseCrashlytics.instance;

  /// Crashlytics の初期化
  /// 
  /// 開発環境ではクラッシュを有効化しないことを推奨
  static Future<void> initialize({bool enableInDev = false}) async {
    try {
      // Flutter のエラーを Crashlytics に送信
      FlutterError.onError = (FlutterErrorDetails details) {
        if (kDebugMode) {
          // 開発環境では Flutter の標準エラー処理を使用
          FlutterError.presentError(details);
        }
        // 本番環境でのみ Crashlytics に送信
        _crashlytics.recordFlutterFatalError(details);
      };

      // 現在発生中のプラットフォーム例外をバウンダリがない runZonedGuarded に送信
      PlatformDispatcher.instance.onError = (error, stack) {
        if (kDebugMode && !enableInDev) {
          return false; // 開発環境では標準エラー処理
        }
        _crashlytics.recordError(error, stack, fatal: true);
        return true;
      };

      // 必要に応じてクラッシュレポートを無効化
      if (kDebugMode && !enableInDev) {
        await _crashlytics.setCrashlyticsCollectionEnabled(false);
        debugPrint('⚠️ Crashlytics disabled in debug mode');
      } else {
        await _crashlytics.setCrashlyticsCollectionEnabled(true);
        debugPrint('✅ Firebase Crashlytics initialized successfully');
      }
    } catch (e) {
      debugPrint('⚠️ Crashlytics initialization failed: $e');
    }
  }

  /// カスタムログを記録
  /// 
  /// 例: log('User clicked button A')
  static Future<void> log(String message) async {
    try {
      await _crashlytics.log(message);
      debugPrint('📝 Crashlytics log: $message');
    } catch (e) {
      debugPrint('❌ Failed to log to Crashlytics: $e');
    }
  }

  /// 非致命的なエラーを記録
  /// 
  /// 例: recordError(exception, stackTrace)
  static Future<void> recordError(
    Object error,
    StackTrace? stackTrace, {
    String? reason,
    bool fatal = false,
  }) async {
    try {
      if (kDebugMode) {
        debugPrint('⚠️ Error recorded: $error');
      }
      await _crashlytics.recordError(
        error,
        stackTrace,
        reason: reason,
        fatal: fatal,
      );
    } catch (e) {
      debugPrint('❌ Failed to record error to Crashlytics: $e');
    }
  }

  /// ユーザー識別子を設定
  /// 
  /// 例: setUserId('user123')
  static Future<void> setUserId(String userId) async {
    try {
      await _crashlytics.setUserIdentifier(userId);
      debugPrint('👤 User ID set for Crashlytics: $userId');
    } catch (e) {
      debugPrint('❌ Failed to set user ID: $e');
    }
  }

  /// カスタムキーを設定
  /// 
  /// 例: setCustomKey('subscription_type', 'premium')
  static Future<void> setCustomKey(String key, dynamic value) async {
    try {
      await _crashlytics.setCustomKey(key, value);
      debugPrint('🔑 Custom key set: $key = $value');
    } catch (e) {
      debugPrint('❌ Failed to set custom key: $e');
    }
  }

  /// 重大なログを記録（クラッシュの診断に有用）
  /// 
  /// 例: logError('Network request failed')
  static Future<void> logError(String message) async {
    await log('ERROR: $message');
  }

  /// 情報ログを記録
  /// 
  /// 例: logInfo('App started')
  static Future<void> logInfo(String message) async {
    await log('INFO: $message');
  }

  /// 警告ログを記録
  /// 
  /// 例: logWarning('Slow network detected')
  static Future<void> logWarning(String message) async {
    await log('WARNING: $message');
  }
}

