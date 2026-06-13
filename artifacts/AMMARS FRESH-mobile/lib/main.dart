import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/exchange_rates_provider.dart';
import 'screens/admin/admin_shell.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/farmer/farmer_shell.dart';
import 'screens/retailer/retailer_shell.dart';
import 'config/brand_config.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const AmmarsFreshApp());
}

class AmmarsFreshApp extends StatefulWidget {
  const AmmarsFreshApp({super.key});

  @override
  State<AmmarsFreshApp> createState() => _AmmarsFreshAppState();
}

class _AmmarsFreshAppState extends State<AmmarsFreshApp> {
  late final AuthProvider _auth;
  late final ExchangeRatesProvider _exchangeRates;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _auth = AuthProvider();
    _exchangeRates = ExchangeRatesProvider(api: _auth.api);
    _exchangeRates.load();
    _router = GoRouter(
      initialLocation: '/',
      refreshListenable: _auth,
      redirect: (context, state) {
        if (_auth.isLoading) return null;
        final loggingIn = state.matchedLocation == '/login' ||
            state.matchedLocation == '/register';
        if (!_auth.isAuthenticated) {
          return loggingIn ? null : '/login';
        }
        if (loggingIn) {
          final role = _auth.user?.role;
          if (role == 'farmer') return '/farmer';
          if (role == 'admin') return '/admin';
          return '/retailer';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          redirect: (_, __) {
            final role = _auth.user?.role;
            if (role == 'farmer') return '/farmer';
            if (role == 'admin') return '/admin';
            return '/retailer';
          },
        ),
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
        ShellRoute(
          builder: (context, state, child) =>
              RetailerShell(location: state.uri.toString()),
          routes: [
            GoRoute(path: '/retailer', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/retailer/cart', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/retailer/orders', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/retailer/profile', builder: (_, __) => const SizedBox.shrink()),
          ],
        ),
        ShellRoute(
          builder: (context, state, child) =>
              FarmerShell(location: state.uri.toString()),
          routes: [
            GoRoute(path: '/farmer', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/farmer/stats', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/farmer/profile', builder: (_, __) => const SizedBox.shrink()),
          ],
        ),
        ShellRoute(
          builder: (context, state, child) =>
              AdminShell(location: state.uri.toString()),
          routes: [
            GoRoute(path: '/admin', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/admin/orders', builder: (_, __) => const SizedBox.shrink()),
            GoRoute(path: '/admin/profile', builder: (_, __) => const SizedBox.shrink()),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _auth),
        ChangeNotifierProvider.value(value: _exchangeRates),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: AnimatedBuilder(
        animation: _auth,
        builder: (context, _) {
          if (_auth.isLoading) {
            return MaterialApp(
              theme: buildAppTheme(),
              home: const Scaffold(
                body: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
            );
          }
          return MaterialApp.router(
            title: BrandConfig.name,
            theme: buildAppTheme(),
            routerConfig: _router,
          );
        },
      ),
    );
  }
}
