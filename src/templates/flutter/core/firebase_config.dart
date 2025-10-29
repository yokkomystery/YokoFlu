import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

{{#ENVIRONMENT_SEPARATION}}
import '../firebase_options_staging.dart' as staging;
import '../firebase_options_production.dart' as production;
{{/ENVIRONMENT_SEPARATION}}
{{^ENVIRONMENT_SEPARATION}}
import '../firebase_options.dart';
{{/ENVIRONMENT_SEPARATION}}

class FirebaseConfig {
  static Future<void> initializeApp() async {
    {{#ENVIRONMENT_SEPARATION}}
    if (String.fromEnvironment('ENVIRONMENT') == 'production') {
      await Firebase.initializeApp(
        options: production.DefaultFirebaseOptions.currentPlatform,
      );
    } else {
      // デフォルトはstaging環境（ENVIRONMENTが未指定またはstagingの場合）
      await Firebase.initializeApp(
        options: staging.DefaultFirebaseOptions.currentPlatform,
      );
    }
    {{/ENVIRONMENT_SEPARATION}}
    {{^ENVIRONMENT_SEPARATION}}
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    {{/ENVIRONMENT_SEPARATION}}
    // TODO: Add any additional Firebase initialisation (Crashlytics, Analytics, etc.) here.
  }

  static String get currentEnvironment {
    {{#ENVIRONMENT_SEPARATION}}
    if (String.fromEnvironment('ENVIRONMENT') == 'production') {
      return 'production';
    } else {
      return 'staging';
    }
    {{/ENVIRONMENT_SEPARATION}}
    {{^ENVIRONMENT_SEPARATION}}
    return 'production';
    {{/ENVIRONMENT_SEPARATION}}
  }
} 
