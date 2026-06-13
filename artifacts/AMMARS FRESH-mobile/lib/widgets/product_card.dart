import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/api_config.dart';
import '../models/product.dart';
import '../providers/exchange_rates_provider.dart';
import '../theme/app_theme.dart';
import '../utils/format_price.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    required this.currency,
    this.onAdd,
  });

  final Product product;
  final String currency;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final rates = context.watch<ExchangeRatesProvider>().rates;
    final price = formatProductPrice(
      currency,
      product.priceSSP,
      product.priceUSD,
      unit: product.unit,
      rates: rates,
    );
    final imageUrl = resolveImageUrl(product.imageUrl);

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 1.2,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: imageUrl.isNotEmpty
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _placeholder(),
                    )
                  : _placeholder(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                if (product.farmerName != null)
                  Text(
                    product.farmerName!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.mutedForeground,
                      fontSize: 11,
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        price,
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    ),
                    if (onAdd != null)
                      IconButton.filled(
                        onPressed: product.available ? onAdd : null,
                        icon: const Icon(Icons.add, size: 18),
                        style: IconButton.styleFrom(
                          minimumSize: const Size(36, 36),
                          padding: EdgeInsets.zero,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: AppColors.muted,
      child: const Center(
        child: Icon(Icons.local_florist, color: AppColors.mutedForeground, size: 36),
      ),
    );
  }
}
