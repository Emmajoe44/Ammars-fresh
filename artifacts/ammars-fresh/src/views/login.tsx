import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PublicNav } from "@/components/PublicNav";
import { Leaf, AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { brand } from "@/lib/brand";

const schema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { push: setLocation } = useRouter();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    const raw = values.identifier.trim();
    const identifier = raw.includes("@") ? raw.toLowerCase() : raw.replace(/\s+/g, "");
    const data = { identifier, password: values.password };
    loginMutation.mutate({ data }, {
      onSuccess: (data) => {
        login(data.token, data.user as Parameters<typeof login>[1]);
        const role = data.user.role;
        if (role === "retailer") setLocation("/retailer");
        else if (role === "farmer") setLocation("/farmer");
        else setLocation("/admin");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email/phone or password", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center p-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your {brand.name} account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="identifier" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="you@example.com or +211 9XX XXX XXX" className="pl-10" data-testid="input-identifier" autoComplete="username" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" data-testid="input-password" {...field} />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full font-semibold" disabled={loginMutation.isPending} data-testid="button-submit-login">
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <button onClick={() => setLocation("/register")} className="text-primary font-semibold hover:underline" data-testid="link-to-register">
              Register here
            </button>
          </p>
        </div>
      </motion.div>
      </main>
    </div>
  );
}
