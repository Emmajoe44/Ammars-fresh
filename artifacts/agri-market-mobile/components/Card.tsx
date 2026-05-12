import React from "react";
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface CardProps extends ViewProps {
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ padded = true, style, children, ...rest }: CardProps) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[
        styles.card,
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: "#1a1410",
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 1 },
      web: { boxShadow: "0 2px 12px rgba(26, 20, 16, 0.04)" } as any,
      default: {},
    }),
  },
});
