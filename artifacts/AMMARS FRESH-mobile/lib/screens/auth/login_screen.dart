import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../config/brand_config.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brand_logo.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _loading = false;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_identifierController.text.trim().isEmpty ||
        _passwordController.text.isEmpty) {
      _showError('Please enter your email or phone and password.');
      return;
    }
    setState(() => _loading = true);
    try {
      await context.read<AuthProvider>().login(
            _identifierController.text,
            _passwordController.text,
          );
      if (!mounted) return;
      final role = context.read<AuthProvider>().user?.role;
      if (role == 'farmer') {
        context.go('/farmer');
      } else if (role == 'admin') {
        context.go('/admin');
      } else {
        context.go('/retailer');
      }
    } on ApiException {
      _showError('Invalid email/phone or password.');
    } catch (_) {
      _showError('Could not reach the server. Check API_BASE_URL.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.destructive),
    );
  }

  void _fillDemo(String phone, String password) {
    _identifierController.text = phone;
    _passwordController.text = password;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 40),
              const Center(child: BrandLogo(large: true)),
              const SizedBox(height: 28),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Welcome back',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Sign in to your ${BrandConfig.name} account',
                        style: const TextStyle(color: AppColors.mutedForeground),
                      ),
                      const SizedBox(height: 22),
                      const Text('EMAIL OR PHONE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _identifierController,
                        keyboardType: TextInputType.emailAddress,
                        autocorrect: false,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.alternate_email),
                          hintText: 'you@example.com or +211 9XX XXX XXX',
                        ),
                      ),
                      const SizedBox(height: 14),
                      const Text('PASSWORD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.lock_outline),
                          hintText: '••••••••',
                          suffixIcon: IconButton(
                            onPressed: () => setState(() => _showPassword = !_showPassword),
                            icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),
                      FilledButton(
                        onPressed: _loading ? null : _submit,
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          backgroundColor: AppColors.primary,
                        ),
                        child: Text(_loading ? 'Signing in...' : 'Sign In'),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.muted.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'DEMO ACCOUNTS',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2),
                            ),
                            _demoRow('Admin', '+211900000001', 'admin123'),
                            _demoRow('Farmer', '+211900000002', 'farmer123'),
                            _demoRow('Retailer', '+211900000004', 'retailer123'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('No account? '),
                          TextButton(
                            onPressed: () => context.push('/register'),
                            child: const Text('Register here'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                "South Sudan's agricultural marketplace · Farm to market",
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.mutedForeground, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _demoRow(String role, String phone, String password) {
    return InkWell(
      onTap: () => _fillDemo(phone, password),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            SizedBox(
              width: 70,
              child: Text(role, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
            ),
            Expanded(child: Text(phone, style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground))),
            const Icon(Icons.north_east, size: 14, color: AppColors.mutedForeground),
          ],
        ),
      ),
    );
  }
}
