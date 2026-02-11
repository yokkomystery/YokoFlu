import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app_tracking_transparency/app_tracking_transparency.dart';

/// App Tracking Transparency (ATT) サービス
///
/// iOS 14.5以降で必要なトラッキング許可リクエストを管理する
/// 広告の初期化前に呼び出すことを推奨
///
/// TODO: iOS の Info.plist に以下を追加してください：
/// <key>NSUserTrackingUsageDescription</key>
/// <string>パーソナライズされた広告を表示するために、トラッキングの許可をお願いします。</string>
///
/// ※ Android ではトラッキング許可は不要のため、自動的に authorized として扱う

/// ATT の許可状態
enum AttStatus {
  /// まだリクエストしていない
  notDetermined,

  /// ユーザーがリクエストを制限している
  restricted,

  /// ユーザーが拒否した
  denied,

  /// ユーザーが許可した
  authorized,
}

/// ATT サービス
class AttService {
  AttStatus _status = AttStatus.notDetermined;
  bool _isRequestInProgress = false;

  /// 現在の許可状態
  AttStatus get status => _status;

  /// トラッキングが許可されているかどうか
  bool get isAuthorized => _status == AttStatus.authorized;

  /// 現在のATTステータスを確認（ダイアログは表示しない）
  Future<AttStatus> checkStatus() async {
    if (!Platform.isIOS) {
      // Android ではトラッキング許可は不要
      _status = AttStatus.authorized;
      return _status;
    }

    try {
      final trackingStatus =
          await AppTrackingTransparency.trackingAuthorizationStatus;
      _status = _mapTrackingStatus(trackingStatus);
      debugPrint('📱 ATT status: $_status');
      return _status;
    } catch (e) {
      debugPrint('❌ Failed to check ATT status: $e');
      return _status;
    }
  }

  /// トラッキング許可をリクエスト
  ///
  /// iOS でのみ ATT ダイアログを表示する
  /// 広告の初期化前に呼び出すことを推奨
  ///
  /// [delay] ダイアログ表示前の待機時間（UX向上のため）
  Future<AttStatus> requestPermission({
    Duration delay = const Duration(seconds: 1),
  }) async {
    if (!Platform.isIOS) {
      _status = AttStatus.authorized;
      return _status;
    }

    if (_isRequestInProgress) {
      debugPrint('⚠️ ATT request already in progress');
      return _status;
    }

    // 既に決定済みの場合はリクエストしない
    final currentStatus =
        await AppTrackingTransparency.trackingAuthorizationStatus;
    if (currentStatus != TrackingStatus.notDetermined) {
      _status = _mapTrackingStatus(currentStatus);
      debugPrint('📱 ATT already determined: $_status');
      return _status;
    }

    _isRequestInProgress = true;
    try {
      // UX向上のため少し待つ
      await Future.delayed(delay);

      final result =
          await AppTrackingTransparency.requestTrackingAuthorization();
      _status = _mapTrackingStatus(result);
      debugPrint('📱 ATT request result: $_status');
      return _status;
    } catch (e) {
      debugPrint('❌ Failed to request ATT permission: $e');
      return _status;
    } finally {
      _isRequestInProgress = false;
    }
  }

  /// TrackingStatus を AttStatus に変換
  AttStatus _mapTrackingStatus(TrackingStatus trackingStatus) {
    switch (trackingStatus) {
      case TrackingStatus.notDetermined:
        return AttStatus.notDetermined;
      case TrackingStatus.restricted:
        return AttStatus.restricted;
      case TrackingStatus.denied:
        return AttStatus.denied;
      case TrackingStatus.authorized:
        return AttStatus.authorized;
      case TrackingStatus.notSupported:
        return AttStatus.authorized; // ATT非対応デバイスは許可扱い
    }
  }
}

/// AttService の Riverpod プロバイダー
final attServiceProvider = Provider<AttService>((ref) {
  return AttService();
});
