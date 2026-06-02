import 'package:mobil/config/constants.dart';

/// Resultado de clasificación de un residuo.
class ScanResult {
  const ScanResult({
    required this.categoria,
    required this.confianza,
    required this.contenedor,
    required this.mensaje,
    required this.reciclable,
  });

  final String? categoria;
  final double confianza;
  final String? contenedor;
  final String mensaje;
  final bool reciclable;

  bool get esReciclable =>
      reciclable &&
      categoria != null &&
      confianza >= AppConstants.iaMinConfianza;

  /// Resultado hardcodeado para demo de escaneo.
  // TODO: conectar con API FastAPI /predecir
  static const ScanResult demo = ScanResult(
    categoria: 'pet',
    confianza: 0.94,
    contenedor: 'Naranja - Botellas PET',
    mensaje: 'Depositar en contenedor naranja',
    reciclable: true,
  );

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    final categoria = json['categoria'] as String?;
    final confianza = (json['confianza'] as num).toDouble();
    final reciclable = json['reciclable'] as bool? ?? false;
    final contenedor = json['contenedor'] as String?;
    final mensaje = json['mensaje'] as String?;

    if (confianza < AppConstants.iaMinConfianza || categoria == null) {
      return ScanResult(
        categoria: null,
        confianza: confianza,
        contenedor: null,
        reciclable: false,
        mensaje: 'No es reciclable aquí',
      );
    }

    return ScanResult(
      categoria: categoria,
      confianza: confianza,
      contenedor: contenedor,
      reciclable: reciclable,
      mensaje: mensaje ?? 'Depositar en el contenedor correspondiente',
    );
  }
}
