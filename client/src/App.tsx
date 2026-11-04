import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trackEvent } from "./lib/analytics";
import AreasAtendidas from "./pages/AreasAtendidas";
import BolosPersonalizados from "./pages/BolosPersonalizados";
import BuffetParaFestas from "./pages/BuffetParaFestas";
import DocesParaFestas from "./pages/DocesParaFestas";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Receitas from "./pages/Receitas";
import ReceitaDetalhe from "./pages/ReceitaDetalhe";
import Promocoes from "./pages/Promocoes";

function RouteAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      trackEvent("page_view", {
        page_path: location,
        page_title: document.title,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <RouteAnalytics />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/buffet-para-festas" component={BuffetParaFestas} />
        <Route path="/bolos-personalizados" component={BolosPersonalizados} />
        <Route path="/doces-para-festas" component={DocesParaFestas} />
        <Route path="/areas-atendidas" component={AreasAtendidas} />
        <Route path="/politicas-e-termos" component={Legal} />
        <Route path="/receitas" component={Receitas} />
        <Route path="/receitas/:slug" component={ReceitaDetalhe} />
        <Route path="/promocoes" component={Promocoes} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
