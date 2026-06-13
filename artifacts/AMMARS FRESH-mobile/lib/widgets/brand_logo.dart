import 'package:flutter/material.dart';

import '../config/brand_config.dart';
import '../theme/app_theme.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.inverted = false, this.large = false});

  final bool inverted;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final fg = inverted ? Colors.white : AppColors.primary;
    final accent = inverted ? Colors.white70 : AppColors.secondary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: large ? 44 : 36,
          height: large ? 44 : 36,
          decoration: BoxDecoration(
            color: inverted ? Colors.white.withValues(alpha: 0.2) : AppColors.primary,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.eco_rounded,
            color: inverted ? Colors.white : Colors.white,
            size: large ? 26 : 22,
          ),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              BrandConfig.name,
              style: TextStyle(
                color: fg,
                fontSize: large ? 24 : 18,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
            ),
            if (large)
              Text(
                BrandConfig.tagline,
                style: TextStyle(color: accent, fontSize: 12),
              ),
          ],
        ),
      ],
    );
  }
}
