import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

// ignore_for_file: avoid_print

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mobil/config/constants.dart';
import 'package:mobil/shared/models/scan_result.dart';
import 'package:mobil/shared/utils/image_compress_util.dart';

class IaPredictionException implements Exception {
  IaPredictionException(this.message);

  final String message;

  @override
  String toString() => message;
}

class IaPredictionService {
  IaPredictionService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<ScanResult> predict(
    Uint8List rawBytes, {
    String filename = 'imagen.jpg',
  }) async {
    try {
      print('Tamaño original: ${rawBytes.length} bytes');

      final compressed = ImageCompressUtil.compressForUpload(rawBytes);
      print('Tamaño comprimido: ${compressed.length} bytes');

      final request = http.MultipartRequest(
        'POST',
        Uri.parse(AppConstants.iaPredictUrl),
      );

      request.files.add(
        http.MultipartFile.fromBytes(
          'imagen',
          compressed,
          filename: 'imagen.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      );

      print('Enviando a: ${AppConstants.iaPredictUrl}');

      final streamedResponse = await _client
          .send(request)
          .timeout(AppConstants.iaRequestTimeout);

      final response = await http.Response.fromStream(streamedResponse);

      print('Status code: ${response.statusCode}');

      if (response.statusCode != 200) {
        throw IaPredictionException(
          _extractErrorMessage(response.body) ??
              'Error del servidor (${response.statusCode})',
        );
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      return ScanResult.fromJson(json);
    } on TimeoutException catch (e) {
      print('Error detallado: $e');
      throw IaPredictionException(
        'Tiempo de espera agotado. Verifica que el microservicio de IA esté activo.',
      );
    } on IaPredictionException catch (e) {
      print('Error detallado: $e');
      rethrow;
    } on FormatException catch (e) {
      print('Error detallado: $e');
      throw IaPredictionException('Respuesta inválida del servicio de IA.');
    } catch (e) {
      print('Error detallado: $e');
      throw IaPredictionException(
        'Error al contactar el servicio de IA: $e',
      );
    }
  }

  String? _extractErrorMessage(String body) {
    try {
      final json = jsonDecode(body);
      if (json is Map<String, dynamic>) {
        final detail = json['detail'];
        if (detail is String) return detail;
        if (detail is List && detail.isNotEmpty) {
          final first = detail.first;
          if (first is Map && first['msg'] != null) {
            return first['msg'].toString();
          }
        }
      }
    } catch (_) {
      return null;
    }
    return null;
  }
}
