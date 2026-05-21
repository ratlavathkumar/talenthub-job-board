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
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Jobs() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "all");
  const [isRemote, setIsRemote] = useState(searchParams.get("remote") === "true");
  
  // Sync URL changes to state (e.g. back button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") || "");
    setCategory(params.get("category") || "all");
    setJobType(params.get("jobType") || "all");
    setIsRemote(params.get("remote") === "true");
  }, [location]);

  // Build query params for the API hook
  const queryParams = {
    ...(search.trim() ? { search } : {}),
    ...(category !== "all" ? { category } : {}),
    ...(jobType !== "all" ? { jobType } : {}),
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
    
    const newUrl = params.toString() ? `/jobs?${params.toString()}` : "/jobs";
    window.history.pushState(null, "", newUrl);
  };

  useEffect(() => {
    updateUrl();
  }, [category, jobType, isRemote]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setJobType("all");
    setIsRemote(false);
    window.history.pushState(null, "", "/jobs");
  };

  const hasActiveFilters = search || category !== "all" || jobType !== "all" || isRemote;

  return (
    <Layout>
      <div className="bg-muted/30 py-8 border-b">
        <div className="container mx-auto px-4 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Find Jobs</h1>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Job title, keywords, or company" 
                className="pl-10 h-12 bg-background shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-jobs-search"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 shadow-sm" data-testid="button-jobs-search">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="category-select">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category-select" data-testid="select-jobs-category">
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

              <div className="space-y-3">
                <Label htmlFor="type-select">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="type-select" data-testid="select-jobs-type">
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

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="remote-toggle" className="cursor-pointer">Remote Only</Label>
                <Switch 
                  id="remote-toggle" 
                  checked={isRemote} 
                  onCheckedChange={setIsRemote}
                  data-testid="switch-jobs-remote"
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                `${filteredJobs.length} ${filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found`
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No jobs match your criteria</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
