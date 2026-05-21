import { useListJobs } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Layout } from "../components/layout";
import { JobCard } from "../components/job-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { JOB_CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from "../lib/constants";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

export default function Jobs() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "all");
  const [isRemote, setIsRemote] = useState(searchParams.get("remote") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  
  // Sync URL changes to state (e.g. back button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") || "");
    setCategory(params.get("category") || "all");
    setJobType(params.get("jobType") || "all");
    setIsRemote(params.get("remote") === "true");
    setSortBy(params.get("sortBy") || "newest");
  }, [location]);

  // Build query params for the API hook
  const queryParams = {
    ...(search.trim() ? { search } : {}),
    ...(category !== "all" ? { category } : {}),
    ...(jobType !== "all" ? { jobType } : {}),
    ...(sortBy ? { sortBy } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(queryParams);

  // We filter remote locally since the API spec doesn't explicitly expose a remote filter param in listJobsParams
  const filteredJobs = jobs?.filter(job => isRemote ? job.remote : true) || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl();
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (jobType !== "all") params.set("jobType", jobType);
    if (isRemote) params.set("remote", "true");
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    
    const newUrl = params.toString() ? `/jobs?${params.toString()}` : "/jobs";
    window.history.pushState(null, "", newUrl);
  };

  useEffect(() => {
    updateUrl();
  }, [category, jobType, isRemote, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setJobType("all");
    setIsRemote(false);
    setSortBy("newest");
    window.history.pushState(null, "", "/jobs");
  };

  const hasActiveFilters = search || category !== "all" || jobType !== "all" || isRemote || sortBy !== "newest";

  return (
    <Layout>
      <div className="bg-muted/20 py-10 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Explore Opportunities</h1>
            <p className="text-lg text-muted-foreground mb-8">Discover roles that match your skills and aspirations.</p>
            
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Job title, keywords, or company" 
                  className="pl-12 h-14 bg-background shadow-sm border-border/50 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-jobs-search"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 shadow-sm" data-testid="button-jobs-search">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row gap-10 max-w-7xl">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="category-select" className="text-base font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-select" className="h-12 bg-background border-border/50" data-testid="select-jobs-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {JOB_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="type-select" className="text-base font-medium">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger id="type-select" className="h-12 bg-background border-border/50" data-testid="select-jobs-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{JOB_TYPE_LABELS[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/40">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remote-toggle" className="text-base font-medium cursor-pointer">Remote Only</Label>
                  <p className="text-sm text-muted-foreground">Work from anywhere</p>
                </div>
                <Switch 
                  id="remote-toggle" 
                  checked={isRemote} 
                  onCheckedChange={setIsRemote}
                  data-testid="switch-jobs-remote"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? (
                <Skeleton className="h-7 w-40" />
              ) : (
                `${filteredJobs.length} ${filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found`
              )}
            </h2>
            
            <div className="flex items-center gap-3">
              <Label htmlFor="sort-select" className="text-muted-foreground shrink-0 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-select" className="w-[180px] h-10 bg-background border-border/50" data-testid="select-jobs-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                  <SelectItem value="salary-low">Lowest Salary</SelectItem>
                  <SelectItem value="most-applied">Most Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/10 rounded-2xl border border-dashed border-border/50">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No jobs match your criteria</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find any jobs matching your current filters. Try broadening your search or clearing some filters.</p>
              <Button variant="outline" size="lg" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
