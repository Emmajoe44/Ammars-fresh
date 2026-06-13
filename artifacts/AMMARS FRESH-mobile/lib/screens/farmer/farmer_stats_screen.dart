import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class FarmerStatsScreen extends StatefulWidget {
  const FarmerStatsScreen({super.key});

  @override
  State<FarmerStatsScreen> createState() => _FarmerStatsScreenState();
}

class _FarmerStatsScreenState extends State<FarmerStatsScreen> {
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final stats = await context.read<AuthProvider>().api.getFarmerStats();
      if (!mounted) return;
      setState(() {
        _stats = stats;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sales stats')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _tile('Total revenue (SSP)', '${_stats?['totalRevenueSSP'] ?? 0}'),
                  _tile('Orders fulfilled', '${_stats?['ordersFulfilled'] ?? 0}'),
                  _tile('Active products', '${_stats?['activeProducts'] ?? 0}'),
                  _tile('Units sold', '${_stats?['unitsSold'] ?? 0}'),
                ],
              ),
            ),
    );
  }

  Widget _tile(String label, String value) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      ),
    );
  }
}
