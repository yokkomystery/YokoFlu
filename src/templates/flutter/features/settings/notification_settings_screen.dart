import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';

/// 通知設定画面
///
/// ユーザーが通知の種類ごとにON/OFFを切り替えられる画面。
/// Firestoreの users/{userId}/notificationSettings に設定を保存します。
///
/// TODO: 必要に応じて通知タイプを追加・削除してください
class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends ConsumerState<NotificationSettingsScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // デフォルトの通知設定
  // TODO: アプリの通知タイプに合わせてカスタマイズしてください
  final Map<String, bool> _defaultSettings = {
    'allNotificationsEnabled': true,
    'messageNotificationsEnabled': true,
    'likeNotificationsEnabled': true,
    'commentNotificationsEnabled': true,
    'followNotificationsEnabled': true,
    'systemNotificationsEnabled': true,
  };

  Map<String, bool> _currentSettings = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkNotificationPermission();
    _loadSettings();
  }

  /// 通知権限の状態をチェック
  Future<void> _checkNotificationPermission() async {
    await Future.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;

    final settings = await FirebaseMessaging.instance.getNotificationSettings();
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      if (!mounted) return;
      _showPermissionDeniedDialog();
    }
  }

  /// 権限が拒否されている場合のダイアログを表示
  void _showPermissionDeniedDialog() {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(l10n.notificationPermissionDeniedTitle),
          content: Text(l10n.notificationPermissionDeniedMessage),
          actions: <Widget>[
            TextButton(
              child: Text(l10n.cancel),
              onPressed: () => Navigator.of(dialogContext).pop(),
            ),
            TextButton(
              child: Text(l10n.notificationOpenSettings),
              onPressed: () async {
                Navigator.of(dialogContext).pop();
                await openAppSettings();
              },
            ),
          ],
        );
      },
    );
  }

  /// Firestoreから通知設定を読み込み
  Future<void> _loadSettings() async {
    final user = _auth.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final doc = await _firestore.collection('users').doc(user.uid).get();
      if (doc.exists) {
        final data = doc.data();
        final settings =
            data?['notificationSettings'] as Map<String, dynamic>?;
        if (settings != null) {
          setState(() {
            _currentSettings = Map<String, bool>.from(
              settings.map((key, value) => MapEntry(key, value as bool)),
            );
            _isLoading = false;
          });
          return;
        }
      }
      // ドキュメントが存在しない場合はデフォルト設定を使用
      setState(() {
        _currentSettings = Map<String, bool>.from(_defaultSettings);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('[NotificationSettings] 設定の読み込みに失敗: $e');
      setState(() {
        _currentSettings = Map<String, bool>.from(_defaultSettings);
        _isLoading = false;
      });
    }
  }

  /// 通知設定を更新
  Future<void> _updateSetting(String key, bool value) async {
    final user = _auth.currentUser;
    if (user == null) return;

    // ローカルの状態を即座に更新（UI反応のため）
    setState(() {
      _currentSettings[key] = value;
    });

    // ハプティックフィードバック
    HapticFeedback.lightImpact();

    try {
      // merge でネストされたフィールドを個別に更新
      await _firestore.collection('users').doc(user.uid).set({
        'notificationSettings': {key: value}
      }, SetOptions(merge: true));
      debugPrint('[NotificationSettings] 更新: $key = $value');
    } catch (e) {
      debugPrint('[NotificationSettings] 更新失敗: $e');
      // 失敗した場合は元に戻す
      setState(() {
        _currentSettings[key] = !value;
      });
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.notificationSettingsUpdateFailed)),
        );
      }
    }
  }

  bool _getSetting(String key) {
    return _currentSettings[key] ?? _defaultSettings[key] ?? true;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notificationSettingsTitle),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                // 全体の通知ON/OFF
                Card(
                  margin: const EdgeInsets.all(16),
                  child: SwitchListTile(
                    title: Text(
                      l10n.notificationSettingsAllTitle,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(l10n.notificationSettingsAllSubtitle),
                    value: _getSetting('allNotificationsEnabled'),
                    onChanged: (value) =>
                        _updateSetting('allNotificationsEnabled', value),
                  ),
                ),

                // 通知タイプごとの設定
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    l10n.notificationSettingsTypeSectionTitle,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                _buildNotificationTile(
                  key: 'messageNotificationsEnabled',
                  title: l10n.notificationSettingsMessageTitle,
                  subtitle: l10n.notificationSettingsMessageSubtitle,
                  icon: Icons.message,
                ),

                _buildNotificationTile(
                  key: 'likeNotificationsEnabled',
                  title: l10n.notificationSettingsLikeTitle,
                  subtitle: l10n.notificationSettingsLikeSubtitle,
                  icon: Icons.favorite,
                ),

                _buildNotificationTile(
                  key: 'commentNotificationsEnabled',
                  title: l10n.notificationSettingsCommentTitle,
                  subtitle: l10n.notificationSettingsCommentSubtitle,
                  icon: Icons.comment,
                ),

                _buildNotificationTile(
                  key: 'followNotificationsEnabled',
                  title: l10n.notificationSettingsFollowTitle,
                  subtitle: l10n.notificationSettingsFollowSubtitle,
                  icon: Icons.person_add,
                ),

                const Divider(height: 32),

                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Text(
                    l10n.notificationSettingsSystemSectionTitle,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                _buildNotificationTile(
                  key: 'systemNotificationsEnabled',
                  title: l10n.notificationSettingsSystemTitle,
                  subtitle: l10n.notificationSettingsSystemSubtitle,
                  icon: Icons.notifications_active,
                ),

                const SizedBox(height: 16),
              ],
            ),
    );
  }

  Widget _buildNotificationTile({
    required String key,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isEnabled = _getSetting('allNotificationsEnabled');

    return ListTile(
      leading: Icon(
        icon,
        color: isEnabled ? Theme.of(context).primaryColor : Colors.grey,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isEnabled ? null : Colors.grey,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          fontSize: 12,
          color: isEnabled ? Colors.grey[600] : Colors.grey[400],
        ),
      ),
      trailing: Switch(
        value: isEnabled && _getSetting(key),
        onChanged: isEnabled ? (value) => _updateSetting(key, value) : null,
      ),
    );
  }
}
