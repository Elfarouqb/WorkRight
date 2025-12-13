import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Rechtenverkenner from "./pages/Rechtenverkenner";
import Tijdlijn from "./pages/Tijdlijn";
import Termijnen from "./pages/Termijnen";
import Procesgids from "./pages/Procesgids";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <VoiceAssistant />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/rechtenverkenner" element={<Rechtenverkenner />} />
              <Route path="/tijdlijn" element={<Tijdlijn />} />
              <Route path="/termijnen" element={<Termijnen />} />
              <Route path="/procesgids" element={<Procesgids />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
