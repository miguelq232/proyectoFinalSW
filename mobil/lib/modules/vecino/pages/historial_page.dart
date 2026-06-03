import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/services/puntos_service.dart';
import 'package:provider/provider.dart';

class HistorialPage extends StatefulWidget {
  const HistorialPage({super.key});

  @override
  State<HistorialPage> createState() => _HistorialPageState();
}

class _HistorialPageState extends State<HistorialPage> {
  List<Map<String, dynamic>> _registros = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadHistorial());
  }

  Future<void> _loadHistorial() async {
    final token = context.read<AuthProvider>().token.trim();
    if (token.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'Sesión no válida';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final registros = await PuntosService.getHistorial(token);
      if (mounted) {
        setState(() {
          _registros = registros;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  Color _colorForTipo(String tipo) {
    switch (tipo.toUpperCase()) {
      case 'PLASTICO':
        return Colors.blue;
      case 'VIDRIO':
        return Colors.green;
      case 'PAPEL':
        return Colors.yellow.shade700;
      case 'METAL':
        return Colors.grey;
      case 'ORGANICO':
        return Colors.brown;
      default:
        return Colors.grey;
    }
  }

  IconData _iconForTipo(String tipo) {
    switch (tipo.toUpperCase()) {
      case 'PLASTICO':
        return Icons.local_drink_outlined;
      case 'VIDRIO':
        return Icons.wine_bar_outlined;
      case 'PAPEL':
        return Icons.description_outlined;
      case 'METAL':
        return Icons.build_outlined;
      case 'ORGANICO':
        return Icons.eco_outlined;
      default:
        return Icons.recycling_outlined;
    }
  }

  String _formatFecha(dynamic fecha) {
    if (fecha == null) return '—';
    try {
      final parsed = DateTime.parse(fecha.toString());
      return DateFormat('dd/MM/yyyy HH:mm').format(parsed);
    } catch (_) {
      return fecha.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Recargar',
            onPressed: _loading ? null : _loadHistorial,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _loadHistorial,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (_registros.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Sin historial de reciclaje aún',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadHistorial,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _registros.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final registro = _registros[index];
          final tipo = registro['tipoResiduo']?.toString() ?? '—';
          final puntos = registro['puntosOtorgados'] ?? 0;
          final cantidad = registro['cantidad'];
          final fecha = _formatFecha(registro['fecha']);
          final descripcion = registro['descripcion']?.toString();

          return Card(
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: _colorForTipo(tipo).withValues(alpha: 0.2),
                child: Icon(
                  _iconForTipo(tipo),
                  color: _colorForTipo(tipo),
                ),
              ),
              title: Text(
                tipo,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text('Puntos: $puntos'),
                  if (cantidad != null) Text('Cantidad: $cantidad'),
                  Text('Fecha: $fecha'),
                  if (descripcion != null && descripcion.isNotEmpty)
                    Text(descripcion),
                ],
              ),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}
