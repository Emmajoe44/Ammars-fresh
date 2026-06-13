import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';
import 'retailer_cart_screen.dart';
import 'retailer_home_screen.dart';
import 'retailer_orders_screen.dart';
import 'retailer_profile_screen.dart';

class RetailerShell extends StatefulWidget {
  const RetailerShell({super.key, required this.location});

  final String location;

  @override
  State<RetailerShell> createState() => _RetailerShellState();
}

class _RetailerShellState extends State<RetailerShell> {
  int get _index {
    if (widget.location.startsWith('/retailer/cart')) return 1;
    if (widget.location.startsWith('/retailer/orders')) return 2;
    if (widget.location.startsWith('/retailer/profile')) return 3;
    return 0;
  }

  void _onTap(int index) {
    switch (index) {
      case 0:
        context.go('/retailer');
      case 1:
        context.go('/retailer/cart');
      case 2:
        context.go('/retailer/orders');
      case 3:
        context.go('/retailer/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final body = switch (_index) {
      1 => const RetailerCartScreen(),
      2 => const RetailerOrdersScreen(),
      3 => const RetailerProfileScreen(),
      _ => const RetailerHomeScreen(),
    };

    return Scaffold(
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: _onTap,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront), label: 'Shop'),
          NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), selectedIcon: Icon(Icons.shopping_cart), label: 'Cart'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
      ),
    );
  }
}
