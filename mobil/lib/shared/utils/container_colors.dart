import 'package:flutter/material.dart';

/// Colores de contenedores Empacar S.A. Santa Cruz.
class ContainerColors {
  ContainerColors._();

  static Color forCategory(String categoria) {
    switch (categoria.toLowerCase()) {
      case 'glass':
        return Colors.grey[400]!;
      case 'metal':
        return Colors.grey[700]!;
      case 'paper':
        return Colors.blue;
      case 'pet':
        return Colors.orange;
      case 'plastic':
        return Colors.yellow[700]!;
      default:
        return Colors.grey;
    }
  }

  static String labelForCategory(String categoria) {
    switch (categoria.toLowerCase()) {
      case 'glass':
        return 'Blanco - Vidrio';
      case 'metal':
        return 'Gris - Metal';
      case 'paper':
        return 'Azul - Papel';
      case 'pet':
        return 'Naranja - Botellas PET';
      case 'plastic':
        return 'Amarillo - Plástico';
      default:
        return 'Contenedor general';
    }
  }
}
