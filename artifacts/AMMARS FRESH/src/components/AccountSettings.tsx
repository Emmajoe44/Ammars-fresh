import { useState } from "react";
import { useChangePassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LangContext";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

export function AccountSettings() {
  const { t } = useLang();
  const { toast } = useToast();
  const changePwd = useChangePassword();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

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

  return (
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
  );
}
