import 'package:mobil/shared/models/scan_history_item.dart';
import 'package:mobil/shared/utils/container_colors.dart';

/// Datos hardcodeados de escaneos recientes.
// TODO: conectar con backend Spring Boot
class MockScanData {
  MockScanData._();

  static final List<ScanHistoryItem> historial = [
    ScanHistoryItem(
      fecha: DateTime(2026, 5, 30, 10, 15),
      categoria: 'pet',
      contenedor: 'Naranja - Botellas PET',
      color: ContainerColors.forCategory('pet'),
    ),
    ScanHistoryItem(
      fecha: DateTime(2026, 5, 29, 18, 42),
      categoria: 'glass',
      contenedor: 'Blanco - Vidrio',
      color: ContainerColors.forCategory('glass'),
    ),
    ScanHistoryItem(
      fecha: DateTime(2026, 5, 28, 9, 30),
      categoria: 'metal',
      contenedor: 'Gris - Metal',
      color: ContainerColors.forCategory('metal'),
    ),
    ScanHistoryItem(
      fecha: DateTime(2026, 5, 27, 14, 05),
      categoria: 'paper',
      contenedor: 'Azul - Papel',
      color: ContainerColors.forCategory('paper'),
    ),
    ScanHistoryItem(
      fecha: DateTime(2026, 5, 26, 11, 20),
      categoria: 'plastic',
      contenedor: 'Amarillo - Plástico',
      color: ContainerColors.forCategory('plastic'),
    ),
  ];
}
