import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useChangePassword, useUpdateMe } from "@workspace/api-client-react";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { PJS, PrimaryButton, SectionLabel } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

function resolveSrc(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/objects/")) {
    const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
    return `${base}/api/storage${value}`;
  }
  return value;
}

interface Props {
  tint?: string;
}

export function AccountSecurity({ tint }: Props) {
  const colors = useColors();
  const { user, signIn, token } = useAuth();
  const accent = tint ?? colors.primary;

  const updateMe = useUpdateMe();
  const changePwd = useChangePassword();
  const [busy, setBusy] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const persistUser = async (updated: any) => {
    if (!token) return;
    await signIn(token, { ...(user as any), ...updated });
  };

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];

      setBusy(true);
      const contentType = asset.mimeType ?? "image/jpeg";
      const filename = asset.fileName ?? `avatar-${Date.now()}.jpg`;
      const fileSize = asset.fileSize ?? 0;
      const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
      const tk = await AsyncStorage.getItem("agrimarket_token");

      const reqRes = await fetch(`${base}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
        },
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

      const updated = await updateMe.mutateAsync({ data: { avatarUrl: objectPath } as any });
      await persistUser(updated);
      Alert.alert("Photo updated", "Your profile photo has been saved.");
    } catch (err: any) {
      Alert.alert("Upload failed", err?.message ?? "Could not upload image.");
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    try {
      setBusy(true);
      const updated = await updateMe.mutateAsync({ data: { avatarUrl: null } as any });
      await persistUser(updated);
    } catch {
      Alert.alert("Could not remove photo", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd) {
      Alert.alert("Missing fields", "Please fill in your current and new password.");
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert("Too short", "New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Passwords do not match", "Please re-enter your new password.");
      return;
    }
    try {
      await changePwd.mutateAsync({ data: { currentPassword: currentPwd, newPassword: newPwd } });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      Alert.alert("Password changed", "Use your new password next time you sign in.");
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Could not change password.";
      Alert.alert("Change failed", msg);
    }
  };

  const previewSrc = resolveSrc(user?.avatarUrl);
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <>
      <SectionLabel label="Profile photo" />
      <Card>
        <View style={styles.photoRow}>
          <Pressable onPress={pickAndUpload} disabled={busy}>
            <View style={[styles.avatar, { backgroundColor: accent + "1A", borderColor: colors.border }]}>
              {previewSrc ? (
                <Image source={{ uri: previewSrc }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={[styles.avatarTxt, { color: accent, fontFamily: PJS.black }]}>{initials}</Text>
              )}
              {busy ? (
                <View style={styles.spinnerOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : null}
              <View style={[styles.cameraBadge, { backgroundColor: accent }]}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            </View>
          </Pressable>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[styles.photoTitle, { color: colors.foreground, fontFamily: PJS.bold }]}>
              {previewSrc ? "Change your photo" : "Add a profile photo"}
            </Text>
            <Text style={[styles.photoHint, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
              JPG / PNG · square crop works best
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Pressable
                onPress={pickAndUpload}
                disabled={busy}
                style={({ pressed }) => [
                  styles.smallBtn,
                  { backgroundColor: accent, opacity: pressed ? 0.85 : busy ? 0.6 : 1 },
                ]}
                testID="button-upload-avatar"
              >
                <Feather name={previewSrc ? "refresh-cw" : "upload"} size={13} color="#fff" />
                <Text style={[styles.smallBtnText, { color: "#fff", fontFamily: PJS.bold }]}>
                  {previewSrc ? "Replace" : "Upload"}
                </Text>
              </Pressable>
              {previewSrc ? (
                <Pressable
                  onPress={removePhoto}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    { backgroundColor: colors.muted, opacity: pressed ? 0.85 : 1 },
                  ]}
                  testID="button-remove-avatar"
                >
                  <Feather name="trash-2" size={13} color={colors.foreground} />
                  <Text style={[styles.smallBtnText, { color: colors.foreground, fontFamily: PJS.bold }]}>
                    Remove
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Card>

      <SectionLabel label="Change password" />
      <Card>
        <View style={{ gap: 12 }}>
          <PasswordInput
            label="Current password"
            value={currentPwd}
            onChange={setCurrentPwd}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
            testID="input-current-password"
          />
          <PasswordInput
            label="New password"
            value={newPwd}
            onChange={setNewPwd}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            placeholder="Min 6 characters"
            testID="input-new-password"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPwd}
            onChange={setConfirmPwd}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            testID="input-confirm-password"
          />
          <View style={{ marginTop: 6 }}>
            <PrimaryButton
              label={changePwd.isPending ? "Changing..." : "Change password"}
              icon="shield"
              trailingIcon={null}
              onPress={handleChangePassword}
              loading={changePwd.isPending}
            />
          </View>
        </View>
      </Card>
    </>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <View>
      <Text style={[styles.fieldLbl, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
        {label.toUpperCase()}
      </Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Feather name="lock" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder={placeholder ?? "••••••••"}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          testID={testID}
        />
        <Pressable onPress={onToggleShow} hitSlop={8}>
          <Feather name={show ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarTxt: { fontSize: 28 },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  photoTitle: { fontSize: 15 },
  photoHint: { fontSize: 12 },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnText: { fontSize: 12 },
  fieldLbl: { fontSize: 10, letterSpacing: 1.4, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
});
