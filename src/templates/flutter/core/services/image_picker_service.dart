import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter/material.dart';

/// 画像選択・加工サービス
///
/// カメラ撮影・ギャラリー選択・トリミング・圧縮を管理する
///
/// TODO: iOS の Info.plist に以下を追加してください：
/// <key>NSCameraUsageDescription</key>
/// <string>写真を撮影するためにカメラへのアクセスが必要です。</string>
/// <key>NSPhotoLibraryUsageDescription</key>
/// <string>写真を選択するためにフォトライブラリへのアクセスが必要です。</string>
///
/// TODO: Android の AndroidManifest.xml に以下を追加してください：
/// <uses-permission android:name="android.permission.CAMERA" />
/// <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
///
/// TODO: 必要に応じて以下を調整してください：
/// - _defaultMaxWidth / _defaultMaxHeight: 選択時の最大サイズ
/// - _defaultImageQuality: 選択時の画質（0-100）
/// - _defaultCompressQuality: 圧縮後の画質（0-100）
/// - _defaultCompressMaxWidth / _defaultCompressMaxHeight: 圧縮後の最大サイズ

// デフォルト設定
const double _defaultMaxWidth = 1920;
const double _defaultMaxHeight = 1920;
const int _defaultImageQuality = 85;
const int _defaultCompressQuality = 80;
const int _defaultCompressMaxWidth = 1024;
const int _defaultCompressMaxHeight = 1024;

/// 画像選択・加工サービス
class ImagePickerService {
  final ImagePicker _picker = ImagePicker();

  /// ギャラリーから画像を選択
  ///
  /// 選択された画像ファイルを返す。キャンセル時は null
  Future<File?> pickFromGallery({
    double maxWidth = _defaultMaxWidth,
    double maxHeight = _defaultMaxHeight,
    int imageQuality = _defaultImageQuality,
  }) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
      );

      if (pickedFile == null) {
        debugPrint('📷 Gallery pick cancelled');
        return null;
      }

      debugPrint('✅ Image picked from gallery: ${pickedFile.path}');
      return File(pickedFile.path);
    } catch (e) {
      debugPrint('❌ Failed to pick image from gallery: $e');
      return null;
    }
  }

  /// カメラで写真を撮影
  ///
  /// 撮影された画像ファイルを返す。キャンセル時は null
  Future<File?> pickFromCamera({
    double maxWidth = _defaultMaxWidth,
    double maxHeight = _defaultMaxHeight,
    int imageQuality = _defaultImageQuality,
    CameraDevice preferredCamera = CameraDevice.rear,
  }) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageQuality: imageQuality,
        preferredCameraDevice: preferredCamera,
      );

      if (pickedFile == null) {
        debugPrint('📷 Camera capture cancelled');
        return null;
      }

      debugPrint('✅ Image captured from camera: ${pickedFile.path}');
      return File(pickedFile.path);
    } catch (e) {
      debugPrint('❌ Failed to capture image from camera: $e');
      return null;
    }
  }

  /// 画像をトリミング
  ///
  /// [file] をトリミングし、結果のファイルを返す。キャンセル時は null
  Future<File?> cropImage(
    File file, {
    CropAspectRatio? aspectRatio,
    List<CropAspectRatioPreset>? aspectRatioPresets,
    CropStyle cropStyle = CropStyle.rectangle,
    int? maxWidth,
    int? maxHeight,
  }) async {
    try {
      final croppedFile = await ImageCropper().cropImage(
        sourcePath: file.path,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        aspectRatio: aspectRatio,
        aspectRatioPresets: aspectRatioPresets ??
            [
              CropAspectRatioPreset.original,
              CropAspectRatioPreset.square,
              CropAspectRatioPreset.ratio4x3,
              CropAspectRatioPreset.ratio16x9,
            ],
        cropStyle: cropStyle,
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: '画像をトリミング',
            toolbarColor: Colors.black,
            toolbarWidgetColor: Colors.white,
            initAspectRatio: CropAspectRatioPreset.original,
            lockAspectRatio: false,
          ),
          IOSUiSettings(
            title: '画像をトリミング',
          ),
        ],
      );

      if (croppedFile == null) {
        debugPrint('📷 Crop cancelled');
        return null;
      }

      debugPrint('✅ Image cropped: ${croppedFile.path}');
      return File(croppedFile.path);
    } catch (e) {
      debugPrint('❌ Failed to crop image: $e');
      return null;
    }
  }

  /// 画像を圧縮
  ///
  /// [file] を圧縮し、結果のバイトデータを返す
  Future<Uint8List?> compressImage(
    File file, {
    int quality = _defaultCompressQuality,
    int minWidth = _defaultCompressMaxWidth,
    int minHeight = _defaultCompressMaxHeight,
  }) async {
    try {
      final result = await FlutterImageCompress.compressWithFile(
        file.absolute.path,
        quality: quality,
        minWidth: minWidth,
        minHeight: minHeight,
      );

      if (result == null) {
        debugPrint('⚠️ Image compression returned null');
        return null;
      }

      debugPrint(
          '✅ Image compressed: ${file.lengthSync()} bytes → ${result.length} bytes');
      return result;
    } catch (e) {
      debugPrint('❌ Failed to compress image: $e');
      return null;
    }
  }

  /// 画像を圧縮してファイルとして保存
  ///
  /// [file] を圧縮し、[targetPath] に保存する
  Future<File?> compressAndSaveImage(
    File file, {
    required String targetPath,
    int quality = _defaultCompressQuality,
    int minWidth = _defaultCompressMaxWidth,
    int minHeight = _defaultCompressMaxHeight,
  }) async {
    try {
      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: quality,
        minWidth: minWidth,
        minHeight: minHeight,
      );

      if (result == null) {
        debugPrint('⚠️ Image compress and save returned null');
        return null;
      }

      debugPrint('✅ Image compressed and saved to: ${result.path}');
      return File(result.path);
    } catch (e) {
      debugPrint('❌ Failed to compress and save image: $e');
      return null;
    }
  }

  /// ギャラリーから選択→トリミング→圧縮を一括で行う
  ///
  /// 圧縮後のファイルを返す。途中でキャンセルした場合は null
  Future<File?> pickCropAndCompress({
    ImageSource source = ImageSource.gallery,
    CropAspectRatio? cropAspectRatio,
    int compressQuality = _defaultCompressQuality,
  }) async {
    // 1. 画像を選択
    File? file;
    if (source == ImageSource.gallery) {
      file = await pickFromGallery();
    } else {
      file = await pickFromCamera();
    }
    if (file == null) return null;

    // 2. トリミング
    final croppedFile = await cropImage(file, aspectRatio: cropAspectRatio);
    if (croppedFile == null) return null;

    // 3. 圧縮
    final compressedBytes = await compressImage(
      croppedFile,
      quality: compressQuality,
    );
    if (compressedBytes == null) return croppedFile;

    // 圧縮結果を元ファイルに上書き
    await croppedFile.writeAsBytes(compressedBytes);
    return croppedFile;
  }
}

/// ImagePickerService の Riverpod プロバイダー
final imagePickerServiceProvider = Provider<ImagePickerService>((ref) {
  return ImagePickerService();
});
