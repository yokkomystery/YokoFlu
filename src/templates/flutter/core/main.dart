import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
import 'package:{{APP_NAME}}/core/providers/theme_provider.dart';
import 'package:{{APP_NAME}}/core/providers/locale_provider.dart';
{{#SETTINGS_ENABLED}}import 'package:{{APP_NAME}}/features/settings/settings_screen.dart';
{{/SETTINGS_ENABLED}}
{{#ONBOARDING_ENABLED}}import 'package:{{APP_NAME}}/features/onboarding/onboarding_screen.dart';
import 'package:{{APP_NAME}}/features/onboarding/onboarding_state.dart';
{{/ONBOARDING_ENABLED}}{{#FIREBASE_ENABLED}}import 'package:{{APP_NAME}}/core/firebase_config.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kDebugMode;
{{/FIREBASE_ENABLED}}{{#PUSH_NOTIFICATIONS_ENABLED}}import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:{{APP_NAME}}/core/services/push_notification_service.dart';
{{/PUSH_NOTIFICATIONS_ENABLED}}{{#ANALYTICS_ENABLED}}import 'package:{{APP_NAME}}/core/services/analytics_service.dart';
{{/ANALYTICS_ENABLED}}{{#CRASHLYTICS_ENABLED}}import 'package:{{APP_NAME}}/core/services/crashlytics_service.dart';
{{/CRASHLYTICS_ENABLED}}{{#APP_RATING_ENABLED}}import 'package:{{APP_NAME}}/core/services/app_rating_service.dart';
{{/APP_RATING_ENABLED}}{{#ADMOB_ENABLED}}import 'package:{{APP_NAME}}/core/services/ad_service.dart';
{{/ADMOB_ENABLED}}{{#ATT_ENABLED}}import 'package:{{APP_NAME}}/core/services/att_service.dart';
{{/ATT_ENABLED}}{{#REVENUECAT_ENABLED}}import 'package:{{APP_NAME}}/core/services/subscription_service.dart';
{{/REVENUECAT_ENABLED}}

// MaterialApp のための GlobalKey
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
{{#PUSH_NOTIFICATIONS_ENABLED}}
// PushNotificationService のプロバイダー（navigatorKey を注入）
final notificationServiceProvider =
    Provider<PushNotificationService>((ref) {
  return PushNotificationService(navigatorKey: navigatorKey);
});
{{/PUSH_NOTIFICATIONS_ENABLED}}
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
{{#PUSH_NOTIFICATIONS_ENABLED}}
  // バックグラウンドメッセージハンドラの登録（Firebase初期化前に設定）
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
{{/PUSH_NOTIFICATIONS_ENABLED}}
{{#FIREBASE_ENABLED}}

  // Firebase初期化（失敗してもアプリは起動する）
  bool firebaseInitialized = false;
  String? firebaseError;
  try {
    await FirebaseConfig.initializeApp();
    firebaseInitialized = true;
    debugPrint('[App] Firebase initialized (${FirebaseConfig.currentEnvironment})');
  } catch (e, stackTrace) {
    firebaseError = e.toString();
    debugPrint('[App] Firebase initialization failed: $e');
    debugPrint('[App] Stack trace: $stackTrace');
    // Firebaseなしでもアプリを起動させる（オフライン機能のみ）
  }
{{/FIREBASE_ENABLED}}{{#PUSH_NOTIFICATIONS_ENABLED}}

  // Push通知を初期化（Firebase初期化後に実行）
  try {
    final notificationService = PushNotificationService(
      navigatorKey: navigatorKey,
    );
    await notificationService.initialize();
    debugPrint('[App] 🔔 Push notification initialized successfully');
  } catch (e) {
    debugPrint('[App] ⚠️ Push notification initialization failed: $e');
  }
{{/PUSH_NOTIFICATIONS_ENABLED}}{{#ANALYTICS_ENABLED}}

  // Firebase Analytics を初期化
  try {
    await AnalyticsService.initialize();
    debugPrint('[App] 📊 Firebase Analytics initialized successfully');
  } catch (e) {
    debugPrint('[App] ⚠️ Firebase Analytics initialization failed: $e');
  }
{{/ANALYTICS_ENABLED}}{{#CRASHLYTICS_ENABLED}}

  // Firebase Crashlytics を初期化
  try {
    await CrashlyticsService.initialize();
    debugPrint('[App] 🐛 Firebase Crashlytics initialized successfully');
  } catch (e) {
    debugPrint('[App] ⚠️ Firebase Crashlytics initialization failed: $e');
  }
{{/CRASHLYTICS_ENABLED}}{{#APP_RATING_ENABLED}}

  // アプリ評価機能の起動回数トラッキング
  try {
    final ratingService = await AppRatingService.create();
    await ratingService.trackAppLaunch();
    debugPrint('[App] ⭐ App rating tracking enabled');
  } catch (e) {
    debugPrint('[App] ⚠️ App rating initialization failed: $e');
  }
{{/APP_RATING_ENABLED}}{{#ATT_ENABLED}}

  // App Tracking Transparency（iOS 14.5以降で必須）
  try {
    final attStatus = await AttService.requestPermission();
    debugPrint('[App] 🔒 ATT status: $attStatus');
  } catch (e) {
    debugPrint('[App] ⚠️ ATT initialization failed: $e');
  }
{{/ATT_ENABLED}}{{#ADMOB_ENABLED}}

  // Google AdMob SDKの初期化
  try {
    final adService = AdService();
    await adService.initialize();
    debugPrint('[App] 📢 AdMob initialized successfully');
  } catch (e) {
    debugPrint('[App] ⚠️ AdMob initialization failed: $e');
  }
{{/ADMOB_ENABLED}}

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerStatefulWidget {
  const MyApp({super.key});

  @override
  ConsumerState<MyApp> createState() => _MyAppState();
}

class _MyAppState extends ConsumerState<MyApp> {
{{#ONBOARDING_ENABLED}}  bool _onboardingDismissed = false;

{{/ONBOARDING_ENABLED}}  @override
  void initState() {
    super.initState();
{{#FIREBASE_ENABLED}}
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAppStatusAndShowDialogs();
    });
{{/FIREBASE_ENABLED}}  }

  @override
  Widget build(BuildContext context) {
    // テーマとロケールの動的設定
    final currentThemeMode = ref.watch(themeProvider);
    final currentLocale = ref.watch(localeProvider);
{{#ONBOARDING_ENABLED}}
    final onboardingAsync = ref.watch(onboardingCompletedProvider);
    final isOnboardingCompleted = onboardingAsync.valueOrNull ?? false;
    final showOnboarding = !isOnboardingCompleted && !_onboardingDismissed;
{{/ONBOARDING_ENABLED}}
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: '{{APP_DISPLAY_NAME}}',
      debugShowCheckedModeBanner: false,
      locale: currentLocale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        {{SUPPORTED_LOCALES}}
      ],
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: currentThemeMode,
{{#ONBOARDING_ENABLED}}      home: showOnboarding
          ? OnboardingScreen(
              onComplete: () async {
                await completeOnboarding();
                ref.invalidate(onboardingCompletedProvider);
                setState(() {
                  _onboardingDismissed = true;
                });
              },
            )
          : const MyHomePage(title: '{{APP_DISPLAY_NAME}}'),
{{/ONBOARDING_ENABLED}}{{^ONBOARDING_ENABLED}}      home: const MyHomePage(title: '{{APP_DISPLAY_NAME}}'),
{{/ONBOARDING_ENABLED}}    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(l10n.homeTabLabel),
        {{#SETTINGS_ENABLED}}actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: l10n.settingsScreenTitle,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                ),
              );
            },
          ),
        ],
        {{/SETTINGS_ENABLED}}
      ),
      body: const HomeTabPlaceholder(),
    );
  }
}

class HomeTabPlaceholder extends StatelessWidget {
  const HomeTabPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.dashboard_customize,
            size: 48,
          ),
          const SizedBox(height: 16),
          Text(
            AppLocalizations.of(context)!.homePlaceholderTitle,
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            AppLocalizations.of(context)!.homePlaceholderDescription,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    AppLocalizations.of(context)!.homePlaceholderActionHint,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.playlist_add),
            label: Text(
              AppLocalizations.of(context)!.homePlaceholderActionLabel,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'TODO: Replace this placeholder with your actual home dashboard widgets.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
{{#FIREBASE_ENABLED}}

// Remote Config Keys
const String _rcKeyIsMaintenanceEnabled = 'is_maintenance_enabled';
const String _rcKeyMaintenanceTitle = 'maintenance_title';
const String _rcKeyMaintenanceMessage = 'maintenance_message';

String _rcKeyForcedUpdateVersion(String platform) =>
    'forced_update_version_$platform';
String _rcKeyRecommendedUpdateVersion(String platform) =>
    'recommended_update_version_$platform';

// バージョン比較ロジック
bool _isVersionOutdated(String current, String latest) {
  if (latest.isEmpty) {
    return false;
  }
  try {
    List<int> currentParts =
        current.split('.').map((e) => int.parse(e)).toList();
    List<int> latestParts = latest.split('.').map((e) => int.parse(e)).toList();

    while (currentParts.length < latestParts.length) currentParts.add(0);
    while (latestParts.length < currentParts.length) latestParts.add(0);

    for (int i = 0; i < latestParts.length; i++) {
      if (currentParts[i] < latestParts[i]) return true;
      if (currentParts[i] > latestParts[i]) return false;
    }
    return false;
  } catch (e) {
    debugPrint("[VersionCheck] バージョン比較でエラー: $e");
    return false;
  }
}

// ストアURLを開く
Future<void> _launchStoreUrl(String storeUrl, BuildContext? context) async {
  if (await canLaunchUrl(Uri.parse(storeUrl))) {
    await launchUrl(Uri.parse(storeUrl), mode: LaunchMode.externalApplication);
  } else {
    if (context != null && context.mounted) {
      final localizations = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            localizations.cannotOpenStoreErrorSnackbar,
          ),
        ),
      );
    }
  }
}

// メンテナンスダイアログ表示
void _showMaintenanceDialog(
    BuildContext context, String title, String message) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext dialogContext) {
      return AlertDialog(
        backgroundColor: const Color(0xFF333366),
        title: Text(title),
        content: Text(message),
        actions: const [], // メンテナンス中は操作不可
      );
    },
  );
}

// 強制アップデートダイアログ表示
void _showForceUpdateDialog(BuildContext context, String storeUrl) {
  final localizations = AppLocalizations.of(context)!;
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!context.mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(localizations.updateRequiredTitle),
          content: Text(localizations.updateRequiredBody),
          actions: [
            ElevatedButton(
              onPressed: () => _launchStoreUrl(storeUrl, dialogContext),
              child: Text(localizations.updateButton),
            ),
          ],
        );
      },
    );
  });
}

// 推奨アップデートダイアログ表示
void _showRecommendedUpdateDialog(BuildContext context, String storeUrl) {
  final localizations = AppLocalizations.of(context)!;
  showDialog(
    context: context,
    barrierDismissible: true,
    builder: (BuildContext dialogContext) {
      return AlertDialog(
        title: Text(localizations.updateAvailableTitle),
        content: Text(localizations.updateAvailableBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: Text(localizations.laterButton),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              _launchStoreUrl(storeUrl, context);
            },
            child: Text(localizations.updateButton),
          ),
        ],
      );
    },
  );
}

Future<void> _checkAppStatusAndShowDialogs() async {
  final remoteConfig = FirebaseRemoteConfig.instance;

  try {
    await remoteConfig.setConfigSettings(RemoteConfigSettings(
      fetchTimeout: const Duration(seconds: 10),
      minimumFetchInterval:
          kDebugMode ? Duration.zero : const Duration(hours: 1),
    ));
    await remoteConfig.fetchAndActivate();

    // メンテナンスチェック
    final isMaintenanceEnabled =
        remoteConfig.getBool(_rcKeyIsMaintenanceEnabled);

    // context をここで取得
    final context = navigatorKey.currentContext;
    if (context == null) {
      print("[AppStatusCheck] Navigator context is null when trying to show dialogs. Aborting for now.");
      return;
    }

    if (isMaintenanceEnabled) {
      final title = remoteConfig.getString(_rcKeyMaintenanceTitle).isNotEmpty
          ? remoteConfig.getString(_rcKeyMaintenanceTitle)
          : AppLocalizations.of(context)!.maintenanceTitleDefault;
      final message =
          remoteConfig.getString(_rcKeyMaintenanceMessage).isNotEmpty
              ? remoteConfig.getString(_rcKeyMaintenanceMessage)
              : AppLocalizations.of(context)!.maintenanceMessageDefault;
      _showMaintenanceDialog(context, title, message);
      return;
    }

    final packageInfo = await PackageInfo.fromPlatform();
    final currentVersion = packageInfo.version;

    String platformKey;
    if (Platform.isIOS)
      platformKey = 'ios';
    else if (Platform.isAndroid)
      platformKey = 'android';
    else if (Platform.isMacOS)
      platformKey = 'macos';
    else {
      debugPrint("[AppStatusCheck] Unsupported platform for update checks.");
      return;
    }

    // TODO: 実際のストアURLに置き換えてください
    String? storeUrl;
    if (Platform.isMacOS || Platform.isIOS) {
      storeUrl = "https://apps.apple.com/jp/app/YOUR_APP_STORE_ID"; // TODO: App Store IDを設定
    } else if (Platform.isAndroid) {
      storeUrl = "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"; // TODO: パッケージ名を設定
    }

    if (storeUrl == null || storeUrl.isEmpty) {
      debugPrint("[AppStatusCheck] Store URL for $platformKey is not configured or platform is unsupported.");
    }

    // 強制アップデートチェック
    final forcedVersion =
        remoteConfig.getString(_rcKeyForcedUpdateVersion(platformKey));
    debugPrint("[AppStatusCheck] Current: $currentVersion, Forced: $forcedVersion on $platformKey");
    if (_isVersionOutdated(currentVersion, forcedVersion)) {
      if (storeUrl != null && storeUrl.isNotEmpty) {
        _showForceUpdateDialog(context, storeUrl!);
        return;
      } else {
        debugPrint("[AppStatusCheck] Forced update required but no store URL for $platformKey.");
      }
    }

    // 推奨アップデートチェック
    final recommendedVersion =
        remoteConfig.getString(_rcKeyRecommendedUpdateVersion(platformKey));
    debugPrint("[AppStatusCheck] Current: $currentVersion, Recommended: $recommendedVersion on $platformKey");
    if (_isVersionOutdated(currentVersion, recommendedVersion)) {
      if (storeUrl != null && storeUrl.isNotEmpty) {
        _showRecommendedUpdateDialog(context, storeUrl!);
      } else {
        debugPrint("[AppStatusCheck] Recommended update available but no store URL for $platformKey.");
      }
    }
  } catch (e) {
    debugPrint("[AppStatusCheck] Error: $e");
  }
}
{{/FIREBASE_ENABLED}}
