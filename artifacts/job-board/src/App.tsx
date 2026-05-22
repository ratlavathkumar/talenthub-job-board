import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useCompanyAuth } from "@/hooks/use-company-auth";
import { CustomCursor } from "@/components/cursor";
import {
  ThemeContext, AdminContext, UserAuthContext, CompanyAuthContext,
} from "@/contexts";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import PostJob from "@/pages/post-job";
import Admin from "@/pages/admin";
import Track from "@/pages/track";
import Saved from "@/pages/saved";
import Login from "@/pages/login";
import Register from "@/pages/register";
import CompanyLogin from "@/pages/company-login";
import CompanyRegister from "@/pages/company-register";
import CompanyDashboard from "@/pages/company-dashboard";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, login, logout } = useAdminAuth();
  return <AdminContext.Provider value={{ isAdmin, login, logout }}>{children}</AdminContext.Provider>;
}

function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useUserAuth();
  return <UserAuthContext.Provider value={auth}>{children}</UserAuthContext.Provider>;
}

function CompanyAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useCompanyAuth();
  return <CompanyAuthContext.Provider value={auth}>{children}</CompanyAuthContext.Provider>;
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/company/login" component={CompanyLogin} />
      <Route path="/company/register" component={CompanyRegister} />
      <Route path="/company/dashboard" component={CompanyDashboard} />
      <Route path="/profile" component={Profile} />
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
            <UserAuthProvider>
              <CompanyAuthProvider>
                <CustomCursor />
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </CompanyAuthProvider>
            </UserAuthProvider>
          </AdminProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
