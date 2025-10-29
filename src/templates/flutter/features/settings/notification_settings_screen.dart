import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// 通知設定画面
/// 
/// ユーザーが通知の種類ごとにON/OFFを切り替えられる画面
/// 
/// TODO: 必要に応じて通知タイプを追加・削除してください
class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // デフォルトの通知設定
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
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('通知が無効になっています'),
          content: const Text(
              '通知を受け取るには、デバイスの設定で通知を有効にしてください。\n\n設定アプリを開きますか？'),
          actions: <Widget>[
            TextButton(
              child: const Text('キャンセル'),
              onPressed: () => Navigator.of(dialogContext).pop(),
            ),
            TextButton(
              child: const Text('設定を開く'),
              onPressed: () {
                Navigator.of(dialogContext).pop();
                openAppSettings();
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
            _currentSettings = Map<String, bool>.from(settings);
            _isLoading = false;
          });
          return;
        }
      }
      // ドキュメントが存在しない、またはsettingsがない場合はデフォルト設定を使用
      setState(() {
        _currentSettings = Map<String, bool>.from(_defaultSettings);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('通知設定の読み込みに失敗: $e');
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
      await _firestore.collection('users').doc(user.uid).set({
        'notificationSettings': {key: value}
      }, SetOptions(merge: true));
      debugPrint('通知設定を更新: $key = $value');
    } catch (e) {
      debugPrint('通知設定の更新に失敗: $e');
      // 失敗した場合は元に戻す
      setState(() {
        _currentSettings[key] = !value;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('設定の更新に失敗しました')),
        );
      }
    }
  }

  bool _getSetting(String key) {
    return _currentSettings[key] ?? _defaultSettings[key] ?? true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('通知設定'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                // 全体の通知ON/OFF
                Card(
                  margin: const EdgeInsets.all(16),
                  child: SwitchListTile(
                    title: const Text(
                      'すべての通知',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: const Text('すべての通知を一括でON/OFFできます'),
                    value: _getSetting('allNotificationsEnabled'),
                    onChanged: (value) =>
                        _updateSetting('allNotificationsEnabled', value),
                  ),
                ),

                // 通知タイプごとの設定
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    '通知タイプ',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                _buildNotificationTile(
                  key: 'messageNotificationsEnabled',
                  title: 'メッセージ通知',
                  subtitle: '新しいメッセージを受信したときに通知します',
                  icon: Icons.message,
                ),

                _buildNotificationTile(
                  key: 'likeNotificationsEnabled',
                  title: 'いいね通知',
                  subtitle: '投稿にいいねされたときに通知します',
                  icon: Icons.favorite,
                ),

                _buildNotificationTile(
                  key: 'commentNotificationsEnabled',
                  title: 'コメント通知',
                  subtitle: '投稿にコメントがあったときに通知します',
                  icon: Icons.comment,
                ),

                _buildNotificationTile(
                  key: 'followNotificationsEnabled',
                  title: 'フォロー通知',
                  subtitle: '新しいフォロワーがいるときに通知します',
                  icon: Icons.person_add,
                ),

                const Divider(height: 32),

                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Text(
                    'システム',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                _buildNotificationTile(
                  key: 'systemNotificationsEnabled',
                  title: 'システム通知',
                  subtitle: '重要なお知らせやアップデート情報を通知します',
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

