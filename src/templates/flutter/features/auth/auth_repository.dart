import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
{{#GOOGLE_SIGNIN}}
import 'package:google_sign_in/google_sign_in.dart';
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
{{/APPLE_SIGNIN}}
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io' show Platform;
import 'dart:math' as math;

/// 認証リポジトリ
/// 
/// TODO: Firebase Consoleで以下の設定を行ってください：
{{#ANONYMOUS_AUTH}}
/// - 匿名認証を有効化
{{/ANONYMOUS_AUTH}}
{{#GOOGLE_SIGNIN}}
/// - Google認証を有効化
/// - OAuth 2.0クライアントIDを設定
/// - Android: SHA-1証明書フィンガープリントを登録
///   コマンド: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
/// - Appleサインインを有効化
/// - Apple Developer ConsoleでSign in with Appleを設定
/// - Service IDを取得してFirebase Consoleに登録
/// - XcodeでSign in with Apple capabilityを追加
{{/APPLE_SIGNIN}}
/// 
/// TODO: Firestoreでusersコレクションのセキュリティルールを設定してください：
/// rules_version = '2';
/// service cloud.firestore {
///   match /databases/{database}/documents {
///     match /users/{userId} {
///       allow read, write: if request.auth != null && request.auth.uid == userId;
///     }
///   }
/// }
class AuthRepository {
  AuthRepository();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
{{#GOOGLE_SIGNIN}}
  final GoogleSignIn _googleSignIn = GoogleSignIn();
{{/GOOGLE_SIGNIN}}

  /// 現在のユーザーを取得
  User? get currentUser => _auth.currentUser;

  /// 認証状態の変更を監視
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// ユーザードキュメントが存在しない場合は作成（リトライ機能付き）
  Future<void> _ensureUserDocument({
    required User user,
    required String localeCode,
    int maxRetries = 3,
  }) async {
    int retryCount = 0;
    Duration retryDelay = const Duration(seconds: 1);

    while (retryCount < maxRetries) {
      try {
        await _performEnsureUserDocument(
          user: user,
          localeCode: localeCode,
        );
        debugPrint('[AuthRepository] ユーザードキュメント作成/更新成功');
        return; // 成功したら終了
      } catch (e) {
        retryCount++;
        if (retryCount >= maxRetries) {
          debugPrint(
              '[AuthRepository] ユーザードキュメント作成失敗（リトライ${maxRetries}回後）: $e');
          // Firestoreへの書き込みは失敗したが、サインイン自体は成功しているので
          // エラーを再スローせず、警告ログのみ出力
          debugPrint('[AuthRepository] 警告: ユーザードキュメントは後で作成されます');
          return;
        }
        debugPrint(
            '[AuthRepository] リトライ ${retryCount}/${maxRetries} (${retryDelay.inSeconds}秒後): $e');
        await Future.delayed(retryDelay);
        retryDelay *= 2; // exponential backoff
      }
    }
  }

  /// ユーザードキュメントの作成または更新（実装部分）
  Future<void> _performEnsureUserDocument({
    required User user,
    required String localeCode,
  }) async {
    final docRef = _db.collection('users').doc(user.uid);
    final snapshot = await docRef.get();

    final nowServer = FieldValue.serverTimestamp();

    // デバイス情報とアプリ情報を収集
    Map<String, dynamic> lastLoginInfo = {};
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final messaging = FirebaseMessaging.instance;
      final String? fcmToken = await messaging.getToken();
      String? apnsToken;
      try {
        if (!kIsWeb && (Platform.isIOS || Platform.isMacOS)) {
          apnsToken = await messaging.getAPNSToken();
        }
      } catch (_) {}

      final appInfo = {
        'version': packageInfo.version,
        'buildNumber': packageInfo.buildNumber,
        'packageName': packageInfo.packageName,
        'installerStore': await _getInstallerStore(),
      };

      final devicePlugin = DeviceInfoPlugin();
      Map<String, dynamic> deviceMeta = {};
      try {
        if (!kIsWeb && Platform.isAndroid) {
          final info = await devicePlugin.androidInfo;
          deviceMeta = {
            'platform': 'android',
            'brand': info.brand,
            'model': info.model,
            'device': info.device,
            'manufacturer': info.manufacturer,
            'sdkInt': info.version.sdkInt,
            'release': info.version.release,
          };
        } else if (!kIsWeb && Platform.isIOS) {
          final info = await devicePlugin.iosInfo;
          deviceMeta = {
            'platform': 'ios',
            'name': info.name,
            'model': info.model,
            'systemName': info.systemName,
            'systemVersion': info.systemVersion,
            'localizedModel': info.localizedModel,
            'utsname': {'machine': info.utsname.machine},
          };
        } else if (!kIsWeb && Platform.isMacOS) {
          final info = await devicePlugin.macOsInfo;
          deviceMeta = {
            'platform': 'macos',
            'model': info.model,
            'arch': info.arch,
            'kernelVersion': info.kernelVersion,
            'osRelease': info.osRelease,
          };
        }
      } catch (_) {}

      final deviceInfo = kIsWeb
          ? {
              'platform': 'web',
              'messaging': {
                'deviceToken': fcmToken,
                'notificationPermission':
                    await _getNotificationPermissionStatus(),
              },
            }
          : {
              'os': Platform.operatingSystem,
              'osVersion': Platform.operatingSystemVersion,
              'localeName': Platform.localeName,
              'numberOfProcessors': Platform.numberOfProcessors,
              'messaging': {
                'deviceToken': fcmToken,
                'apnsToken': apnsToken,
                'notificationPermission':
                    await _getNotificationPermissionStatus(),
              },
              'attStatus': await _getAttStatusIfAvailable(),
              'userAgent':
                  '{{APP_NAME}}/${packageInfo.version} (${Platform.operatingSystem}; ${Platform.operatingSystemVersion}; locale:${Platform.localeName}; build:${packageInfo.buildNumber})',
              'device': deviceMeta,
            };

      final authProviderIds =
          user.providerData.map((p) => p.providerId).toList();
      final authInfo = {
        'isAnonymous': user.isAnonymous,
        'authMethods':
            authProviderIds.isNotEmpty ? authProviderIds : ['unknown'],
        'emailVerified': user.emailVerified,
        'creationTime': user.metadata.creationTime?.toIso8601String(),
        'lastSignInTime': user.metadata.lastSignInTime?.toIso8601String() ??
            user.metadata.creationTime?.toIso8601String(),
      };

      final now = DateTime.now();
      final timeInfo = {
        'clientTime': now.toIso8601String(),
        'timeZoneName': now.timeZoneName,
        'timeZoneOffsetMinutes': now.timeZoneOffset.inMinutes,
        'serverTime': FieldValue.serverTimestamp(),
      };

      lastLoginInfo = {
        'app': appInfo,
        'device': deviceInfo,
        'auth': authInfo,
        'time': timeInfo,
        'session': {
          'id': now.millisecondsSinceEpoch.toString(),
          'source': 'auth.ensureUser',
        },
      };
    } catch (_) {
      // 失敗してもユーザー作成は継続
      lastLoginInfo = {};
    }

    if (!snapshot.exists) {
      // 新規ユーザー作成
      final uniqueDisplayId = await _generateUniqueDisplayId();
      await docRef.set({
        'displayId': uniqueDisplayId,
        'mutedIds': <String>[],
        'locale': localeCode,
        'region': {'country': 'jp', 'area': null, 'prefecture': null},
        'lastLoginInfo': lastLoginInfo,
        'createdAt': nowServer,
        'updatedAt': nowServer,
      });
      debugPrint('[AuthRepository] ユーザードキュメントを作成しました: ${user.uid}');
      return;
    }

    // 既存ユーザーの更新
    final data = snapshot.data() ?? <String, dynamic>{};
    final currentDisplayId = data['displayId'] as String?;
    final updates = <String, dynamic>{
      'updatedAt': nowServer,
      'lastLoginInfo': lastLoginInfo,
    };

    // displayIdがない場合は生成
    if (currentDisplayId == null || currentDisplayId.isEmpty) {
      final uniqueDisplayId = await _generateUniqueDisplayId();
      updates['displayId'] = uniqueDisplayId;
    }

    // localeがない場合は設定
    if (data['locale'] == null) {
      updates['locale'] = localeCode;
    }

    if (updates.length > 1) {
      await docRef.update(updates);
    }
  }

{{#ANONYMOUS_AUTH}}
  /// 匿名サインインしてユーザードキュメントを作成
  Future<UserCredential> signInAnonymouslyAndEnsureUserDoc({
    required String localeCode,
  }) async {
    try {
      final userCredential = await _auth.signInAnonymously();
      final user = userCredential.user;
      if (user == null) {
        throw FirebaseAuthException(
          code: 'internal-error',
          message: 'Anonymous sign-in returned null user',
        );
      }
      await _ensureUserDocument(user: user, localeCode: localeCode);
      debugPrint('[AuthRepository] 匿名サインイン成功: ${user.uid}');
      return userCredential;
    } catch (e) {
      debugPrint('[AuthRepository] 匿名サインインエラー: $e');
      rethrow;
    }
  }
{{/ANONYMOUS_AUTH}}

{{#GOOGLE_SIGNIN}}
  /// Googleサインインしてユーザードキュメントを作成
  Future<UserCredential> signInWithGoogleAndEnsureUserDoc({
    required String localeCode,
  }) async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('SIGN_IN_CANCELLED_BY_USER');
      }

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final user = userCredential.user;
      if (user == null) {
        throw FirebaseAuthException(
          code: 'internal-error',
          message: 'Google sign-in returned null user',
        );
      }
      await _ensureUserDocument(user: user, localeCode: localeCode);
      debugPrint('[AuthRepository] Googleサインイン成功: ${user.email}');
      return userCredential;
    } catch (e) {
      debugPrint('[AuthRepository] Googleサインインエラー: $e');
      rethrow;
    }
  }

{{#ANONYMOUS_AUTH}}
  /// 匿名ユーザーをGoogleアカウントにリンク
  Future<UserCredential> linkCurrentAnonymousWithGoogle({
    required String localeCode,
  }) async {
    final current = _auth.currentUser;
    if (current == null || !current.isAnonymous) {
      throw FirebaseAuthException(
        code: 'requires-recent-login',
        message: 'Current user must be anonymous to link',
      );
    }

    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) {
      throw Exception('SIGN_IN_CANCELLED_BY_USER');
    }

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await current.linkWithCredential(credential);
    final user = userCredential.user;
    if (user != null) {
      await _ensureUserDocument(user: user, localeCode: localeCode);
    }
    return userCredential;
  }
{{/ANONYMOUS_AUTH}}
{{/GOOGLE_SIGNIN}}

{{#APPLE_SIGNIN}}
  /// Appleサインインしてユーザードキュメントを作成
  Future<UserCredential> signInWithAppleAndEnsureUserDoc({
    required String localeCode,
  }) async {
    try {
      final appleIdCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final oauthCredential = OAuthProvider('apple.com').credential(
        idToken: appleIdCredential.identityToken,
        accessToken: appleIdCredential.authorizationCode,
      );

      final userCredential = await _auth.signInWithCredential(oauthCredential);
      final user = userCredential.user;
      if (user == null) {
        throw FirebaseAuthException(
          code: 'internal-error',
          message: 'Apple sign-in returned null user',
        );
      }
      await _ensureUserDocument(user: user, localeCode: localeCode);
      debugPrint('[AuthRepository] Appleサインイン成功: ${user.uid}');
      return userCredential;
    } catch (e) {
      debugPrint('[AuthRepository] Appleサインインエラー: $e');
      rethrow;
    }
  }

{{#ANONYMOUS_AUTH}}
  /// 匿名ユーザーをAppleアカウントにリンク
  Future<UserCredential> linkCurrentAnonymousWithApple({
    required String localeCode,
  }) async {
    final current = _auth.currentUser;
    if (current == null || !current.isAnonymous) {
      throw FirebaseAuthException(
        code: 'requires-recent-login',
        message: 'Current user must be anonymous to link',
      );
    }

    final appleIdCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );

    final oauthCredential = OAuthProvider('apple.com').credential(
      idToken: appleIdCredential.identityToken,
      accessToken: appleIdCredential.authorizationCode,
    );

    final userCredential = await current.linkWithCredential(oauthCredential);
    final user = userCredential.user;
    if (user != null) {
      await _ensureUserDocument(user: user, localeCode: localeCode);
    }
    return userCredential;
  }
{{/ANONYMOUS_AUTH}}
{{/APPLE_SIGNIN}}

  /// サインアウト
  Future<void> signOut() async {
    try {
{{#GOOGLE_SIGNIN}}
      await _googleSignIn.signOut();
{{/GOOGLE_SIGNIN}}
      await _auth.signOut();
      debugPrint('[AuthRepository] サインアウト成功');
    } catch (e) {
      debugPrint('[AuthRepository] サインアウトエラー: $e');
      rethrow;
    }
  }

  /// アカウント削除
  Future<void> deleteAccount() async {
    try {
      final user = _auth.currentUser;
      if (user != null) {
        // Firestoreのユーザードキュメントも削除
        await _db.collection('users').doc(user.uid).delete();
        await user.delete();
        debugPrint('[AuthRepository] アカウント削除成功');
      }
    } catch (e) {
      debugPrint('[AuthRepository] アカウント削除エラー: $e');
      rethrow;
    }
  }

{{#GOOGLE_SIGNIN}}
  /// 非匿名アカウントも含めて現在のユーザーにGoogleをリンク
  Future<UserCredential> linkCurrentWithGoogle({
    required String localeCode,
  }) async {
    final current = _auth.currentUser;
    if (current == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) {
      throw Exception('SIGN_IN_CANCELLED_BY_USER');
    }
    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final userCredential = await current.linkWithCredential(credential);
    await _ensureUserDocument(
      user: userCredential.user!,
      localeCode: localeCode,
    );
    return userCredential;
  }

  /// Googleで再認証
  Future<void> reauthenticateWithGoogle() async {
    final current = _auth.currentUser;
    if (current == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) {
      throw Exception('SIGN_IN_CANCELLED_BY_USER');
    }
    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    await current.reauthenticateWithCredential(credential);
  }
{{/GOOGLE_SIGNIN}}

{{#APPLE_SIGNIN}}
  /// 非匿名アカウントも含めて現在のユーザーにAppleをリンク
  Future<UserCredential> linkCurrentWithApple({
    required String localeCode,
  }) async {
    final current = _auth.currentUser;
    if (current == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    final appleIdCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    final oauthCredential = OAuthProvider('apple.com').credential(
      idToken: appleIdCredential.identityToken,
      accessToken: appleIdCredential.authorizationCode,
    );
    final userCredential = await current.linkWithCredential(oauthCredential);
    await _ensureUserDocument(
      user: userCredential.user!,
      localeCode: localeCode,
    );
    return userCredential;
  }

  /// Appleで再認証
  Future<void> reauthenticateWithApple() async {
    final current = _auth.currentUser;
    if (current == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    final appleIdCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    final oauthCredential = OAuthProvider('apple.com').credential(
      idToken: appleIdCredential.identityToken,
      accessToken: appleIdCredential.authorizationCode,
    );
    await current.reauthenticateWithCredential(oauthCredential);
  }
{{/APPLE_SIGNIN}}

{{#ANONYMOUS_AUTH}}
  /// 匿名ユーザーのみ削除
  Future<void> deleteCurrentUserIfAnonymous() async {
    final user = _auth.currentUser;
    if (user == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    if (!user.isAnonymous) {
      throw FirebaseAuthException(code: 'not-anonymous');
    }
    await user.delete();
  }
{{/ANONYMOUS_AUTH}}

  /// 現在のユーザーを削除（再認証が必要な場合があります）
  Future<void> deleteCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) {
      throw FirebaseAuthException(code: 'no-current-user');
    }
    await user.delete();
  }

  /// ログイン情報を更新
  Future<void> updateCurrentUserLoginInfo({
    required String localeCode,
  }) async {
    final user = _auth.currentUser;
    if (user == null) return;
    await _ensureUserDocument(user: user, localeCode: localeCode);
  }

  /// ユニークなdisplayIDを生成（衝突チェック付き）
  Future<String> _generateUniqueDisplayId() async {
    for (int i = 0; i < 30; i++) {
      final candidate = _generateDisplayIdCandidate();
      final taken = await _isDisplayIdTaken(candidate);
      if (!taken) return candidate;
    }
    // 衝突が続く場合はより長いIDを生成
    return _randomBase36(36);
  }

  /// displayID候補を生成（28文字のbase36）
  String _generateDisplayIdCandidate() {
    return _randomBase36(28);
  }

  /// displayIDが既に使用されているかチェック
  Future<bool> _isDisplayIdTaken(String candidate) async {
    final snap = await _db
        .collection('users')
        .where('displayId', isEqualTo: candidate)
        .limit(1)
        .get();
    return snap.docs.isNotEmpty;
  }

  /// ランダムなbase36文字列を生成
  String _randomBase36(int length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    final rng = math.Random.secure();
    final sb = StringBuffer();
    for (int i = 0; i < length; i++) {
      sb.write(chars[rng.nextInt(chars.length)]);
    }
    return sb.toString();
  }

  /// インストールストア情報を取得（Android）
  Future<String?> _getInstallerStore() async {
    try {
      if (!kIsWeb && Platform.isAndroid) {
        const channel = MethodChannel('com.{{APP_NAME}}/app');
        final String? store = await channel.invokeMethod('getInstallerStore');
        return store;
      }
    } catch (_) {}
    return null;
  }

  /// 通知許可ステータスを取得
  Future<String> _getNotificationPermissionStatus() async {
    try {
      final settings =
          await FirebaseMessaging.instance.getNotificationSettings();
      switch (settings.authorizationStatus) {
        case AuthorizationStatus.authorized:
          return 'authorized';
        case AuthorizationStatus.provisional:
          return 'provisional';
        case AuthorizationStatus.denied:
          return 'denied';
        case AuthorizationStatus.notDetermined:
          return 'notDetermined';
      }
    } catch (_) {}
    return 'unknown';
  }

  /// ATT（App Tracking Transparency）ステータスを取得（iOS）
  Future<String?> _getAttStatusIfAvailable() async {
    try {
      if (!kIsWeb && Platform.isIOS) {
        const channel = MethodChannel('com.{{APP_NAME}}/att');
        final String? status = await channel.invokeMethod('getAttStatus');
        return status;
      }
    } catch (_) {}
    return null;
  }
}

