/// API base URL for the AMMARS FRESH Next.js server.
///
/// Override at build/run time:
/// `flutter run --dart-define=API_BASE_URL=http://192.168.1.20:3000`
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000',
);

String resolveImageUrl(String? value) {
  if (value == null || value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  final base = apiBaseUrl.replaceAll(RegExp(r'/+$'), '');
  if (value.startsWith('/objects/')) {
    return '$base/api/storage$value';
  }
  if (value.startsWith('/')) {
    return '$base$value';
  }
  return '$base/api/storage/$value';
}
