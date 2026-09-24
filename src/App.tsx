
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import AdminLeads from "./pages/AdminLeads";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ServicesIndex from "./pages/ServicesIndex";
import ServicePage from "./pages/ServicePage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cabinet from "./pages/Cabinet";
import AuthCallback from "./pages/AuthCallback";
import ChatWidget from "./components/chat/ChatWidget";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/admin" element={<AdminLeads />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/uslugi" element={<ServicesIndex />} />
          <Route path="/uslugi/:slug" element={<ServicePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;