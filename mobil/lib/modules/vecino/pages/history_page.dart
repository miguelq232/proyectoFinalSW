import 'package:flutter/material.dart';
import 'package:mobil/shared/data/mock_scan_data.dart';
import 'package:mobil/shared/widgets/scan_history_tile.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: conectar con backend Spring Boot
    final historial = MockScanData.historial;

    return Scaffold(
      appBar: AppBar(title: const Text('Historial')),
      body: historial.isEmpty
          ? const Center(child: Text('No hay escaneos registrados'))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  '${historial.length} escaneos',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 12),
                ...historial.map((item) => ScanHistoryTile(item: item)),
              ],
            ),
    );
  }
}
