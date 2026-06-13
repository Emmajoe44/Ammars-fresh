class ExchangeRates {
  const ExchangeRates({
    required this.usdToSsp,
    required this.usdToUsg,
    this.updatedAt,
  });

  static const defaults = ExchangeRates(usdToSsp: 4500, usdToUsg: 3800);

  final double usdToSsp;
  final double usdToUsg;
  final String? updatedAt;

  factory ExchangeRates.fromJson(Map<String, dynamic> json) {
    final usdToSsp = (json['usdToSsp'] as num?)?.toDouble() ?? defaults.usdToSsp;
    final usdToUsg = (json['usdToUsg'] as num?)?.toDouble() ?? defaults.usdToUsg;
    return ExchangeRates(
      usdToSsp: usdToSsp > 0 ? usdToSsp : defaults.usdToSsp,
      usdToUsg: usdToUsg > 0 ? usdToUsg : defaults.usdToUsg,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  int usdToUsgAmount(num priceUsd) => (priceUsd * usdToUsg).round();
}
