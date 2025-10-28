import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:{{APP_NAME}}/features/auth/auth_repository.dart';

/// Firebase Authのプロバイダー
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

/// 認証リポジトリのプロバイダー
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

/// 認証状態のストリームプロバイダー
final authStateProvider = StreamProvider<User?>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  return auth.authStateChanges();
});

/// 現在のユーザープロバイダー
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) => user,
    loading: () => null,
    error: (_, __) => null,
  );
});

/// ユーザーがサインイン済みかどうか
final isSignedInProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user != null;
});

/// ユーザーが匿名ユーザーかどうか
final isAnonymousProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.isAnonymous ?? false;
});

/// ユーザードキュメントのストリームプロバイダー
final userDocStreamProvider =
    StreamProvider<DocumentSnapshot<Map<String, dynamic>>?>((ref) {
  final authAsync = ref.watch(authStateProvider);
  return authAsync.when(
    data: (user) {
      if (user == null) return Stream.value(null);
      return FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .snapshots();
    },
    loading: () => Stream.value(null),
    error: (_, __) => Stream.value(null),
  );
});

/// displayIDプロバイダー
final displayIdProvider = Provider<String?>((ref) {
  final snapAsync = ref.watch(userDocStreamProvider);
  return snapAsync.maybeWhen(
    data: (snap) => snap?.data()?['displayId'] as String?,
    orElse: () => null,
  );
});

/// ユーザードキュメントデータプロバイダー
final userDocDataProvider = Provider<Map<String, dynamic>?>((ref) {
  final snapAsync = ref.watch(userDocStreamProvider);
  return snapAsync.maybeWhen(
    data: (snap) => snap?.data(),
    orElse: () => null,
  );
});

