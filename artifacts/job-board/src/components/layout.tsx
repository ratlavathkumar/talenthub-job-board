import { Link, useLocation } from "wouter";
import { Briefcase } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline-block">TalentHub</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/jobs"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith("/jobs") && location !== "/post-job"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid="link-nav-jobs"
              >
                Find Jobs
              </Link>
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith("/admin")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid="link-nav-admin"
              >
                Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/post-job" data-testid="link-post-job">
              <Button size="sm" variant={location === "/post-job" ? "secondary" : "default"}>
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t py-8 sm:py-12 bg-muted/40 mt-auto">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">TalentHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TalentHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
