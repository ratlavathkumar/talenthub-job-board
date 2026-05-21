import { useListJobs, useGetStatsSummary, useGetStatsByCategory } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Layout } from "../components/layout";
import { JobCard } from "../components/job-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Briefcase, Users, Star, TrendingUp, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: categories, isLoading: categoriesLoading } = useGetStatsByCategory();
  const { data: featuredJobs, isLoading: jobsLoading } = useListJobs({ featured: true });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation("/jobs");
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 sm:py-24 border-b">
        <div className="container mx-auto px-4 sm:px-8 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Find the team that <span className="text-primary">fits your craft</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            TalentHub connects serious professionals with companies that care about product, design, and engineering culture.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Job title, keywords, or company" 
                className="pl-10 h-12 text-base shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-home-search"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 shadow-sm" data-testid="button-home-search">
              Search Jobs
            </Button>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
              icon={<Briefcase className="w-5 h-5 text-blue-500" />}
              label="Active Jobs"
              value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalJobs.toLocaleString() || "0"}
            />
            <StatCard 
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              label="New This Week"
              value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.newJobsThisWeek.toLocaleString() || "0"}
            />
            <StatCard 
              icon={<Users className="w-5 h-5 text-purple-500" />}
              label="Total Applications"
              value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalApplications.toLocaleString() || "0"}
            />
            <StatCard 
              icon={<Star className="w-5 h-5 text-amber-500" />}
              label="Featured Roles"
              value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.featuredJobs.toLocaleString() || "0"}
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Opportunities</h2>
              <p className="text-muted-foreground">Hand-picked roles from top companies.</p>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" className="hidden sm:flex group">
                View all jobs
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
            </div>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No featured jobs right now</h3>
              <p className="text-muted-foreground">Check back later or view all available positions.</p>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/jobs">
              <Button variant="outline" className="w-full">
                View all jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 sm:py-24 bg-muted/30 border-t">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">Explore roles tailored to your expertise.</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories?.map((cat) => (
                <Link 
                  key={cat.category} 
                  href={`/jobs?category=${encodeURIComponent(cat.category)}`}
                  className="block group"
                >
                  <Card className="hover:border-primary/50 transition-colors h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {cat.category}
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {cat.count} {cat.count === 1 ? 'job' : 'jobs'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <Card className="bg-background/60 backdrop-blur shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
