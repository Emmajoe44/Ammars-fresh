class Product {
  const Product({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.categoryId,
    required this.farmerId,
    required this.quantity,
    required this.unit,
    required this.priceSSP,
    required this.priceUSD,
    required this.available,
    this.description,
    this.categoryName,
    this.farmerName,
    this.farmName,
    this.harvestDate,
    this.imageUrl,
    this.qualityGrade,
  });

  final int id;
  final String name;
  final String nameAr;
  final String? description;
  final int categoryId;
  final String? categoryName;
  final int farmerId;
  final String? farmerName;
  final String? farmName;
  final int quantity;
  final String unit;
  final num priceSSP;
  final num priceUSD;
  final bool available;
  final String? harvestDate;
  final String? imageUrl;
  final String? qualityGrade;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      nameAr: json['nameAr'] as String,
      description: json['description'] as String?,
      categoryId: json['categoryId'] as int,
      categoryName: json['categoryName'] as String?,
      farmerId: json['farmerId'] as int,
      farmerName: json['farmerName'] as String?,
      farmName: json['farmName'] as String?,
      quantity: json['quantity'] as int,
      unit: (json['unit'] as String?) ?? 'unit',
      priceSSP: json['priceSSP'] as num,
      priceUSD: json['priceUSD'] as num,
      available: json['available'] as bool? ?? true,
      harvestDate: json['harvestDate'] as String?,
      imageUrl: json['imageUrl'] as String?,
      qualityGrade: json['qualityGrade'] as String?,
    );
  }
}

class Category {
  const Category({required this.id, required this.name, this.nameAr});

  final int id;
  final String name;
  final String? nameAr;

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as int,
      name: json['name'] as String,
      nameAr: json['nameAr'] as String?,
    );
  }
}

class CartItem {
  const CartItem({
    required this.productId,
    required this.name,
    required this.nameAr,
    required this.priceSSP,
    required this.priceUSD,
    required this.unit,
    required this.farmerName,
    required this.available,
    this.farmName,
    this.quantity = 1,
  });

  final int productId;
  final String name;
  final String nameAr;
  final num priceSSP;
  final num priceUSD;
  final String unit;
  final String farmerName;
  final String? farmName;
  final bool available;
  final int quantity;

  CartItem copyWith({int? quantity}) {
    return CartItem(
      productId: productId,
      name: name,
      nameAr: nameAr,
      priceSSP: priceSSP,
      priceUSD: priceUSD,
      unit: unit,
      farmerName: farmerName,
      farmName: farmName,
      available: available,
      quantity: quantity ?? this.quantity,
    );
  }
}
