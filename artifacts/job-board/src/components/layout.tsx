import { Link, useLocation } from "wouter";
import { Briefcase, Moon, Sun, Heart, LayoutDashboard, User, Building2, LogIn, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useThemeContext, useAdminContext, useUserAuthContext, useCompanyAuthContext } from "@/contexts";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { Badge } from "./ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useThemeContext();
  const { savedIds } = useSavedJobs();
  const { isAdmin } = useAdminContext();
  const { user, logout: logoutUser } = useUserAuthContext();
  const { company, logout: logoutCompany } = useCompanyAuthContext();

  const navLink = (href: string, label: React.ReactNode, testId?: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        location.startsWith(href) && href !== "/"
          ? "text-primary bg-primary/10 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
      data-testid={testId}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-border/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block tracking-tight group-hover:text-primary transition-colors">TalentHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLink("/jobs", "Find Jobs", "link-nav-jobs")}
              {navLink("/track", "Track Applications", "link-nav-track")}
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
                Saved
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

            {/* Admin button — only show if super admin is logged in */}
            {isAdmin && (
              <Link href="/admin" data-testid="link-admin">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 rounded-full px-4 text-sm font-medium bg-gradient-to-r from-violet-600 to-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/30"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}

            {/* Company user */}
            {company && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-[10px] font-bold">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{company.name}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/company/dashboard">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Building2 className="w-4 h-4" />
                      Company Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => logoutCompany()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Candidate user */}
            {user && !company && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    {user.profileImageUrl ? (
                      <img src={`/api/storage${user.profileImageUrl}`} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/profile">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/track">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      My Applications
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => logoutUser()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Not logged in */}
            {!user && !company && (
              <>
                {!isAdmin && (
                  <Link href="/admin" data-testid="link-admin">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground hidden sm:flex">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="h-4 w-px bg-border hidden sm:block" />
                <Link href="/company/login">
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full px-3 text-xs border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hidden sm:flex">
                    <Building2 className="w-3.5 h-3.5" />
                    For Companies
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="gap-1.5 rounded-full px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              </>
            )}
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
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
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
                <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Employers</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/company/register" className="hover:text-primary transition-colors">Post a Job</Link></li>
                <li><Link href="/company/login" className="hover:text-primary transition-colors">Company Login</Link></li>
                <li><Link href="/company/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TalentHub Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
