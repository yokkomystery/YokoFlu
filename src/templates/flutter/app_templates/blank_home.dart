import 'package:flutter/material.dart';
{{#SETTINGS_ENABLED}}import 'package:{{APP_NAME}}/features/settings/settings_screen.dart';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';{{/SETTINGS_ENABLED}}

class BlankHomePage extends StatelessWidget {
  const BlankHomePage({super.key, required this.appName});

  final String appName;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(appName),
        backgroundColor: colorScheme.surface,
        elevation: 0,
        actions: [
{{#SETTINGS_ENABLED}}
          IconButton(
            tooltip: AppLocalizations.of(context)!.settingsScreenTitle,
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const SettingsScreen(),
                ),
              );
            },
          ),
{{/SETTINGS_ENABLED}}
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(
                Icons.widgets_outlined,
                size: 88,
                color: colorScheme.primary,
              ),
              const SizedBox(height: 24),
              Text(
                'ここから開発を始めましょう',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              Text(
                'ブランクテンプレートは UI 要素を含まない最小構成です。'
                '必要なウィジェットを追加してアプリの骨組みを整えてください。',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white70,
                    ),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                icon: const Icon(Icons.add),
                label: const Text('最初のウィジェットを追加'),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('lib/ 以下に自由にファイルを追加してください'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
