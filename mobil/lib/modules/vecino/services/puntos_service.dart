import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobil/config/constants.dart';

class PuntosService {
  PuntosService._();

  static Future<List<Map<String, dynamic>>> getHistorial(String token) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}/puntos/historial');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );

    final dynamic body = response.body.isNotEmpty
        ? jsonDecode(response.body)
        : <dynamic>[];

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = body is List ? body : <dynamic>[];
      return list
          .whereType<Map<String, dynamic>>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }

    final message = body is Map && body['message'] != null
        ? body['message'].toString()
        : 'Error al obtener el historial';
    throw Exception(message);
  }
}
