import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

/// RevenueCat サブスクリプションサービス
///
/// アプリ内課金・サブスクリプション管理を行う
///
/// TODO: RevenueCat ダッシュボードで以下の設定を行ってください：
/// - Offerings / Packages を作成
/// - Entitlements を設定（例: 'premium'）
/// - App Store Connect / Google Play Console と連携
///
/// TODO: 以下のAPIキーを実際の値に置き換えてください：
/// - _iosApiKey: RevenueCat iOS APIキー
/// - _androidApiKey: RevenueCat Android APIキー
///
/// TODO: 必要に応じて Entitlement ID を変更してください：
/// - _entitlementId: RevenueCatで設定したEntitlement ID

// TODO: 実際のRevenueCat APIキーに置き換えてください
const String _iosApiKey = 'YOUR_REVENUECAT_IOS_API_KEY';
const String _androidApiKey = 'YOUR_REVENUECAT_ANDROID_API_KEY';

// TODO: RevenueCatで設定したEntitlement IDに置き換えてください
const String _entitlementId = 'premium';

/// サブスクリプション状態
class SubscriptionState {
  final bool isSubscribed;
  final bool isInitializing;
  final List<Offering> offerings;
  final String? activeProductId;
  final DateTime? expirationDate;
  final String? error;

  const SubscriptionState({
    this.isSubscribed = false,
    this.isInitializing = true,
    this.offerings = const [],
    this.activeProductId,
    this.expirationDate,
    this.error,
  });

  SubscriptionState copyWith({
    bool? isSubscribed,
    bool? isInitializing,
    List<Offering>? offerings,
    String? activeProductId,
    DateTime? expirationDate,
    String? error,
  }) {
    return SubscriptionState(
      isSubscribed: isSubscribed ?? this.isSubscribed,
      isInitializing: isInitializing ?? this.isInitializing,
      offerings: offerings ?? this.offerings,
      activeProductId: activeProductId ?? this.activeProductId,
      expirationDate: expirationDate ?? this.expirationDate,
      error: error ?? this.error,
    );
  }
}

/// サブスクリプションサービス
class SubscriptionService extends ChangeNotifier {
  SubscriptionState _state = const SubscriptionState();
  SubscriptionState get state => _state;

  // 便利なゲッター
  bool get isSubscribed => _state.isSubscribed;
  bool get isInitializing => _state.isInitializing;
  List<Offering> get offerings => _state.offerings;

  /// RevenueCat の初期化
  ///
  /// アプリ起動時に一度だけ呼び出す
  Future<void> initialize() async {
    try {
      final apiKey = Platform.isIOS ? _iosApiKey : _androidApiKey;

      final configuration = PurchasesConfiguration(apiKey);
      await Purchases.configure(configuration);

      // デバッグモードの設定
      if (kDebugMode) {
        await Purchases.setLogLevel(LogLevel.debug);
      }

      // 購入状態の変更を監視
      Purchases.addCustomerInfoUpdateListener(_onCustomerInfoUpdated);

      // 初期状態を取得
      await refreshCustomerInfo();
      await fetchOfferings();

      _state = _state.copyWith(isInitializing: false);
      notifyListeners();

      debugPrint('✅ RevenueCat initialized successfully');
    } catch (e) {
      debugPrint('⚠️ RevenueCat initialization failed: $e');
      _state = _state.copyWith(
        isInitializing: false,
        error: e.toString(),
      );
      notifyListeners();
    }
  }

  /// CustomerInfo 更新時のコールバック
  void _onCustomerInfoUpdated(CustomerInfo customerInfo) {
    _updateSubscriptionStatus(customerInfo);
  }

  /// サブスクリプション状態を更新
  void _updateSubscriptionStatus(CustomerInfo customerInfo) {
    final entitlement = customerInfo.entitlements.all[_entitlementId];
    final isActive = entitlement?.isActive ?? false;

    _state = _state.copyWith(
      isSubscribed: isActive,
      activeProductId: entitlement?.productIdentifier,
      expirationDate: entitlement?.expirationDate != null
          ? DateTime.tryParse(entitlement!.expirationDate!)
          : null,
    );
    notifyListeners();

    debugPrint('📊 Subscription status updated: isActive=$isActive');
  }

  /// CustomerInfo を最新に更新
  Future<void> refreshCustomerInfo() async {
    try {
      final customerInfo = await Purchases.getCustomerInfo();
      _updateSubscriptionStatus(customerInfo);
    } catch (e) {
      debugPrint('❌ Failed to refresh customer info: $e');
    }
  }

  /// 利用可能なOfferings（プラン）を取得
  Future<void> fetchOfferings() async {
    try {
      final offerings = await Purchases.getOfferings();
      final availableOfferings = <Offering>[];

      if (offerings.current != null) {
        availableOfferings.add(offerings.current!);
      }

      _state = _state.copyWith(offerings: availableOfferings);
      notifyListeners();

      debugPrint('📊 Offerings fetched: ${availableOfferings.length} available');
    } catch (e) {
      debugPrint('❌ Failed to fetch offerings: $e');
    }
  }

  /// パッケージを購入
  ///
  /// 購入成功時は true、キャンセルまたは失敗時は false を返す
  Future<bool> purchasePackage(Package package) async {
    try {
      final customerInfo = await Purchases.purchasePackage(package);
      _updateSubscriptionStatus(customerInfo);

      final isActive =
          customerInfo.entitlements.all[_entitlementId]?.isActive ?? false;
      if (isActive) {
        debugPrint('✅ Purchase successful');
        return true;
      }
      return false;
    } on PlatformException catch (e) {
      final errorCode = PurchasesErrorHelper.getErrorCode(e);
      if (errorCode == PurchasesErrorCode.purchaseCancelledError) {
        debugPrint('📊 Purchase cancelled by user');
        return false;
      }
      debugPrint('❌ Purchase failed: $e');
      rethrow;
    }
  }

  /// 購入を復元
  Future<void> restorePurchases() async {
    try {
      final customerInfo = await Purchases.restorePurchases();
      _updateSubscriptionStatus(customerInfo);
      debugPrint('✅ Purchases restored successfully');
    } catch (e) {
      debugPrint('❌ Failed to restore purchases: $e');
      rethrow;
    }
  }
}

/// SubscriptionService の Riverpod プロバイダー
final subscriptionServiceProvider =
    ChangeNotifierProvider<SubscriptionService>((ref) {
  return SubscriptionService();
});
