import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui' as ui;

// ロケールプロバイダー
final localeProvider = NotifierProvider<LocaleNotifier, Locale>(
  LocaleNotifier.new,
);

class LocaleNotifier extends Notifier<Locale> {
  static const String _localeKey = 'selectedLocale';
  bool _hasLoaded = false;

  @override
  Locale build() {
    if (!_hasLoaded) {
      Future.microtask(_loadLocale);
    }
    return _getDefaultLocale();
  }

  // システムのロケールを基にデフォルト言語を決定（日本語または英語を優先）
  static Locale _getDefaultLocale() {
    final systemLocale = ui.PlatformDispatcher.instance.locale;
    
    // システムが日本語の場合は日本語、それ以外は英語
    if (systemLocale.languageCode == 'ja') {
      return const Locale('ja');
    } else {
      return const Locale('en');
    }
  }

  Future<void> _loadLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_hasLoaded) {
        return;
      }

      final localeString = prefs.getString(_localeKey);
      if (localeString != null) {
        final parts = localeString.split('_');
        if (parts.length == 1) {
          state = Locale(parts[0]);
        } else if (parts.length == 2) {
          state = Locale(parts[0], parts[1]);
        }
      }
      _hasLoaded = true;
    } catch (e) {
      debugPrint('[LocaleNotifier] ロケール読み込みエラー: $e');
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;

    try {
      final prefs = await SharedPreferences.getInstance();
      String localeString;
      if (locale.countryCode != null) {
        localeString = '${locale.languageCode}_${locale.countryCode}';
      } else {
        localeString = locale.languageCode;
      }
      await prefs.setString(_localeKey, localeString);
      _hasLoaded = true;
    } catch (e) {
      debugPrint('[LocaleNotifier] ロケール保存エラー: $e');
    }
  }

  // 利用可能なロケールのリスト
  // TODO: このリストはアプリ生成時に選択された言語に応じて自動生成されます
  static const List<Locale> supportedLocales = [
    {{SUPPORTED_LOCALES}}
  ];

  // ロケール名を取得
  String getLocaleName(Locale locale) {
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
}
