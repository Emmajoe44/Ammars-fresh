import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/exchange_rates.dart';
import '../models/product.dart';
import '../models/user.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({String? token}) : _token = token;

  String? _token;

  void setToken(String? token) => _token = token;

  Map<String, String> _headers({bool jsonBody = false}) {
    final headers = <String, String>{
      if (jsonBody) 'Content-Type': 'application/json',
      if (_token != null && _token!.isNotEmpty) 'Authorization': _token!,
    };
    return headers;
  }

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = apiBaseUrl.replaceAll(RegExp(r'/+$'), '');
    return Uri.parse('$base$path').replace(queryParameters: query);
  }

  Future<Map<String, dynamic>> _decode(http.Response res) async {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return {};
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    String message = 'Request failed (${res.statusCode})';
    try {
      final body = jsonDecode(res.body);
      if (body is Map && body['error'] != null) {
        message = body['error'].toString();
      }
    } catch (_) {}
    throw ApiException(message, statusCode: res.statusCode);
  }

  Future<({String token, AuthUser user})> login({
    required String identifier,
    required String password,
  }) async {
    final res = await http.post(
      _uri('/api/auth/login'),
      headers: _headers(jsonBody: true),
      body: jsonEncode({'identifier': identifier, 'password': password}),
    );
    final data = await _decode(res);
    return (
      token: data['token'] as String,
      user: AuthUser.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  Future<({String token, AuthUser user})> register(
    Map<String, dynamic> body,
  ) async {
    final res = await http.post(
      _uri('/api/auth/register'),
      headers: _headers(jsonBody: true),
      body: jsonEncode(body),
    );
    final data = await _decode(res);
    return (
      token: data['token'] as String,
      user: AuthUser.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  Future<List<Category>> listCategories() async {
    final res = await http.get(_uri('/api/categories'), headers: _headers());
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final list = jsonDecode(res.body) as List<dynamic>;
      return list
          .map((e) => Category.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    throw ApiException('Failed to load categories', statusCode: res.statusCode);
  }

  Future<List<Product>> listProducts({
    bool? available,
    int? categoryId,
    int? farmerId,
    String? search,
    int limit = 50,
  }) async {
    final query = <String, String>{'limit': '$limit'};
    if (available != null) query['available'] = available.toString();
    if (categoryId != null) query['categoryId'] = '$categoryId';
    if (farmerId != null) query['farmerId'] = '$farmerId';
    if (search != null && search.isNotEmpty) query['search'] = search;

    final res = await http.get(_uri('/api/products', query), headers: _headers());
    final data = await _decode(res);
    final products = (data['products'] as List<dynamic>? ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
    return products;
  }

  Future<void> toggleProductAvailability(int id) async {
    final res = await http.post(
      _uri('/api/products/$id/toggle-availability'),
      headers: _headers(),
    );
    await _decode(res);
  }

  Future<void> createOrder({
    required String currency,
    required String deliveryLocation,
    required List<Map<String, dynamic>> items,
  }) async {
    final res = await http.post(
      _uri('/api/orders'),
      headers: _headers(jsonBody: true),
      body: jsonEncode({
        'currency': currency,
        'deliveryLocation': deliveryLocation,
        'items': items,
      }),
    );
    await _decode(res);
  }

  Future<List<Map<String, dynamic>>> listOrders() async {
    final res = await http.get(_uri('/api/orders'), headers: _headers());
    final data = await _decode(res);
    return (data['orders'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getAdminStats() async {
    final res = await http.get(
      _uri('/api/analytics/admin-stats'),
      headers: _headers(),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> getFarmerStats() async {
    final res = await http.get(
      _uri('/api/analytics/farmer-stats'),
      headers: _headers(),
    );
    return _decode(res);
  }

  Future<ExchangeRates> getExchangeRates() async {
    final res = await http.get(
      _uri('/api/pricing/exchange-rates'),
      headers: _headers(),
    );
    final data = await _decode(res);
    return ExchangeRates.fromJson(data);
  }
}
