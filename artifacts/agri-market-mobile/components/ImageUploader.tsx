import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface Props {
  value?: string | null;
  onChange: (objectPath: string | null) => void;
  label?: string;
}

function resolveSrc(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/objects/")) {
    const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
    return `${base}/api/storage${value}`;
  }
  return value;
}

export function ImageUploader({ value, onChange, label = "Product image" }: Props) {
  const colors = useColors();
  const [busy, setBusy] = useState(false);
  const previewSrc = resolveSrc(value);

  const pick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access to choose an image.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];

      setBusy(true);
      const contentType = asset.mimeType ?? "image/jpeg";
      const filename = asset.fileName ?? `upload-${Date.now()}.jpg`;
      const fileSize = asset.fileSize ?? 0;

      const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
      const reqRes = await fetch(`${base}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: filename, size: fileSize || 1, contentType }),
      });
      if (!reqRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await reqRes.json();

      const blob = await (await fetch(asset.uri)).blob();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      onChange(objectPath);
    } catch (err: any) {
      Alert.alert("Upload failed", err?.message ?? "Could not upload image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.label, { color: colors.foreground, fontFamily: PJS.medium }]}>{label}</Text>
      {previewSrc ? (
        <View style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Image source={{ uri: previewSrc }} style={styles.image} resizeMode="cover" />
          <Pressable
            onPress={() => onChange(null)}
            style={[styles.removeBtn, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            testID="button-remove-image"
          >
            <Feather name="x" size={16} color="#fff" />
          </Pressable>
          <Pressable
            onPress={pick}
            disabled={busy}
            style={[styles.replaceBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            testID="button-replace-image"
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="refresh-cw" size={14} color={colors.foreground} />
                <Text style={[styles.replaceText, { color: colors.foreground, fontFamily: PJS.medium }]}>Replace</Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          disabled={busy}
          style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.muted }]}
          testID="button-pick-image"
        >
          {busy ? (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.placeholderText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>Uploading…</Text>
            </>
          ) : (
            <>
              <Feather name="image" size={28} color={colors.mutedForeground} />
              <Text style={[styles.placeholderText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>Tap to choose an image</Text>
              <Text style={[styles.placeholderHint, { color: colors.mutedForeground, fontFamily: PJS.regular }]}>JPG / PNG · max 5 MB</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13 },
  preview: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  replaceBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
      default: {},
    }),
  },
  replaceText: { fontSize: 12 },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  placeholderText: { fontSize: 13 },
  placeholderHint: { fontSize: 11 },
});
