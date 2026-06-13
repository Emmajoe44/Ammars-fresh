import 'package:intl/intl.dart';

import '../config/brand_config.dart';
import '../models/exchange_rates.dart';

const priceSeparator = ' · ';

String formatPriceDisplay(
  num priceSsp,
  num priceUsd, {
  String? unit,
  ExchangeRates rates = ExchangeRates.defaults,
}) {
  final usd = '\$${priceUsd.toStringAsFixed(2)} USD';
  final ssp = 'SSP ${NumberFormat('#,###').format(priceSsp)}';
  final usg = 'USG ${NumberFormat('#,###').format(rates.usdToUsgAmount(priceUsd))}';
  final base = '$usd$priceSeparator$ssp$priceSeparator$usg';
  return unit != null ? '$base/$unit' : base;
}

String formatProductPrice(
  String currency,
  num priceSsp,
  num priceUsd, {
  String? unit,
  ExchangeRates rates = ExchangeRates.defaults,
}) {
  final suffix = unit != null ? '/$unit' : '';
  switch (currency) {
    case 'USD':
      return '\$${priceUsd.toStringAsFixed(2)} USD$suffix';
    case 'SSP':
      return 'SSP ${NumberFormat('#,###').format(priceSsp)}$suffix';
    case 'USG':
      return 'USG ${NumberFormat('#,###').format(rates.usdToUsgAmount(priceUsd))}$suffix';
    default:
      return 'SSP ${NumberFormat('#,###').format(priceSsp)}$suffix';
  }
}

String formatOrderTotal(
  String currency,
  num totalSsp,
  num totalUsd, {
  ExchangeRates rates = ExchangeRates.defaults,
}) {
  switch (currency) {
    case 'USD':
      return '\$${totalUsd.toStringAsFixed(2)} USD';
    case 'SSP':
      return 'SSP ${NumberFormat('#,###').format(totalSsp)}';
    case 'USG':
      return 'USG ${NumberFormat('#,###').format(rates.usdToUsgAmount(totalUsd))}';
    default:
      return 'SSP ${NumberFormat('#,###').format(totalSsp)}';
  }
}

bool isSupportedCurrency(String value) => BrandConfig.currencies.contains(value);
