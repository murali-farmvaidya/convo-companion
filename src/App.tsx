import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ChatWidget from "@/components/chat/ChatWidget";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="w-full h-screen" style={{background: 'linear-gradient(to bottom right, #fffacd, #ffecb3, #d0ebe5, #faf5f0)'}}>
            {/* Keep routes minimal; page intentionally blank behind floating widget */}
            <Routes>
              {/* Render nothing for all routes to keep background clean */}
              <Route path="*" element={<div />} />
            </Routes>
            {/* Floating customer-support widget in bottom-right */}
            <ChatWidget 
              apiBaseUrl="http://localhost:3000/api"
              theme="light"
              floating={true}
              title="Customer Support"
            />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
