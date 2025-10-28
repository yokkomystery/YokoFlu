import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
{{#GOOGLE_SIGNIN}}
import 'package:google_sign_in/google_sign_in.dart';
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
{{/APPLE_SIGNIN}}
import 'package:flutter/foundation.dart';

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

  /// ユーザードキュメントが存在しない場合は作成
  Future<void> _ensureUserDocument({
    required User user,
    required String localeCode,
  }) async {
    final userDoc = _db.collection('users').doc(user.uid);
    final snapshot = await userDoc.get();

    if (!snapshot.exists) {
      await userDoc.set({
        'createdAt': FieldValue.serverTimestamp(),
        'lastLoginAt': FieldValue.serverTimestamp(),
        'locale': localeCode,
        'displayName': user.displayName ?? '',
        'email': user.email ?? '',
        'photoURL': user.photoURL ?? '',
      });
      debugPrint('[AuthRepository] ユーザードキュメントを作成しました: ${user.uid}');
    } else {
      // ログイン時刻を更新
      await userDoc.update({
        'lastLoginAt': FieldValue.serverTimestamp(),
      });
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
}

