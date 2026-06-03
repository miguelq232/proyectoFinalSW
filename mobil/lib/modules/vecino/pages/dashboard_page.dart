import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/providers/vecino_provider.dart';
import 'package:provider/provider.dart';

class VecinoDashboardPage extends StatefulWidget {
  const VecinoDashboardPage({super.key});

  @override
  State<VecinoDashboardPage> createState() => _VecinoDashboardPageState();
}

class _VecinoDashboardPageState extends State<VecinoDashboardPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadProfileIfNeeded());
  }

  void _loadProfileIfNeeded() {
    final auth = context.read<AuthProvider>();
    final vecino = context.read<VecinoProvider>();

    if (vecino.perfil == null && auth.token.isNotEmpty) {
      vecino.loadProfile(auth.token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final vecino = context.watch<VecinoProvider>();
    final nombre = vecino.perfil?.nombre ?? auth.nombre;

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
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Icon(
                    Icons.stars,
                    size: 40,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Puntos acumulados',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${vecino.perfil?.puntosAcumulados ?? 0}',
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
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
        ],
      ),
    );
  }
}
