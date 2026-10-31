import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackEvent } from "./lib/analytics";
import ConsentBanner from "./components/ConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AreasAtendidas from "./pages/AreasAtendidas";
import BolosPersonalizados from "./pages/BolosPersonalizados";
import BuffetParaFestas from "./pages/BuffetParaFestas";
import DocesParaFestas from "./pages/DocesParaFestas";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Sobre from "./pages/Sobre";
import FAQ from "./pages/FAQ";
import { OrganizationSchema } from "./seo/JsonLd";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buffet-para-festas" component={BuffetParaFestas} />
      <Route path="/bolos-personalizados" component={BolosPersonalizados} />
      <Route path="/doces-para-festas" component={DocesParaFestas} />
      <Route path="/areas-atendidas" component={AreasAtendidas} />
      <Route path="/sobre" component={Sobre} />
      <Route path="/faq" component={FAQ} />
      <Route path="/politicas-e-termos" component={Legal} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AnalyticsNavigation() {
  const [location] = useLocation();
  useEffect(() => {
    trackEvent("page_view", { page_path: location, page_title: document.title });
  }, [location]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <OrganizationSchema />
          <AnalyticsNavigation />
          <Router />
          <ConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
