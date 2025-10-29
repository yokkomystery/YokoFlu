# YOKOFLU (Flutter Setup Tool)

**A comprehensive project setup tool for rapid Flutter app development**

Generate production-ready Flutter projects in minutes by simply selecting settings through the GUI. Automatically generates template code for commonly used features like Firebase integration, multi-language support, theme switching, and authentication.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yokkomystery/YokoFlu/actions/workflows/ci.yml/badge.svg)](https://github.com/yokkomystery/YokoFlu/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/yokkomystery/YokoFlu)](https://github.com/yokkomystery/YokoFlu/releases)
[![GitHub issues](https://img.shields.io/github/issues/yokkomystery/YokoFlu)](https://github.com/yokkomystery/YokoFlu/issues)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-blue)](https://flutter.dev/)

> 🌐 **日本語**: See [README_ja.md](README_ja.md)

> 💡 **This is a local-only tool.**  
> Run `npm run dev` on your machine, not deployed as a web hosting service.

> 🚀 **Quick Start**:
>
> ```bash
> git clone https://github.com/yokkomystery/yokoflu.git
> cd yokoflu
> npm install
> npm run dev
> # Open http://localhost:3000 in your browser
> ```

---

## Key Features

### App Templates (5 types)

- **Blank**: Minimal setup for free development
- **Counter**: Learn Flutter basics
- **TODO**: CRUD operations and local storage
- **Stopwatch**: Timer functionality
- **Chat**: Real-time chat using Firestore

### Advanced Features (11 optional features)

**App Management**: Forced updates, maintenance mode, app rating  
**Authentication**: Firebase anonymous auth, Google Sign-In, Apple Sign-In  
**Analytics & Monitoring**: Firebase Analytics, Crashlytics, Push notifications  
**UI/UX**: Onboarding screens

### Automation Features

- Automatic Flutter project creation
- Firebase environment separation (Staging/Production)
- Automatic iOS/Android configuration file generation
- Multi-language support (automatic ARB file generation)
- Theme switching functionality
- Settings screen template
- Automatic app icon generation
- Clean Architecture

> **Note:** Firebase console-side service activation and rule configuration are not automated. Please configure them manually following the instructions displayed after generation.

## Prerequisites

- Node.js 18 or higher
- Flutter SDK 3.x / Dart SDK 3.x
- Firebase CLI 13+ (`npm install -g firebase-tools`)
- flutterfire CLI (`dart pub global activate flutterfire_cli`)
- `firebase login` already completed

Verification commands:

```bash
flutter --version
dart --version
flutterfire --version
firebase --version && firebase projects:list
```

## Installation & Startup

### Prerequisites

**The following must be installed on your machine:**

- Node.js 18 or higher
- Flutter SDK 3.x / Dart SDK 3.x
- Firebase CLI 13+ (`npm install -g firebase-tools`)
- flutterfire CLI (`dart pub global activate flutterfire_cli`)

### Setup

```bash
# Clone repository
git clone https://github.com/yokkomystery/yokoflu.git
cd yokoflu

# Install dependencies
npm install

# Start development server
npm run dev
```

**Open http://localhost:3000 in your browser**

### Why Local Execution is Required?

This tool generates a Flutter project by executing CLI commands (`flutter create`, `flutterfire configure`, etc.) and writing files to the local filesystem. For this reason, it must be run locally on your machine.

#### What happens if hosted on the web?

If you try to deploy this tool to a web hosting service (Vercel, Netlify, etc.):

- ❌ Cannot execute local CLI commands on the server
- ❌ Cannot write files to the local filesystem
- ❌ Users cannot download the generated project

To host on the web, you would need:

- Implement features like downloading generated projects as zip files
- Major architectural changes (using cloud storage, etc.)

---

## Usage

1. **Fill in Basic Information**

   - App name (display name)
   - Project ID (for Firebase, lowercase letters/numbers/dashes)
   - Bundle ID (iOS, e.g., com.yourcompany.yourapp)
   - Package name (Android, e.g., com.yourcompany.yourapp)
   - Output directory

2. **Select App Template**

   - Choose from 5 templates (Blank, Counter, TODO, Stopwatch, Chat)

3. **Configure Firebase** (Optional)

   - Enable/disable Firebase
   - If enabled, select Staging/Production environment configuration
   - Select a Firebase project

4. **Select Basic Features**

   - Settings screen template (theme switching, language selection, etc.)

5. **Select Advanced Features** (Optional)

   - Select from 11 features (authentication, analytics, etc.)

6. **Submit**
   - The project is generated automatically
   - Follow the displayed instructions

---

## Generated Project Structure

```
yourapp/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── firebase_config.dart
│   │   └── services/
│   ├── features/
│   │   ├── auth/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── providers/
│   ├── l10n/
│   └── app_templates/
├── ios/
├── android/
└── pubspec.yaml
```

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Troubleshooting

**Flutter not found**: Install Flutter SDK and add to PATH

**Firebase CLI not found**: Install Firebase CLI with `npm install -g firebase-tools`

**flutterfire CLI not found**: Install with `dart pub global activate flutterfire_cli`

**Cannot access Firebase projects**: Execute `firebase login` and check permissions

**Project creation fails**: Ensure the project name doesn't already exist in the output directory

**CLI execution fails**: Review execution user permissions and shell environment (zsh/bash) initialization scripts

**`flutter pub get` fails**: Run `flutter pub get` directly and check dependencies, network settings, and `pubspec.yaml` descriptions

## Build Commands

### Android

```bash
# Staging (Development)
flutter run --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false

# Staging - APK (for test distribution)
flutter build apk --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release

# Staging - AAB (for Google Play)
flutter build appbundle --flavor staging --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release

# Production (Development)
flutter run --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true

# Production - APK (for test distribution)
flutter build apk --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release

# Production - AAB (for Google Play)
flutter build appbundle --flavor production --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release
```

### iOS

```bash
# Staging (Development)
flutter run --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false

# Staging - iOS Build
flutter build ios --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release

# Staging - IPA File
flutter build ipa --dart-define=ENVIRONMENT=staging --dart-define=PRODUCTION=false --release

# Production (Development)
flutter run --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true

# Production - iOS Build
flutter build ios --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release

# Production - IPA File
flutter build ipa --dart-define=ENVIRONMENT=production --dart-define=PRODUCTION=true --release
```

> **Note**: iOS does not support `--flavor` option. You need to manually select build configuration (Staging/Production) in Xcode.  
> **IPA File**: `flutter build ipa` automatically creates an archive and exports an IPA file to `build/ios/ipa/`.

## Author

**Satoshi Yokokawa（横川 智士）**

- Email: contact@mysterylog.com
- GitHub: [@yokkomystery](https://github.com/yokkomystery)

## License

MIT License - See [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Satoshi Yokokawa（横川 智士）

## Contact

- Email: contact@mysterylog.com
- Issue Report: [GitHub Issues](https://github.com/yokkomystery/yokoflu/issues)

---

**Made with ❤️ for Flutter developers**
