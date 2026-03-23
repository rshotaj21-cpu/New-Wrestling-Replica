import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "./context/DataContext";
import { Layout } from "./components/wrestling/Layout";
import { Dashboard } from "./components/wrestling/Dashboard";
import { Sessions } from "./components/wrestling/Sessions";
import { Sparring } from "./components/wrestling/Sparring";
import { Techniques } from "./components/wrestling/Techniques";
import { StrengthConditioning } from "./components/wrestling/StrengthConditioning";
import { Competitions } from "./components/wrestling/Competitions";
import { OneOnOne } from "./components/wrestling/OneOnOne";
import { CalendarView } from "./components/wrestling/CalendarView";
import { Stats } from "./components/wrestling/Stats";
import { WrestlingSystemBuilder } from "./components/wrestling/WrestlingSystemBuilder";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sparring" element={<Sparring />} />
              <Route path="/techniques" element={<Techniques />} />
              <Route path="/sc" element={<StrengthConditioning />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/121" element={<OneOnOne />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/system" element={<WrestlingSystemBuilder />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
