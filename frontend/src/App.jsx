import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WhatsAppButton from "./components/WhatsAppButton";
import { AuthProvider } from "./context/AuthContext";
import { AddressProvider } from "./context/AddressContext";
import { CartProvider } from "./context/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import ProductView from "./pages/ProductView";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import MehndiHues from "./pages/MehndiHues";
import SangeetStyle from "./pages/SangeetStyle";
import ReceptionRoyalty from "./pages/ReceptionRoyalty";
import BrideSquadGoals from "./pages/BrideSquadGoals";
import DiwaliCollection from "./pages/DiwaliCollection";
import PujaCollection from "./pages/PujaCollection";
import HaldiSangeetCollection from "./pages/HaldiSangeetCollection";
import KarwachauthCollection from "./pages/KarwachauthCollection";
import SneakPeek from "./pages/SneakPeek";
import OshiCrushers from "./pages/OshiCrushers";
import CultFaves from "./pages/CultFaves";
import CuratedForYou from "./pages/CuratedForYou";
// Admin Pages
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import UserDetail from "./admin/pages/UserDetail";
import Orders from "./admin/pages/Orders";
import OrderDetail from "./admin/pages/OrderDetail";
import Products from "./admin/pages/Products";
import ProductForm from "./admin/pages/ProductForm";
import Analytics from "./admin/pages/Analytics";
import Settings from "./admin/pages/Settings";
import InventoryManagement from "./admin/pages/InventoryManagement";
import RolePermissions from "./admin/pages/RolePermissions";
// Shop Pages
import Sarees from "./pages/shop/Sarees";
import Lehengas from "./pages/shop/Lehengas";
import SuitsSets from "./pages/shop/SuitsSets";
import Gowns from "./pages/shop/Gowns";
import Kurtis from "./pages/shop/Kurtis";
import Accessories from "./pages/shop/Accessories";
// Help Pages
import TrackOrder from "./pages/help/TrackOrder";
import ReturnsExchanges from "./pages/help/ReturnsExchanges";
import ShippingInfo from "./pages/help/ShippingInfo";
import SizeGuide from "./pages/help/SizeGuide";
import FAQs from "./pages/help/FAQs";
import ContactUs from "./pages/help/ContactUs";
// About Pages
import OurStory from "./pages/about/OurStory";
import Stores from "./pages/about/Stores";
// Policy Pages
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import RefundPolicy from "./pages/policies/RefundPolicy";
import ShippingPolicy from "./pages/policies/ShippingPolicy";
// Fabric Pages
import GeorgetteGlam from "./pages/GeorgetteGlam";
import SilkSarees from "./pages/SilkSarees";
import OrganzaSuits from "./pages/OrganzaSuits";
import TissueSarees from "./pages/TissueSarees";
// Checkout
import Checkout from "./pages/Checkout";
// Navbar Pages
import Sale from "./pages/Sale";
import Bestsellers from "./pages/Bestsellers";
import NewArrivals from "./pages/NewArrivals";
import Occasion from "./pages/Occasion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <WhatsAppButton />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                <Route path="/auth/google/error" element={<GoogleAuthSuccess />} />
                <Route path="/product/:id" element={<ProductView />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/account" element={<Account />} />
                <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Navbar Routes */}
            <Route path="/sale" element={<Sale />} />
            <Route path="/bestsellers" element={<Bestsellers />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/occasion" element={<Occasion />} />
            
            {/* Category Routes */}
            <Route path="/category/mehndi-hues" element={<MehndiHues />} />
            <Route path="/category/sangeet-style" element={<SangeetStyle />} />
            <Route path="/category/reception-royalty" element={<ReceptionRoyalty />} />
            <Route path="/category/bride-squad-goals" element={<BrideSquadGoals />} />
            
            {/* Occasion Routes */}
            <Route path="/occasion/diwali" element={<DiwaliCollection />} />
            <Route path="/occasion/puja" element={<PujaCollection />} />
            <Route path="/occasion/haldi-sangeet" element={<HaldiSangeetCollection />} />
            <Route path="/occasion/karwachauth" element={<KarwachauthCollection />} />
            
            {/* Curated Routes */}
            <Route path="/curated/sneak-peek" element={<SneakPeek />} />
            <Route path="/curated/oshi-crushers" element={<OshiCrushers />} />
            <Route path="/curated/cult-faves" element={<CultFaves />} />
            <Route path="/curated/curated-for-you" element={<CuratedForYou />} />
            
            {/* Shop Routes */}
            <Route path="/shop/sarees" element={<Sarees />} />
            <Route path="/shop/lehengas" element={<Lehengas />} />
            <Route path="/shop/suits-sets" element={<SuitsSets />} />
            <Route path="/shop/gowns" element={<Gowns />} />
            <Route path="/shop/kurtis" element={<Kurtis />} />
            <Route path="/shop/accessories" element={<Accessories />} />
            
            {/* Help Routes */}
            <Route path="/help/track-order" element={<TrackOrder />} />
            <Route path="/help/returns-exchanges" element={<ReturnsExchanges />} />
            <Route path="/help/shipping-info" element={<ShippingInfo />} />
            <Route path="/help/size-guide" element={<SizeGuide />} />
            <Route path="/help/faqs" element={<FAQs />} />
            <Route path="/help/contact" element={<ContactUs />} />
            
            {/* About Routes */}
            <Route path="/about/our-story" element={<OurStory />} />
            <Route path="/about/stores" element={<Stores />} />
            
            {/* Policy Routes */}
            <Route path="/policies/privacy" element={<PrivacyPolicy />} />
            <Route path="/policies/terms" element={<TermsOfService />} />
            <Route path="/policies/refund" element={<RefundPolicy />} />
            <Route path="/policies/shipping" element={<ShippingPolicy />} />
            
            {/* Fabric Routes */}
            <Route path="/fabric/georgette-glam" element={<GeorgetteGlam />} />
            <Route path="/fabric/silk-sarees" element={<SilkSarees />} />
            <Route path="/fabric/organza-suits" element={<OrganzaSuits />} />
            <Route path="/fabric/tissue-sarees" element={<TissueSarees />} />
            
            {/* Checkout Route */}
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="role-permissions" element={<RolePermissions />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </AddressProvider>
</AuthProvider>
</QueryClientProvider>
);

export default App;
