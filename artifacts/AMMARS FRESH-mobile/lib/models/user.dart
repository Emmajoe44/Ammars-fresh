class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
    required this.currency,
    required this.language,
    this.email,
    this.farmName,
    this.location,
    this.avatarUrl,
  });

  final int id;
  final String name;
  final String phone;
  final String? email;
  final String role;
  final String currency;
  final String language;
  final String? farmName;
  final String? location;
  final String? avatarUrl;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as int,
      name: json['name'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      role: json['role'] as String,
      currency: (json['currency'] as String?) ?? 'SSP',
      language: (json['language'] as String?) ?? 'en',
      farmName: json['farmName'] as String?,
      location: json['location'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'role': role,
        'currency': currency,
        'language': language,
        'farmName': farmName,
        'location': location,
        'avatarUrl': avatarUrl,
      };
}
