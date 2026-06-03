import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobil/config/constants.dart';

class AuthService {
  AuthService._();

  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final dynamic body = response.body.isNotEmpty
        ? jsonDecode(response.body)
        : <String, dynamic>{};

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Map<String, dynamic>.from(body as Map);
    }

    final message = body is Map && body['message'] != null
        ? body['message'].toString()
        : 'Error de autenticación';
    throw Exception(message);
  }
}
