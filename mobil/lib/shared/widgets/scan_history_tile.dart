import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobil/shared/models/scan_history_item.dart';

class ScanHistoryTile extends StatelessWidget {
  const ScanHistoryTile({super.key, required this.item});

  final ScanHistoryItem item;

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: item.color,
          child: Icon(
            Icons.recycling,
            color: item.color.computeLuminance() > 0.5 ? Colors.black87 : Colors.white,
          ),
        ),
        title: Text(
          item.categoria.toUpperCase(),
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.contenedor),
            Text(
              dateFormat.format(item.fecha),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        trailing: Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: item.color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.black12),
          ),
        ),
      ),
    );
  }
}
