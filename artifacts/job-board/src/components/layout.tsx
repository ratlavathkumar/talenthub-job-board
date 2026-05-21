import { Link, useLocation } from "wouter";
import { Briefcase, Sparkles, Moon, Sun, Heart, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { useThemeContext, useAdminContext } from "@/App";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { Badge } from "./ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useThemeContext();
  const { savedIds } = useSavedJobs();
  const { isAdmin } = useAdminContext();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-border/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm shadow-primary/30">
                <Briefcase className="h-4.5 w-4.5" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-300 animate-pulse" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block tracking-tight group-hover:text-primary transition-colors">TalentHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/jobs"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.startsWith("/jobs")
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="link-nav-jobs"
              >
                Find Jobs
              </Link>
              <Link
                href="/track"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location === "/track"
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="link-nav-track"
              >
                Track Applications
              </Link>
              <Link
                href="/saved"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  location === "/saved"
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid="link-nav-saved"
              >
                <Heart className="w-3.5 h-3.5" />
                Saved Jobs
                {savedIds.length > 0 && (
                  <Badge className="ml-0.5 px-1.5 py-0 h-5 text-[10px] bg-rose-500 text-white rounded-full border-0 shadow-sm">
                    {savedIds.length}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9 rounded-full hover:bg-muted"
              data-testid="btn-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Link href="/admin" data-testid="link-admin">
              <Button
                variant={location.startsWith("/admin") || location === "/post-job" ? "default" : "ghost"}
                size="sm"
                className={`gap-1.5 rounded-full px-4 text-sm font-medium ${
                  isAdmin
                    ? "bg-gradient-to-r from-violet-600 to-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/30"
                    : location.startsWith("/admin") || location === "/post-job"
                    ? ""
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAdmin ? "Admin Panel" : "Admin"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">{children}</main>

      <footer className="border-t py-12 bg-card mt-auto border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/3 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-lg tracking-tight">TalentHub</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Connecting serious professionals with companies that care about craft, culture, and product quality.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Candidates</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link></li>
                <li><Link href="/saved" className="hover:text-primary transition-colors">Saved Jobs</Link></li>
                <li><Link href="/track" className="hover:text-primary transition-colors">Track Applications</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Employers</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                <li><Link href="/post-job" className="hover:text-primary transition-colors">Post a Job</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TalentHub Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
