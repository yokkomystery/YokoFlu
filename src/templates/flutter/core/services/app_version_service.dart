import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/material.dart';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
import 'dart:io' show Platform;

/// アプリバージョン管理サービス
/// 
/// TODO: Firebase Remote Configで以下のキーを設定してください：
/// - forced_update_version_ios: 強制アップデートが必要な最小バージョン（iOS）
/// - forced_update_version_android: 強制アップデートが必要な最小バージョン（Android）
/// - recommended_update_version_ios: 推奨アップデートバージョン（iOS）
/// - recommended_update_version_android: 推奨アップデートバージョン（Android）
/// - is_maintenance_enabled: メンテナンスモード有効/無効
/// - maintenance_title: メンテナンスダイアログのタイトル
/// - maintenance_message: メンテナンスダイアログのメッセージ
class AppVersionService {
  static const String _rcKeyIsMaintenanceEnabled = 'is_maintenance_enabled';
  static const String _rcKeyMaintenanceTitle = 'maintenance_title';
  static const String _rcKeyMaintenanceMessage = 'maintenance_message';

  static String _rcKeyForcedUpdateVersion(String platform) =>
      'forced_update_version_$platform';
  static String _rcKeyRecommendedUpdateVersion(String platform) =>
      'recommended_update_version_$platform';

  /// バージョン比較（current < latest の場合にtrueを返す）
  static bool _isVersionOutdated(String current, String latest) {
    if (latest.isEmpty) return false;
    
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
      debugPrint('[VersionCheck] バージョン比較エラー: $e');
      return false;
    }
  }

  /// ストアURLを開く
  /// 
  /// TODO: 以下のストアURLを実際のアプリIDに置き換えてください
  static Future<void> _launchStoreUrl(BuildContext? context) async {
    String? storeUrl;
    
    // TODO: 実際のアプリIDに置き換えてください
    if (Platform.isIOS || Platform.isMacOS) {
      storeUrl = 'https://apps.apple.com/jp/app/YOUR_APP_ID';  // TODO: アプリIDを設定
    } else if (Platform.isAndroid) {
      storeUrl = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';  // TODO: パッケージ名を設定
    }

    if (storeUrl == null) {
      debugPrint('[AppVersionService] 未対応のプラットフォームです');
      return;
    }

    final uri = Uri.parse(storeUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context != null && context.mounted) {
        final localizations = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localizations.cannotOpenStoreErrorSnackbar),
          ),
        );
      }
    }
  }

  /// メンテナンスダイアログ表示
  static void _showMaintenanceDialog(
      BuildContext context, String title, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: const [], // メンテナンス中は操作不可
        );
      },
    );
  }

  /// 強制アップデートダイアログ表示
  static void _showForceUpdateDialog(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(localizations.updateRequiredTitle),
          content: Text(localizations.updateRequiredBody),
          actions: [
            ElevatedButton(
              onPressed: () => _launchStoreUrl(dialogContext),
              child: Text(localizations.updateButton),
            ),
          ],
        );
      },
    );
  }

  /// 推奨アップデートダイアログ表示
  static void _showRecommendedUpdateDialog(BuildContext context) {
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
                _launchStoreUrl(context);
              },
              child: Text(localizations.updateButton),
            ),
          ],
        );
      },
    );
  }

  /// アプリの状態をチェックして、必要に応じてダイアログを表示
  static Future<void> checkAppStatus(BuildContext context) async {
    final remoteConfig = FirebaseRemoteConfig.instance;

    try {
      await remoteConfig.setConfigSettings(RemoteConfigSettings(
        fetchTimeout: const Duration(seconds: 10),
        minimumFetchInterval: const Duration(hours: 1),
      ));
      await remoteConfig.fetchAndActivate();

      // メンテナンスチェック
      final isMaintenanceEnabled =
          remoteConfig.getBool(_rcKeyIsMaintenanceEnabled);

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
      if (Platform.isIOS || Platform.isMacOS) {
        platformKey = 'ios';
      } else if (Platform.isAndroid) {
        platformKey = 'android';
      } else {
        debugPrint('[AppVersionService] 未対応のプラットフォームです');
        return;
      }

      // 強制アップデートチェック
      final forcedVersion =
          remoteConfig.getString(_rcKeyForcedUpdateVersion(platformKey));
      debugPrint(
          '[AppVersionService] Current: $currentVersion, Forced: $forcedVersion on $platformKey');
      if (_isVersionOutdated(currentVersion, forcedVersion)) {
        _showForceUpdateDialog(context);
        return;
      }

      // 推奨アップデートチェック
      final recommendedVersion =
          remoteConfig.getString(_rcKeyRecommendedUpdateVersion(platformKey));
      debugPrint(
          '[AppVersionService] Current: $currentVersion, Recommended: $recommendedVersion on $platformKey');
      if (_isVersionOutdated(currentVersion, recommendedVersion)) {
        _showRecommendedUpdateDialog(context);
      }
    } catch (e) {
      debugPrint('[AppVersionService] Error: $e');
    }
  }
}

