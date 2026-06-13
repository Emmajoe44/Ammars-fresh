import { useRef } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { resolveImageSrc } from "@/lib/image-url";
import { Camera, Loader2, Trash2 } from "lucide-react";

interface ProfilePhotoUploadProps {
  avatarUrl?: string | null;
  fallbackIcon?: React.ReactNode;
  compact?: boolean;
}

export function ProfilePhotoUpload({
  avatarUrl,
  fallbackIcon,
  compact = false,
}: ProfilePhotoUploadProps) {
  const { user, updateUser } = useAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const updateMe = useUpdateMe();

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

  const previewSrc = resolveImageSrc(avatarUrl ?? user?.avatarUrl);
  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  if (compact) {
    return (
      <div className="relative group">
        <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" data-testid="input-avatar" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border border-border hover:ring-2 hover:ring-primary/40 transition-all disabled:opacity-60"
          data-testid="button-upload-avatar"
          aria-label={t("Upload profile photo", "تحميل صورة الملف")}
        >
          {previewSrc ? (
            <img src={previewSrc} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            fallbackIcon ?? <span className="text-xl font-extrabold text-primary">{initials}</span>
          )}
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-colors">
            <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          {isUploading && (
            <span className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
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
              fallbackIcon ?? <span className="text-3xl font-extrabold text-primary">{initials}</span>
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
