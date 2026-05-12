import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, ShoppingBasket, Tractor, LayoutDashboard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
      <PublicNav />

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
            South Sudan's<br />
            <span className="text-primary">Fresh Produce</span><br />
            Marketplace
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Connecting farmers, retailers, and logistics — from farm to market across South Sudan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/login?role=retailer")}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
              data-testid="button-retailer-entry"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center">
                <ShoppingBasket className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-foreground">I am a Retailer</p>
                <p className="text-xs text-muted-foreground mt-0.5">Buy fresh produce</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/login?role=farmer")}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
              data-testid="button-farmer-entry"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Tractor className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">I am a Farmer</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sell your harvest</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/login?role=admin")}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
              data-testid="button-admin-entry"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">Admin Login</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage the platform</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>

          <p className="mt-8 text-muted-foreground text-sm">
            New here?{" "}
            <button onClick={() => setLocation("/register")} className="text-primary font-semibold hover:underline" data-testid="link-register">
              Create an account
            </button>
          </p>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
