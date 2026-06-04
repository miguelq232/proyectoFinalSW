import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/providers/vecino_provider.dart';
import 'package:provider/provider.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
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
    final perfil = vecino.perfil;

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const CircleAvatar(
              radius: 48,
              child: Icon(Icons.person, size: 48),
            ),
            const SizedBox(height: 16),
            Text(
              perfil != null
                  ? '${perfil.nombre} ${perfil.apellido}'
                  : auth.nombre,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              perfil?.email ?? auth.email,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 24),
            _ProfileField(
              icon: Icons.phone_outlined,
              label: 'Teléfono',
              value: perfil?.telefono ?? '—',
            ),
            _ProfileField(
              icon: Icons.home_outlined,
              label: 'Dirección',
              value: perfil?.direccion ?? '—',
            ),
            _ProfileField(
              icon: Icons.map_outlined,
              label: 'Zona',
              value: perfil?.zonaNombre ?? '—',
            ),
            _ProfileField(
              icon: Icons.stars_outlined,
              label: 'Puntos acumulados',
              value: '${perfil?.puntosAcumulados ?? 0}',
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Código QR',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: QrImageView(
                        data: perfil?.codigoQR ?? 'SIN-QR',
                        version: QrVersions.auto,
                        size: 200.0,
                        backgroundColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'ID: VEC-${perfil?.id ?? '—'}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[700],
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              icon: const Icon(Icons.logout),
              label: const Text('Cerrar sesión'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Theme.of(context).colorScheme.error,
                side: BorderSide(color: Theme.of(context).colorScheme.error),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon),
        title: Text(label),
        subtitle: Text(value),
      ),
    );
  }
}
