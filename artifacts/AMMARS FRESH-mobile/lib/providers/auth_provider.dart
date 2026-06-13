import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/brand_config.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../utils/format_price.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider() {
    _load();
  }

  static const _tokenKey = 'agrimarket_token';
  static const _userKey = 'agrimarket_user';
  static const _currencyKey = 'agrimarket_currency';

  final ApiClient api = ApiClient();

  AuthUser? _user;
  String? _token;
  String _currency = 'SSP';
  bool _loading = true;

  AuthUser? get user => _user;
  String? get token => _token;
  String get currency => _currency;
  bool get isLoading => _loading;
  bool get isAuthenticated => _token != null && _user != null;

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedToken = prefs.getString(_tokenKey);
      final storedUser = prefs.getString(_userKey);
      final storedCurrency = prefs.getString(_currencyKey);
      if (storedToken != null && storedUser != null) {
        _token = storedToken;
        _user = AuthUser.fromJson(
          jsonDecode(storedUser) as Map<String, dynamic>,
        );
        api.setToken(storedToken);
      }
      if (storedCurrency != null && isSupportedCurrency(storedCurrency)) {
        _currency = storedCurrency;
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signIn(String token, AuthUser user) async {
    _token = token;
    _user = user;
    _currency = user.currency;
    api.setToken(token);
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.setString(_tokenKey, token),
      prefs.setString(_userKey, jsonEncode(user.toJson())),
      prefs.setString(_currencyKey, user.currency),
    ]);
    notifyListeners();
  }

  Future<void> signOut() async {
    _token = null;
    _user = null;
    api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.remove(_tokenKey),
      prefs.remove(_userKey),
      prefs.remove(_currencyKey),
    ]);
    notifyListeners();
  }

  Future<void> login(String identifier, String password) async {
    final raw = identifier.trim();
    final id = raw.contains('@')
        ? raw.toLowerCase()
        : raw.replaceAll(RegExp(r'\s+'), '');
    final result = await api.login(identifier: id, password: password);
    await signIn(result.token, result.user);
  }

  Future<void> register(Map<String, dynamic> body) async {
    final result = await api.register(body);
    await signIn(result.token, result.user);
  }

  void setCurrency(String value) {
    if (!isSupportedCurrency(value)) return;
    _currency = value;
    SharedPreferences.getInstance().then(
      (prefs) => prefs.setString(_currencyKey, value),
    );
    notifyListeners();
  }
}
