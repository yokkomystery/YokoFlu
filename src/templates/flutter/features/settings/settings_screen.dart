import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'dart:io' show Platform;

import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
import 'package:{{APP_NAME}}/core/providers/theme_provider.dart';
import 'package:{{APP_NAME}}/core/providers/locale_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  PackageInfo? _packageInfo;

  @override
  void initState() {
    super.initState();
    _loadPackageInfo();
  }

  Future<void> _loadPackageInfo() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _packageInfo = packageInfo;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final themeNotifier = ref.watch(themeProvider.notifier);
    final currentTheme = ref.watch(themeProvider);
    final localeNotifier = ref.watch(localeProvider.notifier);
    final currentLocale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settingsScreenTitle)),
      body: ListView(
        children: [
          // 全般設定
          _buildSectionHeader(l10n.settingsGeneralSectionTitle),
          ListTile(
            leading: const Icon(Icons.brightness_6_outlined),
            title: Text(l10n.settingsThemeSettingListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showThemeDialog(context, l10n, themeNotifier),
          ),
          ListTile(
            leading: const Icon(Icons.language_outlined),
            title: Text('言語設定'),
            subtitle: Text(_getLocaleName(currentLocale)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLocaleDialog(context, l10n, localeNotifier),
          ),
{{#PUSH_NOTIFICATIONS_ENABLED}}
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: Text(l10n.settingsNotificationSettingListTileTitle),
            subtitle: Text('通知のオン/オフを設定'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Push通知設定画面への遷移は実装してください
              // 例: Navigator.push(context, MaterialPageRoute(builder: (context) => NotificationSettingsScreen()));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('通知設定画面の実装は開発者次第です'))
              );
            },
          ),
{{/PUSH_NOTIFICATIONS_ENABLED}}
          const Divider(),

{{#AUTH_SECTION_ENABLED}}
          _buildSectionHeader('認証機能'),
          _buildFeatureSummaryTile(
            icon: Icons.lock_outline,
            title: '有効なサインイン方法',
            description: '{{AUTH_METHOD_LABELS}}',
          ),
          const Divider(),
{{/AUTH_SECTION_ENABLED}}
{{#REMOTE_CONFIG_SECTION_ENABLED}}
          _buildSectionHeader('アプリ運用と配信管理'),
          _buildFeatureSummaryTile(
            icon: Icons.system_update_alt_outlined,
            title: '有効なリリース施策',
            description: '{{REMOTE_CONFIG_LABELS}}',
          ),
          const Divider(),
{{/REMOTE_CONFIG_SECTION_ENABLED}}
{{#ANALYTICS_SECTION_ENABLED}}
          _buildSectionHeader('分析・モニタリング'),
          _buildFeatureSummaryTile(
            icon: Icons.query_stats_outlined,
            title: '連携サービス',
            description: '{{ANALYTICS_LABELS}}',
          ),
          const Divider(),
{{/ANALYTICS_SECTION_ENABLED}}

          // サポート
          _buildSectionHeader(l10n.settingsSupportSectionTitle),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: Text(l10n.settingsTermsOfServiceListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _openTermsOfService(context),
            // TODO: Update _openTermsOfService() to navigate to your actual Terms of Service page.
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: Text(l10n.settingsPrivacyPolicyListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _openPrivacyPolicy(context),
            // TODO: Replace with link to your privacy policy.
          ),
          ListTile(
            leading: const Icon(Icons.contact_support_outlined),
            title: Text(l10n.settingsContactUsListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _openContactUs(context, l10n),
            // TODO: Updateお問い合わせ先に合わせた処理を実装してください。
          ),
          const Divider(),

          // アプリについて
          _buildSectionHeader(l10n.settingsAboutSectionTitle),
          ListTile(
            leading: const Icon(Icons.info_outlined),
            title: Text(l10n.settingsAboutAppListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showAboutDialog(context, l10n),
          ),
          ListTile(
            leading: const Icon(Icons.assignment_outlined),
            title: Text(l10n.settingsLicensesListTileTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLicenses(context),
          ),
{{#APP_RATING_ENABLED}}
          ListTile(
            leading: const Icon(Icons.star_rate),
            title: Text(l10n.rateAppTitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () async {
              // アプリ評価機能
              try {
                // TODO: AppRatingService のインスタンスを取得して評価を促す
                // 例: final ratingService = await AppRatingService.create();
                //     await ratingService.requestReviewManually();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('アプリ評価機能を使用するには AppRatingService を実装してください'))
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('評価機能の呼び出しに失敗しました: $e'))
                );
              }
            },
          ),
{{/APP_RATING_ENABLED}}
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return ListTile(
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
        ),
      ),
      dense: true,
    );
  }

  Widget _buildFeatureSummaryTile({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(
        description,
        style: const TextStyle(color: Colors.white70),
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('詳細設定は今後のバージョンで提供予定です'),
            duration: Duration(seconds: 2),
          ),
        );
      },
    );
  }

  void _showThemeDialog(
    BuildContext context,
    AppLocalizations l10n,
    ThemeNotifier themeNotifier,
  ) {
    final currentTheme = ref.watch(themeProvider);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.settingsSelectThemeDialogTitle),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<ThemeMode>(
              title: Text(l10n.settingsThemeLightMode),
              value: ThemeMode.light,
              groupValue: currentTheme,
              onChanged: (ThemeMode? value) {
                if (value != null) {
                  themeNotifier.setTheme(value);
                  Navigator.of(context).pop();
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: Text(l10n.settingsThemeDarkMode),
              value: ThemeMode.dark,
              groupValue: currentTheme,
              onChanged: (ThemeMode? value) {
                if (value != null) {
                  themeNotifier.setTheme(value);
                  Navigator.of(context).pop();
                }
              },
            ),
            RadioListTile<ThemeMode>(
              title: Text(l10n.settingsThemeSystemMode),
              value: ThemeMode.system,
              groupValue: currentTheme,
              onChanged: (ThemeMode? value) {
                if (value != null) {
                  themeNotifier.setTheme(value);
                  Navigator.of(context).pop();
                }
              },
            ),
          ],
        ),
        actions: <Widget>[
          TextButton(
            child: Text(l10n.settingsButtonLabelCancel),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  void _showLocaleDialog(
    BuildContext context,
    AppLocalizations l10n,
    LocaleNotifier localeNotifier,
  ) {
    final currentLocale = ref.watch(localeProvider);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('言語設定'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: LocaleNotifier.supportedLocales.map((locale) {
            return RadioListTile<Locale>(
              title: Text(_getLocaleName(locale)),
              value: locale,
              groupValue: currentLocale,
              onChanged: (Locale? value) {
                if (value != null) {
                  localeNotifier.setLocale(value);
                  Navigator.of(context).pop();
                }
              },
            );
          }).toList(),
        ),
        actions: <Widget>[
          TextButton(
            child: Text(l10n.settingsButtonLabelCancel),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  String _getLocaleName(Locale locale) {
    switch (locale.languageCode) {
      case 'ja':
        return '日本語';
      case 'en':
        return 'English';
      case 'ko':
        return '한국어';
      case 'zh':
        if (locale.countryCode == 'CN') {
          return '简体中文';
        } else if (locale.countryCode == 'TW') {
          return '繁體中文';
        }
        return '中文';
      default:
        return locale.languageCode;
    }
  }

  void _openTermsOfService(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final languageCode = Localizations.localeOf(context).languageCode;
    
    // TODO: 実際の利用規約URLに置き換えてください
    final termsUrl = 'https://example.com/terms_${languageCode}.html';
    _launchUrl(termsUrl);
  }

  void _openPrivacyPolicy(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final languageCode = Localizations.localeOf(context).languageCode;
    
    // TODO: 実際のプライバシーポリシーURLに置き換えてください
    final privacyUrl = 'https://example.com/privacy_${languageCode}.html';
    _launchUrl(privacyUrl);
  }

  void _openContactUs(BuildContext context, AppLocalizations l10n) async {
    final packageInfo = _packageInfo;
    if (packageInfo == null) return;

    // デバイス情報とアプリ情報を取得
    String appVersion = packageInfo.version;
    String deviceModel = 'Unknown';
    String osVersion = Platform.operatingSystemVersion;
    String locale = Localizations.localeOf(context).toString();

    final body = l10n.settingsEmailBodyContactUsWithoutUserIdNew(
      osVersion,
      appVersion,
      deviceModel,
      locale,
    );

    // TODO: 実際のサポートメールアドレスに置き換えてください
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: 'support@example.com', // TODO: サポートメールアドレスを設定
      queryParameters: {
        'subject': l10n.settingsEmailSubjectContactUs,
        'body': body,
      },
    );

    if (!await launchUrl(emailLaunchUri)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.settingsSnackbarCannotLaunchEmail),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _showAboutDialog(BuildContext context, AppLocalizations l10n) {
    final packageInfo = _packageInfo;
    if (packageInfo == null) return;

    showAboutDialog(
      context: context,
      applicationName: packageInfo.appName,
      applicationVersion: packageInfo.version,
      applicationIcon: const FlutterLogo(size: 64),
      children: [
        const SizedBox(height: 16),
        Text('Build: ${packageInfo.buildNumber}'),
        const SizedBox(height: 8),
        Text('Package: ${packageInfo.packageName}'),
      ],
    );
  }

  void _showLicenses(BuildContext context) {
    showLicensePage(
      context: context,
      applicationName: _packageInfo?.appName ?? 'App',
      applicationVersion: _packageInfo?.version ?? '1.0.0',
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('URLを開けませんでした: $url'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }
} 
