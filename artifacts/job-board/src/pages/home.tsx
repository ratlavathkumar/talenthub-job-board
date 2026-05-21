import { useListJobs, useGetStatsSummary, useGetStatsByCategory } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Layout } from "../components/layout";
import { JobCard } from "../components/job-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Briefcase, Users, Star, TrendingUp, ArrowRight, MapPin, Building, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "../lib/constants";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: categories, isLoading: categoriesLoading } = useGetStatsByCategory();
  const { data: featuredJobs, isLoading: jobsLoading } = useListJobs({ featured: true });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery);
    if (locationQuery.trim()) {
      const existing = params.get("search") || "";
      params.set("search", existing ? `${existing} ${locationQuery}` : locationQuery);
    }
    setLocation(params.toString() ? `/jobs?${params.toString()}` : "/jobs");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-violet-500/4 to-background z-0" />
        {/* Animated blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none opacity-60 dark:opacity-25 animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20 animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary text-sm font-semibold mb-8 border border-primary/20 shadow-sm">
            <SparkleIcon className="w-4 h-4" />
            <span>The premier job board for top talent</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Find work that{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-cyan-500">
              feels like yours
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            TalentHub connects serious professionals with companies that care about craft, culture, and product quality.
          </p>

          <Card className="p-2 max-w-3xl mx-auto shadow-2xl shadow-primary/10 border-border/40 bg-background/90 backdrop-blur-xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Job title, keywords, or company"
                  className="pl-10 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-home-search"
                />
              </div>
              <div className="hidden sm:block w-px h-8 bg-border my-auto mx-1" />
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="City, state, or remote"
                  className="pl-10 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  data-testid="input-home-location"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 rounded-lg shadow-md bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                data-testid="button-home-search"
              >
                Search Jobs
              </Button>
            </form>
          </Card>

          <div className="mt-14 pt-8 border-t border-border/30">
            <p className="text-xs font-semibold text-muted-foreground mb-5 uppercase tracking-widest">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-14 opacity-40 hover:opacity-70 transition-opacity duration-500">
              {["Acme Corp", "GlobalTech", "Innovate", "Nexus", "Pioneer"].map((name) => (
                <div key={name} className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Building className="w-5 h-5" /> {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-border/40 bg-card">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border/40">
            <StatItem
              icon={<Briefcase className="w-6 h-6 text-blue-500" />}
              iconBg="bg-blue-500/10"
              label="Active Jobs"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : (stats?.totalJobs.toLocaleString() ?? "0")}
            />
            <StatItem
              icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
              iconBg="bg-emerald-500/10"
              label="New This Week"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : (stats?.newJobsThisWeek.toLocaleString() ?? "0")}
            />
            <StatItem
              icon={<Users className="w-6 h-6 text-violet-500" />}
              iconBg="bg-violet-500/10"
              label="Total Applications"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : (stats?.totalApplications.toLocaleString() ?? "0")}
            />
            <StatItem
              icon={<Star className="w-6 h-6 text-amber-500" />}
              iconBg="bg-amber-500/10"
              label="Featured Roles"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : (stats?.featuredJobs.toLocaleString() ?? "0")}
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Featured Opportunities</h2>
              <p className="text-lg text-muted-foreground">Hand-picked roles from top companies actively hiring.</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="group shrink-0">
                View all jobs
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[280px] w-full rounded-xl" />)}
            </div>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border/60">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No featured jobs right now</h3>
              <p className="text-muted-foreground">Check back later or view all available positions.</p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/20 border-y border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/6 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How TalentHub Works</h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">Your next career move, simplified.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", icon: <Search className="w-6 h-6" />, color: "from-blue-500/20 to-cyan-500/20 border-blue-200/50 dark:border-blue-800/30", iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400", title: "Browse Jobs", desc: "Search thousands of hand-picked roles from top companies." },
              { num: "2", icon: <FileText className="w-6 h-6" />, color: "from-violet-500/20 to-indigo-500/20 border-violet-200/50 dark:border-violet-800/30", iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400", title: "Apply Easily", desc: "Submit your application in seconds and track your status live." },
              { num: "3", icon: <CheckCircle className="w-6 h-6" />, color: "from-emerald-500/20 to-teal-500/20 border-emerald-200/50 dark:border-emerald-800/30", iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", title: "Get Hired", desc: "Connect with employers and land the role you've been looking for." },
            ].map((step) => (
              <Card key={step.num} className={`bg-gradient-to-br ${step.color} border relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className="absolute top-0 right-0 p-6 text-8xl font-black opacity-10 -mt-6 -mr-4 select-none">{step.num}</div>
                <CardContent className="p-8 text-left relative z-10">
                  <div className={`w-12 h-12 ${step.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Browse by Category</h2>
            <p className="text-lg text-muted-foreground">Explore roles tailored to your specific expertise.</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories?.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] || Briefcase;
                const colors = CATEGORY_COLORS[cat.category];
                return (
                  <Link
                    key={cat.category}
                    href={`/jobs?category=${encodeURIComponent(cat.category)}`}
                    className="block group"
                  >
                    <Card className={`h-full bg-gradient-to-br ${colors?.card || "from-muted/30 to-muted/50"} border hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className={`p-3.5 rounded-2xl transition-all duration-300 group-hover:scale-110 ${colors?.icon || "bg-muted text-muted-foreground"}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
                            {cat.category}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {cat.count} {cat.count === 1 ? "open role" : "open roles"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-indigo-700 opacity-95" />
            <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
            <div className="relative p-12 sm:p-20 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Ready to find your next role?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals who have found their dream jobs on TalentHub.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/jobs">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto px-10 h-14 text-base font-semibold shadow-xl bg-white text-primary hover:bg-white/90"
                    data-testid="btn-cta-browse"
                  >
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/track">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-10 h-14 text-base font-semibold border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/50"
                    data-testid="btn-cta-track"
                  >
                    Track Applications
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StatItem({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className={`p-3 ${iconBg} rounded-2xl mb-4 shadow-sm`}>{icon}</div>
      <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2">{value}</div>
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" fill="currentColor" />
    </svg>
  );
}
