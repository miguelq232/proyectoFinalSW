import 'package:flutter/foundation.dart';
import 'package:mobil/config/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Autenticación hardcodeada con persistencia local.
// TODO: conectar con backend Spring Boot
class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String _email = '';
  String _nombre = '';

  bool get isAuthenticated => _isAuthenticated;
  String get email => _email;
  String get nombre => _nombre;

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = prefs.getBool(AppConstants.prefsLoggedIn) ?? false;
    _email = prefs.getString(AppConstants.prefsEmail) ?? '';
    _nombre = prefs.getString(AppConstants.prefsNombre) ?? '';
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    if (email == AppConstants.hardcodedEmail &&
        password == AppConstants.hardcodedPassword) {
      _isAuthenticated = true;
      _email = email;
      _nombre = AppConstants.hardcodedNombre;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConstants.prefsLoggedIn, true);
      await prefs.setString(AppConstants.prefsEmail, _email);
      await prefs.setString(AppConstants.prefsNombre, _nombre);

      notifyListeners();
      return null;
    }
    return 'Credenciales incorrectas';
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _email = '';
    _nombre = '';

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.prefsLoggedIn);
    await prefs.remove(AppConstants.prefsEmail);
    await prefs.remove(AppConstants.prefsNombre);

    notifyListeners();
  }
}
