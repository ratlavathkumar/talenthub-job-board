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
import { CATEGORY_ICONS } from "../lib/constants";

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
    // location param isn't directly in the schema but we can pass it if we want, or just append to search
    // the prompt says "location input beside keyword input"
    // Let's just put it in search for simplicity or assume API handles it
    if (locationQuery.trim()) {
      const existing = params.get("search") || "";
      params.set("search", existing ? `${existing} ${locationQuery}` : locationQuery);
    }
    
    if (params.toString()) {
      setLocation(`/jobs?${params.toString()}`);
    } else {
      setLocation("/jobs");
    }
  };

  return (
    <Layout>
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/5 to-background z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <SparkleIcon className="w-4 h-4" />
            <span>The premier job board for top talent</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Find work that <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-indigo-400">feels like yours</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            TalentHub connects serious professionals with companies that care about craft, culture, and product quality.
          </p>
          
          <Card className="p-2 max-w-3xl mx-auto shadow-xl border-border/50 bg-background/80 backdrop-blur-xl">
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
              <Button type="submit" size="lg" className="h-12 px-8 rounded-lg shadow-sm" data-testid="button-home-search">
                Search Jobs
              </Button>
            </form>
          </Card>
          
          <div className="mt-16 pt-8 border-t border-border/40">
            <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Acme Corp', 'GlobalTech', 'Innovate', 'Nexus', 'Pioneer'].map(name => (
                <div key={name} className="flex items-center gap-2 text-xl font-bold text-muted-foreground">
                  <Building className="w-6 h-6" /> {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border/40 bg-card">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x border-border/40">
            <StatItem 
              icon={<Briefcase className="w-6 h-6 text-blue-500" />}
              label="Active Jobs"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : stats?.totalJobs.toLocaleString() || "0"}
            />
            <StatItem 
              icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
              label="New This Week"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : stats?.newJobsThisWeek.toLocaleString() || "0"}
            />
            <StatItem 
              icon={<Users className="w-6 h-6 text-purple-500" />}
              label="Total Applications"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : stats?.totalApplications.toLocaleString() || "0"}
            />
            <StatItem 
              icon={<Star className="w-6 h-6 text-amber-500" />}
              label="Featured Roles"
              value={statsLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : stats?.featuredJobs.toLocaleString() || "0"}
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
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-[280px] w-full rounded-xl" />)}
            </div>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 3).map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border/60">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No featured jobs right now</h3>
              <p className="text-muted-foreground">Check back later or view all available positions.</p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How TalentHub Works</h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">Your next career move, simplified. We make it easy to find and apply to the best roles.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-9xl font-black text-muted/20 -mt-8 -mr-8 group-hover:text-primary/10 transition-colors">1</div>
              <CardContent className="p-8 text-left relative z-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Browse Jobs</h3>
                <p className="text-muted-foreground">Search through thousands of hand-picked roles from top companies that match your skills.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-9xl font-black text-muted/20 -mt-8 -mr-8 group-hover:text-primary/10 transition-colors">2</div>
              <CardContent className="p-8 text-left relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Apply Easily</h3>
                <p className="text-muted-foreground">Submit your application with just a few clicks. Track your status directly on our platform.</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-9xl font-black text-muted/20 -mt-8 -mr-8 group-hover:text-primary/10 transition-colors">3</div>
              <CardContent className="p-8 text-left relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Get Hired</h3>
                <p className="text-muted-foreground">Connect with employers, showcase your talent, and land the job you've been looking for.</p>
              </CardContent>
            </Card>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories?.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] || Briefcase;
                return (
                  <Link 
                    key={cat.category} 
                    href={`/jobs?category=${encodeURIComponent(cat.category)}`}
                    className="block group"
                  >
                    <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card hover:bg-accent/20">
                      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="p-3 bg-muted group-hover:bg-primary/10 group-hover:text-primary rounded-2xl transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                            {cat.category}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {cat.count} {cat.count === 1 ? 'open role' : 'open roles'}
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
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative p-12 sm:p-20 text-center text-primary-foreground">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Ready to find your next role?</h2>
              <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals who have found their dream jobs on TalentHub.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/jobs">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-14 text-base font-semibold shadow-lg">
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/post-job">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base font-semibold border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    Post a Job
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

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="p-3 bg-muted rounded-2xl mb-4 shadow-sm">
        {icon}
      </div>
      <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">{value}</div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" fill="currentColor"/>
    </svg>
  );
}
