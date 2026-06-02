import 'package:flutter/material.dart';

/// Registro de un escaneo en el historial.
class ScanHistoryItem {
  const ScanHistoryItem({
    required this.fecha,
    required this.categoria,
    required this.contenedor,
    required this.color,
  });

  final DateTime fecha;
  final String categoria;
  final String contenedor;
  final Color color;
}
