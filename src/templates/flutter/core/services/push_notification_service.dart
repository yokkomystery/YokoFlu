import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

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
  // シングルトンインスタンス
  static PushNotificationService? _instance;
  
  final FirebaseMessaging _messaging;
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final GlobalKey<NavigatorState>? navigatorKey;
  final FlutterLocalNotificationsPlugin _localNotifications;

  PushNotificationService._internal({
    FirebaseMessaging? messaging,
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
    this.navigatorKey,
  })  : _messaging = messaging ?? FirebaseMessaging.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _localNotifications = FlutterLocalNotificationsPlugin();

  /// シングルトンインスタンスを取得
  factory PushNotificationService({GlobalKey<NavigatorState>? navigatorKey}) {
    _instance ??= PushNotificationService._internal(navigatorKey: navigatorKey);
    return _instance!;
  }

  /// 通知を初期化（静的メソッド版 - シンプルな使い方）
  static Future<void> initialize({GlobalKey<NavigatorState>? navigatorKey}) async {
    final service = PushNotificationService(navigatorKey: navigatorKey);
    await service._initialize();
  }

  /// 通知を初期化（インスタンスメソッド版）
  Future<void> _initialize() async {
    try {
      // flutter_local_notifications の初期化
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
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
        onDidReceiveBackgroundNotificationResponse: _onNotificationTapped,
      );

      // Android通知チャンネルの作成
      await _createAndroidNotificationChannel();

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

      debugPrint('通知権限ステータス: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        // FCMトークンの取得と保存
        await refreshTokenAndSave();

        // トークンリフレッシュ時の処理
        _messaging.onTokenRefresh.listen((newToken) {
          debugPrint('FCM Token refreshed: $newToken');
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
        debugPrint('❌ ユーザーが通知を拒否しました');
      }
    } catch (e) {
      debugPrint('❌ Push通知の初期化に失敗: $e');
    }
  }

  /// Android通知チャンネルを作成
  Future<void> _createAndroidNotificationChannel() async {
    const channel = AndroidNotificationChannel(
      'default_notification_channel',
      'Default Notifications',
      description: 'This channel is used for default notifications.',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  /// FCMトークンを取得してFirestoreに保存
  Future<void> refreshTokenAndSave() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        debugPrint('FCM Token: $token');
        await _saveTokenToFirestore(token);
      }
    } catch (e) {
      debugPrint('❌ トークン取得・保存に失敗: $e');
    }
  }

  /// FCMトークンをFirestoreに保存
  Future<void> _saveTokenToFirestore(String token) async {
    final user = _auth.currentUser;
    if (user == null) {
      debugPrint('⚠️ ユーザーが未ログイン。トークンを保存できません');
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
      debugPrint('✅ FCMトークンを保存しました');
    } catch (e) {
      debugPrint('❌ FCMトークンの保存に失敗: $e');
    }
  }

  /// フォアグラウンドでのメッセージ受信処理
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    debugPrint('フォアグラウンドでメッセージを受信: ${message.messageId}');

    if (message.notification != null) {
      await _showLocalNotification(message);
    }
  }

  /// ローカル通知を表示
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'default_notification_channel',
      'Default Notifications',
      channelDescription: 'This channel is used for default notifications.',
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

    const details = NotificationDetails(
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

  /// 通知タップ時の処理
  @pragma('vm:entry-point')
  static void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null && response.payload!.isNotEmpty) {
      try {
        final data = jsonDecode(response.payload!) as Map<String, dynamic>;
        debugPrint('通知タップ: $data');
        // TODO: 画面遷移処理を実装
        // 例: navigatorKey.currentState?.pushNamed('/detail', arguments: data);
      } catch (e) {
        debugPrint('通知ペイロードの解析に失敗: $e');
      }
    }
  }

  /// 通知から開かれた際の処理
  Future<void> _handleNotificationOpen(RemoteMessage message) async {
    debugPrint('通知から開かれました: ${message.messageId}');
    // TODO: message.data を使って適切な画面に遷移
    // 例:
    // final screen = message.data['screen'];
    // if (screen != null) {
    //   navigatorKey?.currentState?.pushNamed('/$screen', arguments: message.data);
    // }
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
      debugPrint('✅ トピック「$topic」を購読しました');
    } catch (e) {
      debugPrint('❌ トピック購読に失敗: $e');
    }
  }

  /// トピックを購読解除
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('✅ トピック「$topic」を購読解除しました');
    } catch (e) {
      debugPrint('❌ トピック購読解除に失敗: $e');
    }
  }

  /// FCMトークンを取得
  Future<String?> getToken() async {
    try {
      return await _messaging.getToken();
    } catch (e) {
      debugPrint('❌ トークン取得に失敗: $e');
      return null;
    }
  }

  // === 静的メソッド版（シンプルな使い方） ===

  /// 通知権限の状態を確認（静的メソッド版）
  static Future<AuthorizationStatus> checkPermissionStatus() async {
    final service = PushNotificationService();
    return await service.getPermissionStatus();
  }

  /// 通知権限が拒否されているかチェック（静的メソッド版）
  static Future<bool> checkIsPermissionDenied() async {
    final service = PushNotificationService();
    return await service.isPermissionDenied();
  }

  /// トピックを購読（静的メソッド版）
  static Future<void> subscribeToTopicStatic(String topic) async {
    final service = PushNotificationService();
    await service.subscribeToTopic(topic);
  }

  /// トピックを購読解除（静的メソッド版）
  static Future<void> unsubscribeFromTopicStatic(String topic) async {
    final service = PushNotificationService();
    await service.unsubscribeFromTopic(topic);
  }

  /// FCMトークンを取得（静的メソッド版）
  static Future<String?> getTokenStatic() async {
    final service = PushNotificationService();
    return await service.getToken();
  }
}

/// バックグラウンドメッセージハンドラ
/// 
/// 注意: この関数はトップレベルで定義する必要があります
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('バックグラウンドメッセージを受信: ${message.messageId}');
  debugPrint('タイトル: ${message.notification?.title}');
  debugPrint('本文: ${message.notification?.body}');
}

