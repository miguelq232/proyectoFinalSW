import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Constantes de la app IGCS SCZ - Reciclaje inteligente.
class AppConstants {
  AppConstants._();

  static const String appName = 'IGCS SCZ Reciclaje';

  static const String hardcodedEmail = 'vecino.ana@correo.com';
  static const String hardcodedPassword = 'admin123';
  static const String hardcodedNombre = 'Ana Suárez';

  static const String prefsLoggedIn = 'igcsscz_logged_in';
  static const String prefsEmail = 'igcsscz_email';
  static const String prefsNombre = 'igcsscz_nombre';
  static const String prefsToken = 'igcsscz_token';
  static const String prefsRol = 'igcsscz_rol';

  /// URL base del backend Spring Boot. Configurar en `.env` como API_URL.
  static String get apiBaseUrl =>
      dotenv.env['API_URL'] ?? 'http://192.168.0.11:8080/api';

  /// URL del microservicio FastAPI de IA. Configurar en `.env` como IA_URL.
  static String get iaPredictUrl =>
      dotenv.env['IA_URL'] ?? 'http://192.168.0.19:8000/predecir';

  static const Duration iaRequestTimeout = Duration(seconds: 30);
  static const double iaMinConfianza = 0.55;
}
