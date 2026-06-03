import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/shared/data/mock_scan_data.dart';
import 'package:mobil/shared/widgets/scan_history_tile.dart';
import 'package:provider/provider.dart';

class VecinoDashboardPage extends StatelessWidget {
  const VecinoDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final nombre = context.watch<AuthProvider>().nombre;
    final recientes = MockScanData.historial.take(5).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Inicio')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Hola $nombre',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Clasifica tus residuos y recicla correctamente',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 120,
            child: FilledButton.icon(
              onPressed: () => context.go('/vecino/scan'),
              icon: const Icon(Icons.camera_alt, size: 32),
              label: const Text(
                'Escanear residuo',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              style: FilledButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Últimos escaneos',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Historial hardcodeado — 5 registros recientes',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 12),
          // TODO: conectar con backend Spring Boot
          ...recientes.map((item) => ScanHistoryTile(item: item)),
        ],
      ),
    );
  }
}
