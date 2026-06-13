import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/brand_config.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/exchange_rates_provider.dart';
import '../../services/api_client.dart';
import '../../theme/app_theme.dart';
import '../../utils/format_price.dart';

class RetailerCartScreen extends StatefulWidget {
  const RetailerCartScreen({super.key});

  @override
  State<RetailerCartScreen> createState() => _RetailerCartScreenState();
}

class _RetailerCartScreenState extends State<RetailerCartScreen> {
  final _addressController = TextEditingController();
  bool _checkingOut = false;

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _checkout() async {
    final cart = context.read<CartProvider>();
    final auth = context.read<AuthProvider>();
    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a delivery address')),
      );
      return;
    }
    if (cart.items.isEmpty) return;

    setState(() => _checkingOut = true);
    try {
      await auth.api.createOrder(
        currency: auth.currency,
        deliveryLocation: _addressController.text.trim(),
        items: cart.items
            .map(
              (i) => {
                'productId': i.productId,
                'productName': i.name,
                'quantity': i.quantity,
                'priceSSP': i.priceSSP,
                'priceUSD': i.priceUSD,
                'unit': i.unit,
              },
            )
            .toList(),
      );
      cart.clear();
      _addressController.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order placed successfully!')),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: AppColors.destructive),
      );
    } finally {
      if (mounted) setState(() => _checkingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final auth = context.watch<AuthProvider>();
    final rates = context.watch<ExchangeRatesProvider>().rates;
    final total = formatOrderTotal(
      auth.currency,
      cart.totalSSP,
      cart.totalUSD,
      rates: rates,
    );

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          title: const Text('My Cart'),
          actions: [
            if (cart.count > 0)
              TextButton(
                onPressed: cart.clear,
                child: const Text('Clear', style: TextStyle(color: Colors.white)),
              ),
          ],
        ),
        if (cart.items.isEmpty)
          const SliverFillRemaining(
            child: Center(child: Text('Your basket is empty')),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList.separated(
              itemCount: cart.items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = cart.items[index];
                final price = formatProductPrice(
                  auth.currency,
                  item.priceSSP,
                  item.priceUSD,
                  rates: rates,
                );
                return Card(
                  child: ListTile(
                    title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text('$price / ${item.unit}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          onPressed: () => cart.updateQuantity(item.productId, item.quantity - 1),
                          icon: const Icon(Icons.remove_circle_outline),
                        ),
                        Text('${item.quantity}'),
                        IconButton(
                          onPressed: () => cart.updateQuantity(item.productId, item.quantity + 1),
                          icon: const Icon(Icons.add_circle_outline),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        if (cart.items.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _addressController,
                    decoration: const InputDecoration(labelText: 'Delivery address'),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: BrandConfig.currencies.map((code) {
                      return ChoiceChip(
                        label: Text(code),
                        selected: auth.currency == code,
                        onSelected: (_) => auth.setCurrency(code),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  Text('Total: $total', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _checkingOut ? null : _checkout,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(48),
                      backgroundColor: AppColors.primary,
                    ),
                    child: Text(_checkingOut ? 'Placing order...' : 'Place order'),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
