import { useRef, useState } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useUpdateMe, useChangePassword, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { resolveImageSrc } from "@/lib/image-url";
import { Camera, Loader2, Lock, ShieldCheck, Trash2, User } from "lucide-react";

export function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const updateMe = useUpdateMe();
  const changePwd = useChangePassword();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const { uploadFile, isUploading } = useUpload({
    getRequestHeaders: () => {
      const tok = typeof window !== "undefined" ? localStorage.getItem("agrimarket_token") : null;
      const headers: Record<string, string> = {};
      if (tok) headers.Authorization = `Bearer ${tok}`;
      return headers;
    },
    onSuccess: async (res) => {
      try {
        const updated = await updateMe.mutateAsync({ data: { avatarUrl: res.objectPath } as any });
        updateUser(updated as any);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: t("Profile photo updated", "تم تحديث صورة الملف") });
      } catch {
        toast({ title: t("Could not save photo", "تعذر حفظ الصورة"), variant: "destructive" });
      }
    },
    onError: (err) => {
      toast({
        title: t("Upload failed", "فشل التحميل"),
        description: err.message ?? "",
        variant: "destructive",
      });
    },
  });

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("Please choose an image file", "يرجى اختيار ملف صورة"), variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("Image must be smaller than 5 MB", "يجب أن تكون الصورة أصغر من 5 ميجابايت"), variant: "destructive" });
      return;
    }
    await uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await updateMe.mutateAsync({ data: { avatarUrl: null } as any });
      updateUser(updated as any);
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: t("Profile photo removed", "تمت إزالة الصورة") });
    } catch {
      toast({ title: t("Could not remove photo", "تعذر إزالة الصورة"), variant: "destructive" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd) {
      toast({ title: t("Fill all password fields", "املأ جميع حقول كلمة المرور"), variant: "destructive" });
      return;
    }
    if (newPwd.length < 6) {
      toast({ title: t("New password must be at least 6 characters", "يجب أن تكون كلمة المرور 6 أحرف على الأقل"), variant: "destructive" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: t("Passwords do not match", "كلمات المرور غير متطابقة"), variant: "destructive" });
      return;
    }
    try {
      await changePwd.mutateAsync({ data: { currentPassword: currentPwd, newPassword: newPwd } });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast({ title: t("Password changed", "تم تغيير كلمة المرور"), description: t("Use your new password next time you sign in.", "استخدم كلمة المرور الجديدة في تسجيل الدخول التالي.") });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Failed";
      toast({ title: t("Could not change password", "تعذر تغيير كلمة المرور"), description: msg, variant: "destructive" });
    }
  };

  const previewSrc = resolveImageSrc(user?.avatarUrl);
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground">{t("Profile photo", "صورة الملف")}</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border border-border">
              {previewSrc ? (
                <img src={previewSrc} alt="Avatar" className="w-full h-full object-cover" data-testid="img-avatar" />
              ) : (
                <span className="text-3xl font-extrabold text-primary">{initials}</span>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" data-testid="input-avatar" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} data-testid="button-upload-avatar">
                <Camera className="w-4 h-4 mr-2" />
                {previewSrc ? t("Replace photo", "استبدال الصورة") : t("Upload photo", "تحميل صورة")}
              </Button>
              {previewSrc && (
                <Button type="button" variant="outline" onClick={handleRemoveAvatar} disabled={updateMe.isPending} data-testid="button-remove-avatar">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("Remove", "إزالة")}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("JPG / PNG, max 5 MB", "JPG / PNG، الحد الأقصى 5 ميجابايت")}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground">{t("Change password", "تغيير كلمة المرور")}</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-password" className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t("Current password", "كلمة المرور الحالية")}</Label>
          <Input id="current-password" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} autoComplete="current-password" data-testid="input-current-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password" className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t("New password", "كلمة المرور الجديدة")}</Label>
          <Input id="new-password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" placeholder={t("Min 6 characters", "6 أحرف على الأقل")} data-testid="input-new-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />{t("Confirm new password", "تأكيد كلمة المرور")}</Label>
          <Input id="confirm-password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} autoComplete="new-password" data-testid="input-confirm-password" />
        </div>
        <Button type="submit" className="w-full" disabled={changePwd.isPending} data-testid="button-change-password">
          {changePwd.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
          {t("Change password", "تغيير كلمة المرور")}
        </Button>
      </form>
    </div>
  );
}

export function ProfileAvatar({ avatarUrl, fallbackIcon }: { avatarUrl?: string | null; fallbackIcon: React.ReactNode }) {
  const src = resolveImageSrc(avatarUrl);
  return (
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
      {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : fallbackIcon}
    </div>
  );
}
