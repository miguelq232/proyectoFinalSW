import 'package:flutter/foundation.dart';
import 'package:mobil/config/constants.dart';
import 'package:mobil/modules/auth/services/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String _email = '';
  String _nombre = '';
  String _token = '';
  String _rol = '';

  bool get isAuthenticated => _isAuthenticated;
  String get email => _email;
  String get nombre => _nombre;
  String get token => _token;
  String get rol => _rol;

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = prefs.getBool(AppConstants.prefsLoggedIn) ?? false;
    _email = prefs.getString(AppConstants.prefsEmail) ?? '';
    _nombre = prefs.getString(AppConstants.prefsNombre) ?? '';
    _token = prefs.getString(AppConstants.prefsToken) ?? '';
    _rol = prefs.getString(AppConstants.prefsRol) ?? '';
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    try {
      final data = await AuthService.login(email, password);

      _isAuthenticated = true;
      _email = data['email'] as String;
      _nombre = data['nombre'] as String;
      _token = data['token'] as String;
      _rol = data['rol'].toString();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConstants.prefsLoggedIn, true);
      await prefs.setString(AppConstants.prefsEmail, _email);
      await prefs.setString(AppConstants.prefsNombre, _nombre);
      await prefs.setString(AppConstants.prefsToken, _token);
      await prefs.setString(AppConstants.prefsRol, _rol);

      notifyListeners();
      return null;
    } on Exception catch (e) {
      return e.toString().replaceFirst('Exception: ', '');
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _email = '';
    _nombre = '';
    _token = '';
    _rol = '';

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.prefsLoggedIn);
    await prefs.remove(AppConstants.prefsEmail);
    await prefs.remove(AppConstants.prefsNombre);
    await prefs.remove(AppConstants.prefsToken);
    await prefs.remove(AppConstants.prefsRol);

    notifyListeners();
  }
}
