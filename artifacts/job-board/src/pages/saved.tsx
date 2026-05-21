import { useListJobs } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { JobCard } from "../components/job-card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Heart, Search } from "lucide-react";
import { Link } from "wouter";
import { useSavedJobs } from "@/hooks/use-saved-jobs";

export default function Saved() {
  const { savedIds } = useSavedJobs();
  
  // We fetch all jobs and filter locally, or we could pass multiple IDs if API supported it.
  // For this scaffold, fetching all jobs and filtering is acceptable.
  const { data: jobs, isLoading } = useListJobs();

  const savedJobs = jobs?.filter(job => savedIds.includes(job.id)) || [];

  return (
    <Layout>
      <div className="bg-muted/20 py-10 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
              <p className="text-muted-foreground">Keep track of the opportunities you love.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              `${savedJobs.length} ${savedJobs.length === 1 ? 'Job' : 'Jobs'} Saved`
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />)}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border/60">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">No saved jobs yet</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Browse jobs and tap the heart icon to save them here for later.
            </p>
            <Link href="/jobs">
              <Button size="lg" className="shadow-sm px-8 h-12">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
