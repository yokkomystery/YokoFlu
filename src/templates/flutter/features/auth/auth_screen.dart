import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              colorScheme.primary.withOpacity(0.1),
              colorScheme.secondary.withOpacity(0.1),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // アプリロゴまたはアイコン
                  Icon(
                    Icons.lock_outline,
                    size: 80,
                    color: colorScheme.primary,
                  ),
                  const SizedBox(height: 24),
                  
                  // タイトル
                  Text(
                    l10n.authScreenTitle,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onBackground,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  
                  // サブタイトル
                  Text(
                    l10n.authScreenSubtitle,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: colorScheme.onBackground.withOpacity(0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),

                  // サインインボタン
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator())
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
{{#GOOGLE_SIGNIN}}
                        // Googleサインインボタン
                        _buildSignInButton(
                          context: context,
                          label: l10n.signInWithGoogle,
                          icon: Icons.g_mobiledata,
                          backgroundColor: Colors.white,
                          textColor: Colors.black87,
                          onPressed: () => _signInWithGoogle(context),
                        ),
                        const SizedBox(height: 16),
{{/GOOGLE_SIGNIN}}
{{#APPLE_SIGNIN}}
                        // Appleサインインボタン
                        _buildSignInButton(
                          context: context,
                          label: l10n.signInWithApple,
                          icon: Icons.apple,
                          backgroundColor: Colors.black,
                          textColor: Colors.white,
                          onPressed: () => _signInWithApple(context),
                        ),
                        const SizedBox(height: 16),
{{/APPLE_SIGNIN}}
{{#ANONYMOUS_AUTH}}
                        // 匿名サインインボタン
                        _buildSignInButton(
                          context: context,
                          label: l10n.signInAnonymously,
                          icon: Icons.person_outline,
                          backgroundColor: colorScheme.surfaceVariant,
                          textColor: colorScheme.onSurfaceVariant,
                          onPressed: () => _signInAnonymously(context),
                        ),
{{/ANONYMOUS_AUTH}}
                      ],
                    ),

                  const SizedBox(height: 32),
                  
                  // スキップボタン（匿名認証が有効な場合のみ）
{{#ANONYMOUS_AUTH}}
                  TextButton(
                    onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
                    child: Text(l10n.skipSignIn),
                  ),
{{/ANONYMOUS_AUTH}}
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignInButton({
    required BuildContext context,
    required String label,
    required IconData icon,
    required Color backgroundColor,
    required Color textColor,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, color: textColor),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor,
        foregroundColor: textColor,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 2,
      ),
    );
  }

{{#ANONYMOUS_AUTH}}
  Future<void> _signInAnonymously(BuildContext context) async {
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;
      
      await repository.signInAnonymouslyAndEnsureUserDoc(
        localeCode: localeCode,
      );
      
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.signInSuccessful),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${AppLocalizations.of(context)!.signInFailed}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
{{/ANONYMOUS_AUTH}}

{{#GOOGLE_SIGNIN}}
  Future<void> _signInWithGoogle(BuildContext context) async {
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;
      final isAnonymous = ref.read(isAnonymousProvider);
      
      if (isAnonymous) {
        // 匿名ユーザーの場合はリンク
        await repository.linkCurrentAnonymousWithGoogle(
          localeCode: localeCode,
        );
      } else {
        // 通常のサインイン
        await repository.signInWithGoogleAndEnsureUserDoc(
          localeCode: localeCode,
        );
      }
      
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.signInSuccessful),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${AppLocalizations.of(context)!.signInFailed}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
{{/GOOGLE_SIGNIN}}

{{#APPLE_SIGNIN}}
  Future<void> _signInWithApple(BuildContext context) async {
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final localeCode = ref.read(localeProvider).languageCode;
      final isAnonymous = ref.read(isAnonymousProvider);
      
      if (isAnonymous) {
        // 匿名ユーザーの場合はリンク
        await repository.linkCurrentAnonymousWithApple(
          localeCode: localeCode,
        );
      } else {
        // 通常のサインイン
        await repository.signInWithAppleAndEnsureUserDoc(
          localeCode: localeCode,
        );
      }
      
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.signInSuccessful),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${AppLocalizations.of(context)!.signInFailed}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
{{/APPLE_SIGNIN}}
}

