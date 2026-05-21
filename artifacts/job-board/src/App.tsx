import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext } from "react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { CustomCursor } from "@/components/cursor";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import PostJob from "@/pages/post-job";
import Admin from "@/pages/admin";
import Track from "@/pages/track";
import Saved from "@/pages/saved";

export const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useThemeContext = () => useContext(ThemeContext);

export const AdminContext = createContext<{
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});
export const useAdminContext = () => useContext(AdminContext);

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, login, logout } = useAdminAuth();
  return <AdminContext.Provider value={{ isAdmin, login, logout }}>{children}</AdminContext.Provider>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/post-job" component={PostJob} />
      <Route path="/admin" component={Admin} />
      <Route path="/track" component={Track} />
      <Route path="/saved" component={Saved} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AdminProvider>
            <CustomCursor />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AdminProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
