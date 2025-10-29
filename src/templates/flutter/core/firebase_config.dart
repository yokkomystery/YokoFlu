import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class FirebaseConfig {
  static String? _detectedEnvironment;

  static Future<void> initializeApp() async {
    print('[FIREBASE_CONFIG] Initializing Firebase...');
    
    {{#ENVIRONMENT_SEPARATION}}
    // iOSの場合、GoogleService-Info.plistから自動的に読み込まれる
    // firebase_config_script.shが環境に応じて正しいplistファイルをコピー済み
    // Androidの場合も、google-services.jsonから自動的に読み込まれる
    await Firebase.initializeApp();
    
    // 初期化後、実際のprojectIdから環境を判定
    final app = Firebase.app();
    final projectId = app.options.projectId;
    print('[FIREBASE_CONFIG] ProjectId: $projectId');
    
    if (projectId.contains('production') || projectId.contains('prod')) {
      _detectedEnvironment = 'production';
      print('[FIREBASE_CONFIG] 🏭 Using PRODUCTION Firebase configuration');
    } else if (projectId.contains('staging') || projectId.contains('stg')) {
      _detectedEnvironment = 'staging';
      print('[FIREBASE_CONFIG] 📱 Using STAGING Firebase configuration');
    } else {
      _detectedEnvironment = 'unknown';
      print('[FIREBASE_CONFIG] ⚠️  Unknown environment: $projectId');
    }
    {{/ENVIRONMENT_SEPARATION}}
    {{^ENVIRONMENT_SEPARATION}}
    // 単一環境の場合は、デフォルトのFirebase設定を使用
    await Firebase.initializeApp();
    _detectedEnvironment = 'production';
    print('[FIREBASE_CONFIG] Initialized with default configuration');
    {{/ENVIRONMENT_SEPARATION}}
    
    // TODO: Add any additional Firebase initialisation (Crashlytics, Analytics, etc.) here.
  }

  static String get currentEnvironment {
    return _detectedEnvironment ?? 'unknown';
  }
}
