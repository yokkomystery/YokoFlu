import 'package:flutter/material.dart';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
{{#SETTINGS_ENABLED}}import 'package:{{APP_NAME}}/features/settings/settings_screen.dart';{{/SETTINGS_ENABLED}}

class CounterHomePage extends StatefulWidget {
  const CounterHomePage({super.key, required this.appName});

  final String appName;

  @override
  State<CounterHomePage> createState() => _CounterHomePageState();
}

class _CounterHomePageState extends State<CounterHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  void _decrementCounter() {
    setState(() {
      if (_counter > 0) _counter--;
    });
  }

  void _resetCounter() {
    setState(() {
      _counter = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Scaffold(
      appBar: AppBar(
        backgroundColor: colorScheme.inversePrimary,
        title: Text(widget.appName),
        elevation: 0,
        actions: [
{{#SETTINGS_ENABLED}}
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: AppLocalizations.of(context)!.settingsScreenTitle,
            onPressed: () {
              Navigator.push(
                context,
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
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(
                Icons.touch_app,
                size: 80,
                color: colorScheme.primary.withOpacity(0.3),
              ),
              const SizedBox(height: 32),
              Text(
                'ボタンを押した回数',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
                decoration: BoxDecoration(
                  color: colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: colorScheme.primary.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Text(
                  '$_counter',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 72,
                    color: colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(height: 48),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  FloatingActionButton.large(
                    onPressed: _decrementCounter,
                    tooltip: '減らす',
                    heroTag: 'decrement',
                    backgroundColor: Colors.orange,
                    child: const Icon(Icons.remove, size: 32),
                  ),
                  const SizedBox(width: 20),
                  FloatingActionButton.large(
                    onPressed: _resetCounter,
                    tooltip: 'リセット',
                    heroTag: 'reset',
                    backgroundColor: Colors.grey,
                    child: const Icon(Icons.refresh, size: 32),
                  ),
                  const SizedBox(width: 20),
                  FloatingActionButton.large(
                    onPressed: _incrementCounter,
                    tooltip: '増やす',
                    heroTag: 'increment',
                    backgroundColor: Colors.green,
                    child: const Icon(Icons.add, size: 32),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
