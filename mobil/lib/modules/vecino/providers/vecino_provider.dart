import 'package:flutter/foundation.dart';
import 'package:mobil/modules/vecino/models/vecino_profile.dart';
import 'package:mobil/modules/vecino/services/vecino_service.dart';

class VecinoProvider extends ChangeNotifier {
  VecinoProfile? perfil;

  Future<void> loadProfile(String token) async {
    final data = await VecinoService.getMyProfile(token);
    perfil = VecinoProfile.fromJson(data);
    notifyListeners();
  }
}
