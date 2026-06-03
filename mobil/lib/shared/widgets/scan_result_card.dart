import 'package:flutter/material.dart';
import 'package:mobil/shared/models/scan_result.dart';
import 'package:mobil/shared/utils/container_colors.dart';

class ScanResultCard extends StatelessWidget {
  const ScanResultCard({super.key, required this.result});

  final ScanResult result;

  @override
  Widget build(BuildContext context) {
    if (!result.esReciclable) {
      return _NonRecyclableCard(result: result);
    }

    final categoria = result.categoria!;
    final color = ContainerColors.forCategory(categoria);
    final textColor = _contrastColor(color);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: color, width: 6)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.recycling, color: textColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          categoria.toUpperCase(),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        Text(
                          'Confianza: ${(result.confianza * 100).toStringAsFixed(0)}%',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (result.contenedor != null)
                      Text(
                        result.contenedor!,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    if (result.contenedor != null) const SizedBox(height: 4),
                    Text(result.mensaje),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _contrastColor(Color background) {
    return background.computeLuminance() > 0.5 ? Colors.black87 : Colors.white;
  }
}

class _NonRecyclableCard extends StatelessWidget {
  const _NonRecyclableCard({required this.result});

  final ScanResult result;

  @override
  Widget build(BuildContext context) {
    const color = Colors.red;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          border: Border(left: BorderSide(color: color, width: 6)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.block, color: color),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'No reciclable',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                        ),
                        Text(
                          'Confianza: ${(result.confianza * 100).toStringAsFixed(0)}%',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  result.mensaje,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
