import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_vertexai/firebase_vertexai.dart';

/// Vertex AI (Gemini) サービス
///
/// Firebase Vertex AI を使用したテキスト生成・チャット機能を提供する
///
/// TODO: Firebase Console で以下の設定を行ってください：
/// - Vertex AI in Firebase を有効化
/// - 使用するリージョンを確認（デフォルト: asia-northeast1）
///
/// TODO: 必要に応じて以下を調整してください：
/// - _defaultModel: 使用するモデル名
/// - _defaultLocation: Vertex AI のリージョン
/// - GenerationConfig のパラメータ（temperature, maxOutputTokens 等）

// TODO: モデル名を変更する場合はここを修正
const String _defaultModel = 'gemini-2.0-flash';

// TODO: リージョンを変更する場合はここを修正
const String _defaultLocation = 'asia-northeast1';

/// Vertex AI サービス
class AIService {
  final FirebaseVertexAI _vertexAI;

  AIService(this._vertexAI);

  /// GenerativeModel を取得
  GenerativeModel _getModel({
    String? modelName,
    Content? systemInstruction,
    GenerationConfig? generationConfig,
    List<SafetySetting>? safetySettings,
  }) {
    return _vertexAI.generativeModel(
      model: modelName ?? _defaultModel,
      systemInstruction: systemInstruction,
      generationConfig: generationConfig,
      safetySettings: safetySettings,
    );
  }

  /// テキストを生成
  ///
  /// [prompt] に対する応答テキストを返す
  ///
  /// 例:
  /// ```dart
  /// final response = await aiService.generateText('こんにちは');
  /// ```
  Future<String?> generateText(
    String prompt, {
    String? systemPrompt,
    double temperature = 0.7,
    int maxOutputTokens = 1024,
  }) async {
    try {
      final model = _getModel(
        systemInstruction: systemPrompt != null
            ? Content.system(systemPrompt)
            : null,
        generationConfig: GenerationConfig(
          temperature: temperature,
          maxOutputTokens: maxOutputTokens,
        ),
      );

      final response = await model.generateContent([
        Content.text(prompt),
      ]);

      final text = response.text;
      if (text == null || text.isEmpty) {
        debugPrint('⚠️ Vertex AI response was empty');
        return null;
      }

      debugPrint('✅ Text generated successfully');
      return text;
    } catch (e) {
      debugPrint('❌ Failed to generate text: $e');
      return null;
    }
  }

  /// チャットセッションを開始
  ///
  /// 会話履歴を保持するチャットセッションを返す
  ///
  /// 例:
  /// ```dart
  /// final chat = aiService.startChat(systemPrompt: 'あなたは親切なアシスタントです');
  /// final response = await aiService.sendChatMessage(chat, 'こんにちは');
  /// ```
  ChatSession startChat({
    String? systemPrompt,
    List<Content>? history,
    double temperature = 0.8,
    int maxOutputTokens = 512,
  }) {
    final model = _getModel(
      systemInstruction: systemPrompt != null
          ? Content.system(systemPrompt)
          : null,
      generationConfig: GenerationConfig(
        temperature: temperature,
        maxOutputTokens: maxOutputTokens,
      ),
    );

    return model.startChat(history: history);
  }

  /// チャットメッセージを送信
  ///
  /// [chatSession] に対してメッセージを送信し、応答テキストを返す
  Future<String?> sendChatMessage(
    ChatSession chatSession,
    String message,
  ) async {
    try {
      final response = await chatSession.sendMessage(
        Content.text(message),
      );

      final text = response.text;
      if (text == null || text.isEmpty) {
        debugPrint('⚠️ Chat response was empty');
        return null;
      }

      debugPrint('✅ Chat message sent successfully');
      return text;
    } catch (e) {
      debugPrint('❌ Failed to send chat message: $e');
      return null;
    }
  }

  /// ストリーミングでテキストを生成
  ///
  /// テキストが生成されるたびに [onChunk] が呼ばれる
  ///
  /// 例:
  /// ```dart
  /// await aiService.generateTextStream(
  ///   'こんにちは',
  ///   onChunk: (text) => print(text),
  /// );
  /// ```
  Future<String> generateTextStream(
    String prompt, {
    required void Function(String chunk) onChunk,
    String? systemPrompt,
    double temperature = 0.7,
    int maxOutputTokens = 1024,
  }) async {
    try {
      final model = _getModel(
        systemInstruction: systemPrompt != null
            ? Content.system(systemPrompt)
            : null,
        generationConfig: GenerationConfig(
          temperature: temperature,
          maxOutputTokens: maxOutputTokens,
        ),
      );

      final response = model.generateContentStream([
        Content.text(prompt),
      ]);

      final buffer = StringBuffer();
      await for (final chunk in response) {
        final text = chunk.text;
        if (text != null) {
          buffer.write(text);
          onChunk(text);
        }
      }

      debugPrint('✅ Stream generation completed');
      return buffer.toString();
    } catch (e) {
      debugPrint('❌ Failed to generate text stream: $e');
      rethrow;
    }
  }
}

/// AIService の Riverpod プロバイダー
final aiServiceProvider = Provider<AIService>((ref) {
  final vertexAI = FirebaseVertexAI.instanceFor(
    location: _defaultLocation,
  );
  return AIService(vertexAI);
});
