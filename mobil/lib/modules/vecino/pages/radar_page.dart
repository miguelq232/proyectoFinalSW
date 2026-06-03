import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:mobil/config/constants.dart';
import 'package:mobil/modules/auth/providers/auth_provider.dart';
import 'package:mobil/modules/vecino/providers/vecino_provider.dart';
import 'package:provider/provider.dart';

class RadarPage extends StatefulWidget {
  const RadarPage({super.key});

  @override
  State<RadarPage> createState() => _RadarPageState();
}

class _RadarPageState extends State<RadarPage> {
  static const LatLng _santaCruzCenter = LatLng(-17.7834, -63.1821);

  Timer? _pollTimer;
  List<_CamionMarker> _camiones = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProfileIfNeeded();
      _fetchCamiones();
      _pollTimer = Timer.periodic(
        const Duration(seconds: 5),
        (_) => _fetchCamiones(silent: true),
      );
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  void _loadProfileIfNeeded() {
    final auth = context.read<AuthProvider>();
    final vecino = context.read<VecinoProvider>();

    if (vecino.perfil == null && auth.token.isNotEmpty) {
      vecino.loadProfile(auth.token);
    }
  }

  Future<void> _fetchCamiones({bool silent = false}) async {
    if (!mounted) return;

    final token = context.read<AuthProvider>().token.trim();
    if (token.isEmpty) return;

    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    try {
      final headers = {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      };

      // ignore: avoid_print
      print('TOKEN ENVIADO: "$token"');
      // ignore: avoid_print
      print('URL: ${AppConstants.apiBaseUrl}/gps/camiones/vivo');

      final response = await http.get(
        Uri.parse('${AppConstants.apiBaseUrl}/gps/camiones/vivo'),
        headers: headers,
      );

      // ignore: avoid_print
      print('STATUS: ${response.statusCode}');
      // ignore: avoid_print
      print('BODY: ${response.body}');

      final dynamic body = response.body.isNotEmpty
          ? jsonDecode(response.body)
          : <dynamic>[];

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final list = body is List ? body : <dynamic>[];
        final camiones = list
            .whereType<Map<String, dynamic>>()
            .where(
              (item) => item['latitud'] != null && item['longitud'] != null,
            )
            .map(_CamionMarker.fromJson)
            .toList();

        if (mounted) {
          setState(() {
            _camiones = camiones;
            _error = null;
          });
        }
      } else {
        final message = body is Map && body['message'] != null
            ? body['message'].toString()
            : 'Error al obtener ubicaciones';
        if (mounted) {
          setState(() => _error = message);
        }
      }
    } catch (e) {
      if (mounted && !silent) {
        setState(() => _error = e.toString());
      }
    } finally {
      if (mounted && !silent) {
        setState(() => _loading = false);
      }
    }
  }

  List<Marker> _buildMarkers(VecinoProvider vecino) {
    final markers = <Marker>[];

    final perfil = vecino.perfil;
    if (perfil?.latitud != null && perfil?.longitud != null) {
      markers.add(
        Marker(
          point: LatLng(perfil!.latitud!, perfil.longitud!),
          width: 44,
          height: 44,
          child: const Icon(
            Icons.home,
            color: Colors.blue,
            size: 36,
          ),
        ),
      );
    }

    for (final camion in _camiones) {
      markers.add(
        Marker(
          point: LatLng(camion.latitud, camion.longitud),
          width: 44,
          height: 44,
          child: Tooltip(
            message: camion.placa,
            child: const Icon(
              Icons.local_shipping,
              color: Colors.green,
              size: 36,
            ),
          ),
        ),
      );
    }

    return markers;
  }

  @override
  Widget build(BuildContext context) {
    final vecino = context.watch<VecinoProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Radar'),
        actions: [
          if (_loading)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Recargar',
              onPressed: () => _fetchCamiones(),
            ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            options: const MapOptions(
              initialCenter: _santaCruzCenter,
              initialZoom: 13,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.mobil',
              ),
              MarkerLayer(markers: _buildMarkers(vecino)),
            ],
          ),
          if (_error != null)
            Positioned(
              top: 12,
              left: 12,
              right: 12,
              child: Material(
                elevation: 2,
                borderRadius: BorderRadius.circular(8),
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            ),
          if (_camiones.isEmpty && _error == null)
            Positioned(
              bottom: 24,
              left: 24,
              right: 24,
              child: Material(
                elevation: 2,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'Sin camiones activos en este momento',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CamionMarker {
  const _CamionMarker({
    required this.camionId,
    required this.placa,
    required this.latitud,
    required this.longitud,
  });

  final int camionId;
  final String placa;
  final double latitud;
  final double longitud;

  factory _CamionMarker.fromJson(Map<String, dynamic> json) {
    return _CamionMarker(
      camionId: (json['camionId'] as num).toInt(),
      placa: json['placa'] as String? ?? 'Camión',
      latitud: (json['latitud'] as num).toDouble(),
      longitud: (json['longitud'] as num).toDouble(),
    );
  }
}
