import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LangProvider } from "@/contexts/LangContext";

import LandingPage from "@/pages/landing";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";

import RetailerHome from "@/pages/retailer/home";
import RetailerProducts from "@/pages/retailer/products";
import RetailerCart from "@/pages/retailer/cart";
import RetailerOrders from "@/pages/retailer/orders";
import RetailerOrderDetail from "@/pages/retailer/order-detail";
import RetailerProfile from "@/pages/retailer/profile";

import FarmerHome from "@/pages/farmer/home";
import FarmerProducts from "@/pages/farmer/products";
import FarmerAddProduct from "@/pages/farmer/add-product";
import FarmerEditProduct from "@/pages/farmer/edit-product";
import FarmerSales from "@/pages/farmer/sales";
import FarmerProfile from "@/pages/farmer/profile";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import AdminTrucks from "@/pages/admin/trucks";
import AdminAddTruck from "@/pages/admin/add-truck";
import AdminFarmers from "@/pages/admin/farmers";
import AdminRetailers from "@/pages/admin/retailers";
import AdminPricing from "@/pages/admin/pricing";
import AdminAnalytics from "@/pages/admin/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role)) return <Redirect to="/" />;
  return <Component />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/retailer">{() => <ProtectedRoute component={RetailerHome} roles={["retailer"]} />}</Route>
      <Route path="/retailer/products">{() => <ProtectedRoute component={RetailerProducts} roles={["retailer"]} />}</Route>
      <Route path="/retailer/cart">{() => <ProtectedRoute component={RetailerCart} roles={["retailer"]} />}</Route>
      <Route path="/retailer/orders">{() => <ProtectedRoute component={RetailerOrders} roles={["retailer"]} />}</Route>
      <Route path="/retailer/orders/:id">{() => <ProtectedRoute component={RetailerOrderDetail} roles={["retailer"]} />}</Route>
      <Route path="/retailer/profile">{() => <ProtectedRoute component={RetailerProfile} roles={["retailer"]} />}</Route>

      <Route path="/farmer">{() => <ProtectedRoute component={FarmerHome} roles={["farmer"]} />}</Route>
      <Route path="/farmer/products">{() => <ProtectedRoute component={FarmerProducts} roles={["farmer"]} />}</Route>
      <Route path="/farmer/products/new">{() => <ProtectedRoute component={FarmerAddProduct} roles={["farmer"]} />}</Route>
      <Route path="/farmer/products/:id/edit">{() => <ProtectedRoute component={FarmerEditProduct} roles={["farmer"]} />}</Route>
      <Route path="/farmer/sales">{() => <ProtectedRoute component={FarmerSales} roles={["farmer"]} />}</Route>
      <Route path="/farmer/profile">{() => <ProtectedRoute component={FarmerProfile} roles={["farmer"]} />}</Route>

      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} roles={["admin"]} />}</Route>
      <Route path="/admin/orders">{() => <ProtectedRoute component={AdminOrders} roles={["admin"]} />}</Route>
      <Route path="/admin/orders/:id">{() => <ProtectedRoute component={AdminOrderDetail} roles={["admin"]} />}</Route>
      <Route path="/admin/trucks">{() => <ProtectedRoute component={AdminTrucks} roles={["admin"]} />}</Route>
      <Route path="/admin/trucks/new">{() => <ProtectedRoute component={AdminAddTruck} roles={["admin"]} />}</Route>
      <Route path="/admin/farmers">{() => <ProtectedRoute component={AdminFarmers} roles={["admin"]} />}</Route>
      <Route path="/admin/retailers">{() => <ProtectedRoute component={AdminRetailers} roles={["admin"]} />}</Route>
      <Route path="/admin/pricing">{() => <ProtectedRoute component={AdminPricing} roles={["admin"]} />}</Route>
      <Route path="/admin/analytics">{() => <ProtectedRoute component={AdminAnalytics} roles={["admin"]} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppRoutes />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}

export default App;
