import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// SharedPreferencesプロバイダー（共通で使用）
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});

// テーマプロバイダー（SharedPreferencesが準備できてから読み込む）
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier(ref);
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier(this._ref) : super(ThemeMode.system) {
    _init();
  }

  final Ref _ref;
  static const String _themeKey = 'selectedTheme';
  bool _isInitialized = false;

  Future<void> _init() async {
    // SharedPreferencesが準備できるのを待つ
    final prefsAsync = _ref.read(sharedPreferencesProvider);

    prefsAsync.whenData((prefs) {
      if (!_isInitialized) {
        _loadThemeFromPrefs(prefs);
        _isInitialized = true;
      }
    });

    // まだロードされていない場合は、準備ができたら再読み込み
    if (!_isInitialized) {
      try {
        final prefs = await SharedPreferences.getInstance();
        if (!_isInitialized) {
          _loadThemeFromPrefs(prefs);
          _isInitialized = true;
        }
      } catch (e) {
        debugPrint('[ThemeNotifier] SharedPreferences初期化エラー: $e');
      }
    }
  }

  void _loadThemeFromPrefs(SharedPreferences prefs) {
    final themeString = prefs.getString(_themeKey);
    if (themeString != null) {
      switch (themeString) {
        case 'light':
          state = ThemeMode.light;
          break;
        case 'dark':
          state = ThemeMode.dark;
          break;
        case 'system':
        default:
          state = ThemeMode.system;
          break;
      }
    }
  }

  Future<void> setTheme(ThemeMode themeMode) async {
    state = themeMode;

    try {
      final prefs = await SharedPreferences.getInstance();
      String themeString;
      switch (themeMode) {
        case ThemeMode.light:
          themeString = 'light';
          break;
        case ThemeMode.dark:
          themeString = 'dark';
          break;
        case ThemeMode.system:
        default:
          themeString = 'system';
          break;
      }
      await prefs.setString(_themeKey, themeString);
    } catch (e) {
      debugPrint('[ThemeNotifier] テーマ保存エラー: $e');
    }
  }
}

// アプリテーマの定義
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.dark,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
