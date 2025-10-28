import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// SharedPreferencesプロバイダー
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});

// テーマプロバイダー
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return ThemeNotifier(sharedPreferences);
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier(this._sharedPreferences) : super(ThemeMode.system) {
    _loadTheme();
  }

  final AsyncValue<SharedPreferences> _sharedPreferences;
  static const String _themeKey = 'selectedTheme';

  Future<void> _loadTheme() async {
    final prefs = await _sharedPreferences.when(
      data: (prefs) => prefs,
      loading: () => null,
      error: (_, __) => null,
    );

    if (prefs != null) {
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
  }

  Future<void> setTheme(ThemeMode themeMode) async {
    state = themeMode;
    
    final prefs = await _sharedPreferences.when(
      data: (prefs) => prefs,
      loading: () => null,
      error: (_, __) => null,
    );

    if (prefs != null) {
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