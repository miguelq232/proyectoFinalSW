class VecinoProfile {
  const VecinoProfile({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    this.telefono,
    this.direccion,
    this.latitud,
    this.longitud,
    this.zonaId,
    this.zonaNombre,
    this.codigoQR,
    required this.puntosAcumulados,
    required this.activo,
  });

  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final String? telefono;
  final String? direccion;
  final double? latitud;
  final double? longitud;
  final int? zonaId;
  final String? zonaNombre;
  final String? codigoQR;
  final int puntosAcumulados;
  final bool activo;

  factory VecinoProfile.fromJson(Map<String, dynamic> json) {
    return VecinoProfile(
      id: (json['id'] as num).toInt(),
      nombre: json['nombre'] as String,
      apellido: json['apellido'] as String,
      email: json['email'] as String,
      telefono: json['telefono'] as String?,
      direccion: json['direccion'] as String?,
      latitud: (json['latitud'] as num?)?.toDouble(),
      longitud: (json['longitud'] as num?)?.toDouble(),
      zonaId: (json['zonaId'] as num?)?.toInt(),
      zonaNombre: json['zonaNombre'] as String?,
      codigoQR: json['codigoQR'] as String?,
      puntosAcumulados: (json['puntosAcumulados'] as num?)?.toInt() ?? 0,
      activo: json['activo'] as bool? ?? true,
    );
  }
}
