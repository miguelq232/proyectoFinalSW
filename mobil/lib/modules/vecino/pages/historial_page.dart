import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/services/puntos_service.dart';
import 'package:provider/provider.dart';

class _CategoriaResumen {
  const _CategoriaResumen({
    required this.tipo,
    required this.totalPuntos,
    required this.totalDepositos,
  });

  final String tipo;
  final int totalPuntos;
  final int totalDepositos;
}

class HistorialPage extends StatefulWidget {
  const HistorialPage({super.key});

  @override
  State<HistorialPage> createState() => _HistorialPageState();
}

class _HistorialPageState extends State<HistorialPage> {
  List<Map<String, dynamic>> _registros = [];
  bool _loading = true;
  String? _error;

  static const _meses = [
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  static const List<String> todasLasCategorias = [
    'GLASS',
    'METAL',
    'PAPER',
    'PET',
    'PLASTIC',
  ];

  static const _categoriaLabels = <String, String>{
    'GLASS': 'Vidrio',
    'METAL': 'Metal',
    'PAPER': 'Papel',
    'PET': 'PET',
    'PLASTIC': 'Plástico',
  };

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
      case 'PLASTIC':
        return Colors.green;
      case 'VIDRIO':
      case 'GLASS':
        return Colors.blue;
      case 'PAPEL':
      case 'PAPER':
        return Colors.yellow.shade700;
      case 'METAL':
        return Colors.grey;
      case 'PET':
        return Colors.orange;
      case 'ORGANICO':
        return Colors.brown;
      default:
        return Colors.grey;
    }
  }

  IconData _iconForTipo(String tipo) {
    switch (tipo.toUpperCase()) {
      case 'PLASTICO':
      case 'PLASTIC':
        return Icons.local_drink_outlined;
      case 'VIDRIO':
      case 'GLASS':
        return Icons.wine_bar_outlined;
      case 'PAPEL':
      case 'PAPER':
        return Icons.description_outlined;
      case 'METAL':
        return Icons.build_outlined;
      case 'PET':
        return Icons.water_drop_outlined;
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

  DateTime? _parseFechaRegistro(dynamic fecha) {
    if (fecha == null) return null;
    try {
      return DateTime.parse(fecha.toString());
    } catch (_) {
      return null;
    }
  }

  int _puntosRegistro(Map<String, dynamic> registro) {
    final raw = registro['puntosOtorgados'];
    if (raw is num) return raw.toInt();
    return int.tryParse(raw?.toString() ?? '') ?? 0;
  }

  int _sumPuntosDelMes(int year, int month) {
    var total = 0;
    for (final registro in _registros) {
      final fecha = _parseFechaRegistro(registro['fecha']);
      if (fecha != null && fecha.year == year && fecha.month == month) {
        total += _puntosRegistro(registro);
      }
    }
    return total;
  }

  List<_CategoriaResumen> _agruparPorCategoria() {
    final map = <String, _CategoriaResumen>{};
    for (final registro in _registros) {
      final tipo = (registro['tipoResiduo']?.toString() ?? 'OTRO').toUpperCase();
      if (!todasLasCategorias.contains(tipo)) continue;
      final puntos = _puntosRegistro(registro);
      final prev = map[tipo];
      map[tipo] = _CategoriaResumen(
        tipo: tipo,
        totalPuntos: (prev?.totalPuntos ?? 0) + puntos,
        totalDepositos: (prev?.totalDepositos ?? 0) + 1,
      );
    }
    return todasLasCategorias
        .map(
          (tipo) => map[tipo] ??
              _CategoriaResumen(
                tipo: tipo,
                totalPuntos: 0,
                totalDepositos: 0,
              ),
        )
        .toList();
  }

  String _nombreCategoria(String tipo) {
    return _categoriaLabels[tipo.toUpperCase()] ?? tipo;
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Historial'),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Recargar',
              onPressed: _loading ? null : _loadHistorial,
            ),
          ],
          bottom: const TabBar(
            indicatorColor: Colors.green,
            labelColor: Colors.green,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'Depósitos'),
              Tab(text: 'Estadísticas'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildDepositosTab(),
            _buildEstadisticasTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
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

  Widget _buildDepositosTab() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return _buildErrorState();
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

  Widget _buildEstadisticasTab() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return _buildErrorState();
    }

    final now = DateTime.now();
    final mesActual = DateTime(now.year, now.month);
    final mesAnterior = DateTime(now.year, now.month - 1);
    final puntosMesActual = _sumPuntosDelMes(mesActual.year, mesActual.month);
    final puntosMesAnterior =
        _sumPuntosDelMes(mesAnterior.year, mesAnterior.month);
    final porCategoria = _agruparPorCategoria();
    final maxPuntos = porCategoria.isEmpty
        ? 0
        : porCategoria.map((c) => c.totalPuntos).reduce((a, b) => a > b ? a : b);

    final mesActualLabel =
        '${_meses[mesActual.month]} ${mesActual.year}';
    final mesAnteriorLabel =
        '${_meses[mesAnterior.month]} ${mesAnterior.year}';

    return RefreshIndicator(
      onRefresh: _loadHistorial,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            elevation: 0,
            color: Colors.green.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: _MesPuntosCard(
                      titulo: 'Mes actual',
                      subtitulo: mesActualLabel,
                      puntos: puntosMesActual,
                      destacado: true,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MesPuntosCard(
                      titulo: 'Mes anterior',
                      subtitulo: mesAnteriorLabel,
                      puntos: puntosMesAnterior,
                      destacado: false,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Puntos por categoría',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          ...porCategoria.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: _BarraCategoria(
                nombre: _nombreCategoria(item.tipo),
                totalPuntos: item.totalPuntos,
                totalDepositos: item.totalDepositos,
                maxPuntos: maxPuntos,
                color: _colorForTipo(item.tipo),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MesPuntosCard extends StatelessWidget {
  const _MesPuntosCard({
    required this.titulo,
    required this.subtitulo,
    required this.puntos,
    required this.destacado,
  });

  final String titulo;
  final String subtitulo;
  final int puntos;
  final bool destacado;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: destacado ? Colors.green.shade600 : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: destacado ? null : Border.all(color: Colors.green.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            titulo,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: destacado ? Colors.green.shade100 : Colors.green.shade800,
            ),
          ),
          Text(
            subtitulo,
            style: TextStyle(
              fontSize: 10,
              color: destacado ? Colors.white70 : Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$puntos',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: destacado ? Colors.white : Colors.green.shade900,
            ),
          ),
          Text(
            'puntos',
            style: TextStyle(
              fontSize: 12,
              color: destacado ? Colors.green.shade100 : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}

class _BarraCategoria extends StatelessWidget {
  const _BarraCategoria({
    required this.nombre,
    required this.totalPuntos,
    required this.totalDepositos,
    required this.maxPuntos,
    required this.color,
  });

  final String nombre;
  final int totalPuntos;
  final int totalDepositos;
  final int maxPuntos;
  final Color color;

  static const double _labelWidth = 72;
  static const double _barMaxHeight = 22;
  static const double _barMinWidth = 4;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: _labelWidth,
              child: Text(
                nombre,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final barMaxWidth = constraints.maxWidth - 56;
                  final fraction =
                      maxPuntos > 0 ? totalPuntos / maxPuntos : 0.0;
                  final proportionalWidth = barMaxWidth * fraction;
                  final barWidth = totalPuntos == 0
                      ? _barMinWidth
                      : proportionalWidth.clamp(_barMinWidth, barMaxWidth);

                  return Row(
                    children: [
                      Container(
                        width: barWidth,
                        height: _barMaxHeight,
                        decoration: BoxDecoration(
                          color: totalPuntos == 0
                              ? color.withValues(alpha: 0.25)
                              : color,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$totalPuntos',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade900,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(left: _labelWidth, top: 4),
          child: Text(
            '$totalDepositos ${totalDepositos == 1 ? 'depósito' : 'depósitos'}',
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ),
      ],
    );
  }
}
