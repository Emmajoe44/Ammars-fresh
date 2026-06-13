import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';
import 'admin_home_screen.dart';
import 'admin_orders_screen.dart';
import 'admin_profile_screen.dart';

class AdminShell extends StatelessWidget {
  const AdminShell({super.key, required this.location});

  final String location;

  int get _index {
    if (location.startsWith('/admin/orders')) return 1;
    if (location.startsWith('/admin/profile')) return 2;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final body = switch (_index) {
      1 => const AdminOrdersScreen(),
      2 => const AdminProfileScreen(),
      _ => const AdminHomeScreen(),
    };

    return Scaffold(
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/admin');
            case 1:
              context.go('/admin/orders');
            case 2:
              context.go('/admin/profile');
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
      ),
    );
  }
}
