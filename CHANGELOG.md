# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Authentication UI (New Feature)
- 🔐 **Complete authentication UI implementation**
  - Login screen with support for Anonymous, Google, and Apple sign-in
  - Authentication state management using Riverpod providers
  - Integrated sign-in/sign-out functionality in settings screen
  - User profile display with avatar and account details
  - Account upgrade flow for anonymous users
  - Account deletion with confirmation dialog
- 📱 **New template files**
  - `auth_screen.dart` - Beautiful login screen with gradient background
  - `auth_provider.dart` - Centralized auth state management
  - Updated `settings_screen.dart` with auth section
- 🌍 **Multilingual support**
  - Added 20+ new localization keys for authentication UI
  - Full support for Japanese and English
- 🎨 **Modern UI/UX**
  - Platform-specific sign-in buttons (Google, Apple, Anonymous)
  - Conditional rendering based on selected auth methods
  - Smooth transitions and user feedback
- ✅ **Auto-generation**
  - Auth UI files automatically generated when auth features are selected
  - Seamless integration with existing advanced features system

## [1.0.0] - 2025-10-28

### Added

#### Core Features
- 🚀 GUI-based Flutter project setup tool
- 📱 5 app templates (Blank, Counter, TODO, Stopwatch, Chat)
- ⚙️ 11 advanced features (forced update, maintenance mode, auth, analytics, etc.)
- 🔥 Firebase integration with staging/production environment separation
- 🌍 Multi-language support (Japanese, English)
- 🎨 Theme switching capability (Light/Dark/System)
- 🏗️ Clean architecture for production-ready apps
- 🖼️ Automatic app icon generation

#### Auto-dependency Resolution (v1.0.0 Highlight)
- 🔍 **Auto-detect Flutter SDK version** - Detects user's Flutter SDK and selects compatible packages
- 📦 **Dynamic package version management** - 4 version sets supporting Flutter 3.0-3.24+
- ✅ **Auto-resolve dependency conflicts** - Success rate improved from 60-70% to ~95%
- 🎯 **Broad SDK compatibility** - Works with all Dart SDK 3.x / Flutter 3.x versions

#### Enhanced Error Handling
- 🐛 Error messages separated: GUI (concise) + Terminal (detailed)
- 📝 Categorized error types: version conflicts, SDK issues, network errors
- 💡 Specific troubleshooting steps for each error type
- 📊 Error visibility in ProgressBar with actionable hints

#### Developer Experience
- ✅ Automatic Flutter project creation
- ✅ iOS/Android configuration
- ✅ Firebase service activation guide
- ✅ Comprehensive documentation (Japanese/English)
- ✅ Real-time progress tracking with error details
- ✅ CLI status checking (Flutter, Dart, Firebase, flutterfire)

### Fixed

- 🐛 **Critical:** YAML syntax error - Added quotes to SDK constraints
- 🐛 **Critical:** Dart SDK version mismatch - Use compatible constraint `>=3.0.0 <4.0.0`
- 🐛 ProgressBar not showing error details - Now displays error messages
- 🐛 Error state not visible - ProgressBar stays open with "⚠️ エラーが発生しました"
- 🐛 Existing directory error unclear - Added path and deletion command

### Changed

- 🔧 Firebase defaults to **disabled** (opt-in instead of opt-out)
- 📦 Updated all package versions to latest stable
- 📚 Added status badges to README (CI, releases, issues)

---

For full details, see [README.md](README.md)
