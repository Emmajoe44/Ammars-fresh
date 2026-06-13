import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { brand } from "@/lib/brand";
import { currencyOptions } from "@/lib/currency-labels";
import { useGetMe, getGetMeQueryKey, useUpdateMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Globe, DollarSign, Phone } from "lucide-react";
import { AccountSettings } from "@/components/AccountSettings";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";

export default function RetailerProfile() {
  const { user, updateUser } = useAuth();
  const { t, lang, setLang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const updateMe = useUpdateMe();

  const form = useForm({
    values: { name: me?.name ?? "", phone: me?.phone ?? "", location: me?.location ?? "", currency: me?.currency ?? "SSP", language: me?.language ?? "en" },
  });

  const onSubmit = (values: any) => {
    updateMe.mutate({ data: values }, {
      onSuccess: (updated) => {
        updateUser(updated as any);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        if (updated.language !== lang) setLang(updated.language as "en" | "ar");
        toast({ title: t("Profile updated", "تم تحديث الملف") });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || err?.message || "Failed to update";
        toast({ title: t("Could not update profile", "تعذر تحديث الملف"), description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-foreground">{me?.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{me?.role}</p>
        </div>

        <div className="mb-6">
          <ProfilePhotoUpload avatarUrl={me?.avatarUrl} fallbackIcon={<User className="w-8 h-8 text-primary" />} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground mb-4">{t("Edit Profile", "تعديل الملف")}</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{t("Name", "الاسم")}</FormLabel>
                  <FormControl><Input data-testid="input-profile-name" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{t("Phone number", "رقم الهاتف")}</FormLabel>
                  <FormControl><Input type="tel" inputMode="tel" placeholder="+211 9XX XXX XXX" data-testid="input-profile-phone" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{t("Location", "الموقع")}</FormLabel>
                  <FormControl><Input placeholder={t("Your market location", "موقع السوق")} data-testid="input-profile-location" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{t("Preferred currency", "العملة المفضلة")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {currencyOptions.map(({ code, label }) => (
                        <SelectItem key={code} value={code}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{t("Language", "اللغة")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={updateMe.isPending} data-testid="button-save-profile">
                {updateMe.isPending ? t("Saving...", "جاري الحفظ...") : t("Save Changes", "حفظ التغييرات")}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-6">
          <AccountSettings />
        </div>
      </div>
    </AppLayout>
  );
}
