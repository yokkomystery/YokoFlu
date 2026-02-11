import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Push通知サービス
///
/// Firebase Cloud Messaging (FCM) と flutter_local_notifications を統合し、
/// 通知の初期化・権限管理・トークン保存・フォアグラウンド/バックグラウンド処理を行います。
///
/// TODO: Firebase Consoleで以下の設定を行ってください：
/// - iOS: APNs認証キー(.p8)をアップロード
/// - Android: google-services.json に含まれるため自動設定
///
/// TODO: アプリの権限設定を追加してください：
/// - iOS: Info.plist に UIBackgroundModes > remote-notification を追加
class PushNotificationService {
  final FirebaseMessaging _messaging;
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final GlobalKey<NavigatorState>? navigatorKey;
  final FlutterLocalNotificationsPlugin _localNotifications;

  PushNotificationService({
    FirebaseMessaging? messaging,
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    this.navigatorKey,
  })  : _messaging = messaging ?? FirebaseMessaging.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _localNotifications = FlutterLocalNotificationsPlugin();

  /// 通知を初期化
  Future<void> initialize() async {
    try {
      // flutter_local_notifications の初期化
      const androidSettings =
          AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );
      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
        onDidReceiveBackgroundNotificationResponse:
            _onBackgroundNotificationTapped,
      );

      // Android通知チャンネルの作成
      await _createAndroidNotificationChannels();

      // iOS: フォアグラウンドでの通知表示オプション
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 通知権限のリクエスト
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint(
          '[PushNotification] 権限ステータス: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        // FCMトークンの取得と保存
        await refreshTokenAndSave();

        // トークンリフレッシュ時の処理
        _messaging.onTokenRefresh.listen((newToken) {
          debugPrint('[PushNotification] Token refreshed');
          _saveTokenToFirestore(newToken);
        });

        // フォアグラウンドメッセージの受信ハンドラ
        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

        // バックグラウンドから開かれた通知の処理
        FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationOpen);

        // アプリ起動時に開かれた通知の確認
        final initialMessage = await _messaging.getInitialMessage();
        if (initialMessage != null) {
          _handleNotificationOpen(initialMessage);
        }
      } else {
        debugPrint('[PushNotification] ユーザーが通知を拒否しました');
      }
    } catch (e) {
      debugPrint('[PushNotification] 初期化に失敗: $e');
    }
  }

  /// Android通知チャンネルを作成
  ///
  /// TODO: アプリの通知タイプに合わせてチャンネルを追加・変更してください
  Future<void> _createAndroidNotificationChannels() async {
    final platformImpl = _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (platformImpl == null) return;

    // デフォルトの通知チャンネル
    const defaultChannel = AndroidNotificationChannel(
      'default_channel',
      'Default Notifications',
      description: 'Default notification channel.',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    // メッセージ通知チャンネル（例）
    const messageChannel = AndroidNotificationChannel(
      'messages',
      'Messages',
      description: 'Notifications for new messages.',
      importance: Importance.max,
      playSound: true,
    );

    await platformImpl.createNotificationChannel(defaultChannel);
    await platformImpl.createNotificationChannel(messageChannel);
  }

  /// FCMトークンを取得してFirestoreに保存
  Future<void> refreshTokenAndSave() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        debugPrint('[PushNotification] FCM Token 取得成功');
        await _saveTokenToFirestore(token);
      }
    } catch (e) {
      debugPrint('[PushNotification] トークン取得・保存に失敗: $e');
    }
  }

  /// FCMトークンをFirestoreに保存（トランザクションベース、マルチデバイス対応）
  Future<void> _saveTokenToFirestore(String token) async {
    final user = _auth.currentUser;
    if (user == null) {
      debugPrint('[PushNotification] ユーザー未ログイン。トークン保存スキップ');
      return;
    }

    try {
      final userDocRef = _firestore.collection('users').doc(user.uid);
      await _firestore.runTransaction((transaction) async {
        final userDoc = await transaction.get(userDocRef);

        if (!userDoc.exists) {
          transaction.set(userDocRef, {
            'fcmTokens': [token]
          });
        } else {
          final currentTokens = List<String>.from(
              userDoc.data()?['fcmTokens'] as List<dynamic>? ?? []);
          if (!currentTokens.contains(token)) {
            currentTokens.add(token);
            transaction.update(userDocRef, {'fcmTokens': currentTokens});
          }
        }
      });
      debugPrint('[PushNotification] FCMトークンを保存しました');
    } catch (e) {
      debugPrint('[PushNotification] FCMトークンの保存に失敗: $e');
    }
  }

  /// フォアグラウンドでのメッセージ受信処理
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    debugPrint(
        '[PushNotification] フォアグラウンドメッセージ受信: ${message.messageId}');

    // Android: ローカル通知として表示
    // iOS: setForegroundNotificationPresentationOptions で自動表示
    if (defaultTargetPlatform == TargetPlatform.android &&
        message.notification != null) {
      await _showLocalNotification(message);
    }
  }

  /// ローカル通知を表示（Android用）
  Future<void> _showLocalNotification(RemoteMessage message) async {
    // チャンネルIDを通知データから取得（デフォルトはdefault_channel）
    final channelId =
        message.data['channel'] as String? ?? 'default_channel';

    final androidDetails = AndroidNotificationDetails(
      channelId,
      channelId == 'messages' ? 'Messages' : 'Default Notifications',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      details,
      payload: jsonEncode(message.data),
    );
  }

  /// ローカル通知タップ時の処理（フォアグラウンド）
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null && response.payload!.isNotEmpty) {
      try {
        final data = jsonDecode(response.payload!) as Map<String, dynamic>;
        handleNotificationTap(data);
      } catch (e) {
        debugPrint('[PushNotification] ペイロード解析に失敗: $e');
      }
    }
  }

  /// ローカル通知タップ時の処理（バックグラウンド / トップレベル関数として必要）
  @pragma('vm:entry-point')
  static void _onBackgroundNotificationTapped(NotificationResponse response) {
    debugPrint(
        '[PushNotification] バックグラウンド通知タップ: ${response.payload}');
    // バックグラウンドでは navigatorKey にアクセスできないため、
    // SharedPreferences に保存しておきアプリ起動時に処理する方法もあります。
    // 通常は onMessageOpenedApp / getInitialMessage でカバーされます。
  }

  /// FCM通知から開かれた際の処理
  Future<void> _handleNotificationOpen(RemoteMessage message) async {
    debugPrint(
        '[PushNotification] 通知から開かれました: ${message.messageId}');
    handleNotificationTap(message.data);
  }

  /// 通知タップ時の共通ハンドラ
  ///
  /// TODO: アプリの画面構成に合わせてナビゲーション処理を実装してください
  /// data['type'] や data['screen'] などを使って適切な画面に遷移します
  void handleNotificationTap(Map<String, dynamic> data) {
    debugPrint('[PushNotification] 通知タップ処理: $data');

    final navigator = navigatorKey?.currentState;
    if (navigator == null) {
      debugPrint('[PushNotification] Navigator が利用できません');
      return;
    }

    final String? type = data['type'] as String?;
    final String? screen = data['screen'] as String?;

    // TODO: アプリの通知タイプに合わせてナビゲーションを追加してください
    // 例:
    // if (type == 'chat' && data['chatId'] != null) {
    //   navigator.pushNamed('/chat_detail', arguments: data['chatId']);
    // } else if (type == 'post' && data['postId'] != null) {
    //   navigator.pushNamed('/post_detail', arguments: data['postId']);
    // }
    if (screen != null && screen.isNotEmpty) {
      navigator.pushNamed('/$screen', arguments: data);
    }
  }

  /// 通知権限の状態を確認
  Future<AuthorizationStatus> getPermissionStatus() async {
    final settings = await _messaging.getNotificationSettings();
    return settings.authorizationStatus;
  }

  /// 通知権限が拒否されているかチェック
  Future<bool> isPermissionDenied() async {
    final status = await getPermissionStatus();
    return status == AuthorizationStatus.denied;
  }

  /// トピックを購読
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('[PushNotification] トピック「$topic」を購読');
    } catch (e) {
      debugPrint('[PushNotification] トピック購読に失敗: $e');
    }
  }

  /// トピックを購読解除
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('[PushNotification] トピック「$topic」を購読解除');
    } catch (e) {
      debugPrint('[PushNotification] トピック購読解除に失敗: $e');
    }
  }

  /// FCMトークンを取得
  Future<String?> getToken() async {
    try {
      return await _messaging.getToken();
    } catch (e) {
      debugPrint('[PushNotification] トークン取得に失敗: $e');
      return null;
    }
  }
}

/// バックグラウンドメッセージハンドラ
///
/// 注意: この関数はトップレベルで定義する必要があります（クラス内に置けません）
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint(
      '[PushNotification/Background] メッセージ受信: ${message.messageId}');
  // バックグラウンドで必要な処理を追加（バッジ更新、データ保存など）
  // 注意: この関数内では UI 操作やプロバイダーへのアクセスはできません
}

/// PushNotificationService のプロバイダー
///
/// main.dart でオーバーライドして使用します：
/// ```dart
/// final notificationProvider = Provider<PushNotificationService>((ref) {
///   return PushNotificationService(navigatorKey: navigatorKey);
/// });
/// ```
final pushNotificationServiceProvider =
    Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});
