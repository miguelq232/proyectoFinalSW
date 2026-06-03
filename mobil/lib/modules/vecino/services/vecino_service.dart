import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobil/config/constants.dart';

class VecinoService {
  VecinoService._();

  static Future<Map<String, dynamic>> getMyProfile(String token) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}/vecinos/me');
    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    final dynamic body = response.body.isNotEmpty
        ? jsonDecode(response.body)
        : <String, dynamic>{};

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Map<String, dynamic>.from(body as Map);
    }

    final message = body is Map && body['message'] != null
        ? body['message'].toString()
        : 'Error al obtener el perfil';
    throw Exception(message);
  }
}
