import React from "react";
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ padded = true, elevated = true, style, children, ...rest }: CardProps) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        elevated && styles.elevated,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: padded ? 16 : 0,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  elevated: {
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 4px 14px rgba(26, 20, 16, 0.05)" } as any,
      default: {},
    }),
  },
});
