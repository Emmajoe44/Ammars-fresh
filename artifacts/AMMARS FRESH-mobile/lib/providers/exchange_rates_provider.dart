import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/exchange_rates.dart';
import '../services/api_client.dart';

class ExchangeRatesProvider extends ChangeNotifier {
  ExchangeRatesProvider({ApiClient? api}) : _api = api ?? ApiClient();

  static const _sspKey = 'agrimarket_usd_to_ssp_rate';
  static const _usgKey = 'agrimarket_usd_to_usg_rate';

  final ApiClient _api;
  ExchangeRates _rates = ExchangeRates.defaults;
  bool _loading = true;

  ExchangeRates get rates => _rates;
  bool get isLoading => _loading;

  Future<void> load() async {
    _loading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedSsp = prefs.getDouble(_sspKey);
      final cachedUsg = prefs.getDouble(_usgKey);
      if (cachedSsp != null && cachedUsg != null && cachedSsp > 0 && cachedUsg > 0) {
        _rates = ExchangeRates(usdToSsp: cachedSsp, usdToUsg: cachedUsg);
      }
      final remote = await _api.getExchangeRates();
      _rates = remote;
      await prefs.setDouble(_sspKey, remote.usdToSsp);
      await prefs.setDouble(_usgKey, remote.usdToUsg);
    } catch (_) {
      // Keep cached or default rates when offline.
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
