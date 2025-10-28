import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui' as ui;

// SharedPreferencesプロバイダー
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});

// ロケールプロバイダー
final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return LocaleNotifier(sharedPreferences);
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier(this._sharedPreferences) : super(_getDefaultLocale()) {
    _loadLocale();
  }

  final AsyncValue<SharedPreferences> _sharedPreferences;
  static const String _localeKey = 'selectedLocale';

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
    final prefs = await _sharedPreferences.when(
      data: (prefs) => prefs,
      loading: () => null,
      error: (_, __) => null,
    );

    if (prefs != null) {
      final localeString = prefs.getString(_localeKey);
      if (localeString != null) {
        final parts = localeString.split('_');
        if (parts.length == 1) {
          state = Locale(parts[0]);
        } else if (parts.length == 2) {
          state = Locale(parts[0], parts[1]);
        }
      }
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    
    final prefs = await _sharedPreferences.when(
      data: (prefs) => prefs,
      loading: () => null,
      error: (_, __) => null,
    );

    if (prefs != null) {
      String localeString;
      if (locale.countryCode != null) {
        localeString = '${locale.languageCode}_${locale.countryCode}';
      } else {
        localeString = locale.languageCode;
      }
      await prefs.setString(_localeKey, localeString);
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