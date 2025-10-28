import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:{{APP_NAME}}/l10n/app_localizations.dart';
{{#SETTINGS_ENABLED}}import 'package:{{APP_NAME}}/features/settings/settings_screen.dart';{{/SETTINGS_ENABLED}}
import 'dart:async';

class StopwatchHomePage extends StatefulWidget {
  const StopwatchHomePage({super.key, required this.appName});

  final String appName;

  @override
  State<StopwatchHomePage> createState() => _StopwatchHomePageState();
}

class _StopwatchHomePageState extends State<StopwatchHomePage> {
  Timer? _timer;
  int _elapsedMilliseconds = 0;
  bool _isRunning = false;
  final List<int> _laps = [];

  void _startStop() {
    if (_isRunning) {
      _timer?.cancel();
      setState(() {
        _isRunning = false;
      });
    } else {
      _timer = Timer.periodic(const Duration(milliseconds: 10), (timer) {
        setState(() {
          _elapsedMilliseconds += 10;
        });
      });
      setState(() {
        _isRunning = true;
      });
    }
  }

  void _reset() {
    _timer?.cancel();
    setState(() {
      _elapsedMilliseconds = 0;
      _isRunning = false;
      _laps.clear();
    });
  }

  void _lap() {
    if (_isRunning) {
      setState(() {
        _laps.insert(0, _elapsedMilliseconds);
      });
    }
  }

  String _formatTime(int milliseconds) {
    final hours = (milliseconds ~/ 3600000).toString().padLeft(2, '0');
    final minutes = ((milliseconds % 3600000) ~/ 60000).toString().padLeft(2, '0');
    final seconds = ((milliseconds % 60000) ~/ 1000).toString().padLeft(2, '0');
    final ms = ((milliseconds % 1000) ~/ 10).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds.$ms';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
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
      body: Column(
        children: [
          const SizedBox(height: 60),
          // 時間表示
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: colorScheme.primary.withOpacity(0.2),
                  blurRadius: 30,
                  offset: const Offset(0, 15),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  _isRunning ? Icons.timer : Icons.timer_outlined,
                  size: 48,
                  color: colorScheme.primary,
                ),
                const SizedBox(height: 16),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    _formatTime(_elapsedMilliseconds),
                    style: TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      fontFeatures: const [FontFeature.tabularFigures()],
                      color: colorScheme.primary,
                      letterSpacing: 1.5,
                      height: 1,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),
          // コントロールボタン
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton(
                  onPressed: _reset,
                  icon: Icons.refresh,
                  label: 'リセット',
                  color: Colors.grey[700]!,
                ),
                _buildControlButton(
                  onPressed: _lap,
                  icon: Icons.flag,
                  label: 'ラップ',
                  color: Colors.blue,
                  isEnabled: _isRunning,
                ),
                _buildControlButton(
                  onPressed: _startStop,
                  icon: _isRunning ? Icons.pause : Icons.play_arrow,
                  label: _isRunning ? 'ストップ' : 'スタート',
                  color: _isRunning ? Colors.orange : Colors.green,
                  isLarge: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          // ラップタイム一覧
          if (_laps.isNotEmpty) ...[
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'ラップタイム',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text(
                    '${_laps.length}件',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _laps.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: CircleAvatar(
                      child: Text('${_laps.length - index}'),
                    ),
                    title: Text(
                      _formatTime(_laps[index]),
                      style: const TextStyle(
                        fontFeatures: [FontFeature.tabularFigures()],
                      ),
                    ),
                    trailing: index < _laps.length - 1
                        ? Text(
                            '+${_formatTime(_laps[index] - _laps[index + 1])}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontFeatures: const [FontFeature.tabularFigures()],
                            ),
                          )
                        : null,
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required VoidCallback onPressed,
    required IconData icon,
    required String label,
    required Color color,
    bool isEnabled = true,
    bool isLarge = false,
  }) {
    return Column(
      children: [
        FloatingActionButton(
          onPressed: isEnabled ? onPressed : null,
          backgroundColor: isEnabled ? color : Colors.grey[400],
          heroTag: label,
          elevation: isLarge ? 8 : 4,
          child: Icon(
            icon,
            size: isLarge ? 32 : 24,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isEnabled ? Colors.grey[700] : Colors.grey[400],
            fontWeight: isLarge ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
