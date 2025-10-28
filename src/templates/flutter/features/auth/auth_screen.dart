import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
{{#APPLE_SIGNIN}}
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
{{/APPLE_SIGNIN}}
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
import 'package:{{APP_NAME}}/features/auth/auth_provider.dart';
import 'package:{{APP_NAME}}/core/providers/locale_provider.dart';

/// 認証画面
/// 
/// 有効化された認証方法に応じてサインインボタンを表示します
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colorScheme = Theme.of(context).colorScheme;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('{{APP_NAME}}'),
        automaticallyImplyLeading: true,
      ),
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: MediaQuery.of(context).size.width * 0.08,
                vertical: 32,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 16),
                  // アプリアイコン表示（assets/icons/app_icon.pngがある場合）
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: colorScheme.primary.withOpacity(0.12),
                            blurRadius: 24,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.lock_outline,
                        size: 64,
                        color: colorScheme.primary,
                      ),
                      // TODO: アプリアイコンがある場合は以下のように表示
                      // child: ClipRRect(
                      //   borderRadius: BorderRadius.circular(28),
                      //   child: Image.asset(
                      //     'assets/icons/app_icon.png',
                      //     fit: BoxFit.cover,
                      //   ),
                      // ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // タイトル
                  Text(
                    l10n.authScreenTitle,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // サブタイトル
                  Text(
                    l10n.authScreenSubtitle,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // サインインボタン
{{#GOOGLE_SIGNIN}}
                  ElevatedButton.icon(
                    icon: const Icon(Icons.g_mobiledata, color: Colors.white),
                    label: Text(
                      l10n.signInWithGoogle,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    onPressed: _isLoading ? null : _signInWithGoogle,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
                  ElevatedButton.icon(
                    icon: const Icon(Icons.apple, color: Colors.white),
                    label: Text(
                      l10n.signInWithApple,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    onPressed: _isLoading ? null : _signInWithApple,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black87,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
{{/APPLE_SIGNIN}}
{{#ANONYMOUS_AUTH}}
                  OutlinedButton.icon(
                    icon: const Icon(Icons.visibility_outlined),
                    label: Text(l10n.signInAnonymously),
                    onPressed: _isLoading ? null : _signInAnonymously,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      side: BorderSide(
                        color: theme.colorScheme.outline.withOpacity(0.5),
                      ),
                    ),
                  ),
{{/ANONYMOUS_AUTH}}

                  const Spacer(),

                  // TODO: 利用規約とプライバシーポリシーへのリンクを追加する場合
                  // const SizedBox(height: 8),
                  // Text.rich(
                  //   TextSpan(
                  //     text: 'By continuing, you agree to our ',
                  //     children: [
                  //       TextSpan(
                  //         text: 'Terms of Service',
                  //         style: TextStyle(
                  //           decoration: TextDecoration.underline,
                  //           color: theme.colorScheme.primary,
                  //         ),
                  //         recognizer: TapGestureRecognizer()..onTap = _openTerms,
                  //       ),
                  //       const TextSpan(text: ' and '),
                  //       TextSpan(
                  //         text: 'Privacy Policy',
                  //         style: TextStyle(
                  //           decoration: TextDecoration.underline,
                  //           color: theme.colorScheme.primary,
                  //         ),
                  //         recognizer: TapGestureRecognizer()..onTap = _openPrivacy,
                  //       ),
                  //     ],
                  //   ),
                  //   textAlign: TextAlign.center,
                  //   style: theme.textTheme.bodySmall,
                  // ),
                ],
              ),
            ),
            // ローディングオーバーレイ
            if (_isLoading)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withOpacity(0.25),
                  child: const Center(child: CircularProgressIndicator()),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

{{#ANONYMOUS_AUTH}}
  Future<void> _signInAnonymously() async {
    if (_isLoading) return;
    final l10n = AppLocalizations.of(context)!;
    setState(() => _isLoading = true);

    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;

      await repository.signInAnonymouslyAndEnsureUserDoc(
        localeCode: localeCode,
      );

      _showSnack(l10n.signInSuccessful);
      if (mounted) Navigator.of(context).pop();
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthScreen] Anonymous sign-in failed: ${e.code}');
      _showSnack(l10n.signInFailed);
    } catch (e) {
      debugPrint('[AuthScreen] Anonymous sign-in error: $e');
      _showSnack(l10n.signInFailed);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
{{/ANONYMOUS_AUTH}}

{{#GOOGLE_SIGNIN}}
  Future<void> _signInWithGoogle() async {
    if (_isLoading) return;
    final l10n = AppLocalizations.of(context)!;
    setState(() => _isLoading = true);

    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;
      final isAnonymous = ref.read(isAnonymousProvider);

      if (isAnonymous) {
        await repository.linkCurrentAnonymousWithGoogle(
          localeCode: localeCode,
        );
      } else {
        await repository.signInWithGoogleAndEnsureUserDoc(
          localeCode: localeCode,
        );
      }

      _showSnack(l10n.signInSuccessful);
      if (mounted) Navigator.of(context).pop();
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthScreen] Google sign-in FirebaseAuthException: ${e.code}');
      String msg;
      switch (e.code) {
        case 'network-request-failed':
          msg = l10n.networkError ?? 'Network error occurred';
          break;
        case 'user-disabled':
          msg = l10n.accountDisabled ?? 'This account is disabled';
          break;
        case 'account-exists-with-different-credential':
          msg = l10n.accountExistsWithDifferentCredential ??
              'Account exists with different credential';
          break;
        default:
          msg = l10n.signInFailed;
      }
      _showSnack(msg);
    } on Exception catch (e) {
      if (e.toString().contains('SIGN_IN_CANCELLED_BY_USER')) return;
      debugPrint('[AuthScreen] Google sign-in failed: $e');
      _showSnack(l10n.signInFailed);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
{{/GOOGLE_SIGNIN}}

{{#APPLE_SIGNIN}}
  Future<void> _signInWithApple() async {
    if (_isLoading) return;
    final l10n = AppLocalizations.of(context)!;
    setState(() => _isLoading = true);

    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;
      final isAnonymous = ref.read(isAnonymousProvider);

      if (isAnonymous) {
        await repository.linkCurrentAnonymousWithApple(
          localeCode: localeCode,
        );
      } else {
        await repository.signInWithAppleAndEnsureUserDoc(
          localeCode: localeCode,
        );
      }

      _showSnack(l10n.signInSuccessful);
      if (mounted) Navigator.of(context).pop();
    } on SignInWithAppleAuthorizationException catch (e) {
      if (e.code == AuthorizationErrorCode.canceled ||
          e.code.toString() == '1001') {
        return;
      }
      debugPrint('[AuthScreen] Apple sign-in auth exception: ${e.code}');
      _showSnack(l10n.signInFailed);
    } on FirebaseAuthException catch (e) {
      debugPrint('[AuthScreen] Apple sign-in FirebaseAuthException: ${e.code}');
      String msg;
      switch (e.code) {
        case 'network-request-failed':
          msg = l10n.networkError ?? 'Network error occurred';
          break;
        case 'user-disabled':
          msg = l10n.accountDisabled ?? 'This account is disabled';
          break;
        case 'account-exists-with-different-credential':
          msg = l10n.accountExistsWithDifferentCredential ??
              'Account exists with different credential';
          break;
        default:
          msg = l10n.signInFailed;
      }
      _showSnack(msg);
    } on Exception catch (e) {
      if (e.toString().contains('SIGN_IN_CANCELLED_BY_USER')) return;
      debugPrint('[AuthScreen] Apple sign-in failed: $e');
      _showSnack(l10n.signInFailed);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
{{/APPLE_SIGNIN}}
}

