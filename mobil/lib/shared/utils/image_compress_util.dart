import 'dart:typed_data';

import 'package:image/image.dart' as img;

/// Comprime imágenes para envío al microservicio de IA.
class ImageCompressUtil {
  ImageCompressUtil._();

  static const int maxDimension = 800;
  static const int maxFileSizeBytes = 200 * 1024;

  /// Redimensiona a máximo 800×800 px y comprime JPEG hasta < 200 KB.
  static Uint8List compressForUpload(Uint8List bytes) {
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      throw const FormatException('No se pudo decodificar la imagen');
    }

    var processed = _resizeToMax(decoded, maxDimension);
    var quality = 85;

    while (true) {
      final encoded = Uint8List.fromList(
        img.encodeJpg(processed, quality: quality),
      );

      if (encoded.length <= maxFileSizeBytes) {
        return encoded;
      }

      if (quality > 25) {
        quality -= 5;
        continue;
      }

      if (processed.width <= 400 || processed.height <= 400) {
        return encoded;
      }

      processed = img.copyResize(
        processed,
        width: (processed.width * 0.85).round(),
        height: (processed.height * 0.85).round(),
      );
      quality = 85;
    }
  }

  static img.Image _resizeToMax(img.Image image, int maxSize) {
    if (image.width <= maxSize && image.height <= maxSize) {
      return image;
    }

    if (image.width >= image.height) {
      return img.copyResize(image, width: maxSize);
    }

    return img.copyResize(image, height: maxSize);
  }
}
