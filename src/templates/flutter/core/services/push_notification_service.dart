import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Push通知サービス
/// 
/// TODO: Firebase Consoleで以下の設定を行ってください：
/// - iOS: APNs証明書をアップロード
/// - Android: FCMサーバーキーを設定
/// 
/// TODO: アプリの権限設定を追加してください：
/// - iOS: Info.plist に UIBackgroundModes を追加
/// - Android: AndroidManifest.xml に権限を追加
class PushNotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  /// 通知を初期化
  static Future<void> initialize() async {
    try {
      // 通知許可を要求（iOS）
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('ユーザーが許可した通知権限: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('✅ ユーザーが通知を許可しました');
      } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
        debugPrint('⚠️ ユーザーが一時的な通知を許可しました');
      } else {
        debugPrint('❌ ユーザーが通知を拒否しました');
      }

      // FCMトークンを取得
      String? token = await _messaging.getToken();
      debugPrint('FCM Token: $token');

      // トークンが更新されたときのハンドラ
      _messaging.onTokenRefresh.listen((newToken) {
        debugPrint('FCM Token refreshed: $newToken');
        // TODO: サーバーに新しいトークンを送信
      });

      // フォアグラウンドメッセージのハンドラ
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('フォアグラウンドでメッセージを受信: ${message.messageId}');
        debugPrint('タイトル: ${message.notification?.title}');
        debugPrint('本文: ${message.notification?.body}');
        // TODO: ローカル通知として表示
      });

      // バックグラウンドメッセージがタップされたときのハンドラ（iOS用）
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('バックグラウンドから開かれたメッセージ: ${message.messageId}');
        // TODO: 特定の画面に遷移
      });

    } catch (e) {
      debugPrint('❌ Push通知の初期化に失敗: $e');
    }
  }

  /// トピックを購読
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('✅ トピック「$topic」を購読しました');
    } catch (e) {
      debugPrint('❌ トピック購読に失敗: $e');
    }
  }

  /// トピックを購読解除
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('✅ トピック「$topic」を購読解除しました');
    } catch (e) {
      debugPrint('❌ トピック購読解除に失敗: $e');
    }
  }

  /// FCMトークンを取得
  static Future<String?> getToken() async {
    try {
      return await _messaging.getToken();
    } catch (e) {
      debugPrint('❌ トークン取得に失敗: $e');
      return null;
    }
  }
}

/// バックグラウンドメッセージハンドラ
/// 
/// 注意: この関数はトップレベルで定義する必要があります
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await FirebaseMessaging.instance.getInitialMessage();
  debugPrint('バックグラウンドメッセージを受信: ${message.messageId}');
  debugPrint('タイトル: ${message.notification?.title}');
  debugPrint('本文: ${message.notification?.body}');
}

