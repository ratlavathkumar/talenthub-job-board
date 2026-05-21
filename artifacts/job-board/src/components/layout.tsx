import { Link, useLocation } from "wouter";
import { Briefcase, Sparkles, Moon, Sun, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useThemeContext } from "@/App";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { Badge } from "./ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useThemeContext();
  const { savedIds } = useSavedJobs();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-border/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Briefcase className="h-5 w-5" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-300 animate-pulse" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block tracking-tight group-hover:text-primary transition-colors">TalentHub</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/jobs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-muted/50 ${
                  location.startsWith("/jobs") && location !== "/post-job"
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="link-nav-jobs"
              >
                Find Jobs
              </Link>
              <Link
                href="/track"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-muted/50 ${
                  location.startsWith("/track")
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="link-nav-track"
              >
                Track Applications
              </Link>
              <Link
                href="/saved"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-muted/50 flex items-center gap-2 ${
                  location.startsWith("/saved")
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="link-nav-saved"
              >
                <Heart className="w-4 h-4" />
                Saved Jobs
                {savedIds.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-full">
                    {savedIds.length}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9 rounded-full" data-testid="btn-theme-toggle">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block mx-1"></div>
            <Link href="/post-job" data-testid="link-post-job">
              <Button size="sm" className="rounded-full px-5 shadow-sm hover:shadow transition-all" variant={location === "/post-job" ? "secondary" : "default"}>
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative">{children}</main>
      
      <footer className="border-t py-12 bg-card mt-auto border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[bottom_1px_center] [mask-image:linear-gradient(to_top,white,transparent)]" />
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground">
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
                <li><Link href="/post-job" className="hover:text-primary transition-colors">Post a Job</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TalentHub Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
