import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';
import 'farmer_home_screen.dart';
import 'farmer_profile_screen.dart';
import 'farmer_stats_screen.dart';

class FarmerShell extends StatelessWidget {
  const FarmerShell({super.key, required this.location});

  final String location;

  int get _index {
    if (location.startsWith('/farmer/stats')) return 1;
    if (location.startsWith('/farmer/profile')) return 2;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final body = switch (_index) {
      1 => const FarmerStatsScreen(),
      2 => const FarmerProfileScreen(),
      _ => const FarmerHomeScreen(),
    };

    return Scaffold(
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/farmer');
            case 1:
              context.go('/farmer/stats');
            case 2:
              context.go('/farmer/profile');
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.inventory_2_outlined), selectedIcon: Icon(Icons.inventory_2), label: 'Products'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Stats'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
      ),
    );
  }
}
