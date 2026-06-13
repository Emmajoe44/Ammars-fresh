import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _role = 'retailer';
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _passwordController.text.length < 6) {
      _showError('Fill in name, phone, and a password (6+ characters).');
      return;
    }
    setState(() => _loading = true);
    try {
      await context.read<AuthProvider>().register({
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim().replaceAll(RegExp(r'\s+'), ''),
        'email': _emailController.text.trim().isEmpty
            ? null
            : _emailController.text.trim().toLowerCase(),
        'password': _passwordController.text,
        'role': _role,
        'language': 'en',
        'currency': 'SSP',
        if (_role == 'farmer') 'farmName': 'My Farm',
      });
      if (!mounted) return;
      final role = context.read<AuthProvider>().user?.role;
      if (role == 'farmer') {
        context.go('/farmer');
      } else if (role == 'admin') {
        context.go('/admin');
      } else {
        context.go('/retailer');
      }
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (_) {
      _showError('Could not reach the server.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.destructive),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email (optional)'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _role,
              decoration: const InputDecoration(labelText: 'I am a'),
              items: const [
                DropdownMenuItem(value: 'retailer', child: Text('Retailer')),
                DropdownMenuItem(value: 'farmer', child: Text('Farmer')),
              ],
              onChanged: (v) => setState(() => _role = v ?? 'retailer'),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                backgroundColor: AppColors.primary,
              ),
              child: Text(_loading ? 'Creating account...' : 'Register'),
            ),
          ],
        ),
      ),
    );
  }
}
