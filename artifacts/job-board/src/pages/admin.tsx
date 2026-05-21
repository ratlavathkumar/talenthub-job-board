import { 
  useListJobs, 
  useDeleteJob, 
  getListJobsQueryKey,
  useListJobApplications,
  useUpdateApplicationStatus,
  getListJobApplicationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import { formatCurrency, APPLICATION_STATUSES } from "../lib/constants";
import { Trash2, ExternalLink, FileText, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Admin() {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage job listings and applications.</p>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 h-12">
            <TabsTrigger value="jobs" className="text-base" data-testid="tab-admin-jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="applications" className="text-base" data-testid="tab-admin-applications">Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs">
            <JobsManager />
          </TabsContent>
          
          <TabsContent value="applications">
            <ApplicationsManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function JobsManager() {
  const { data: jobs, isLoading } = useListJobs();
  const deleteMutation = useDeleteJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this job listing?")) return;
    
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
          toast({ title: "Job deleted successfully" });
        },
        onError: () => {
          toast({ 
            title: "Failed to delete job", 
            variant: "destructive" 
          });
        }
      }
    );
  };

  if (isLoading) return <SkeletonTable />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Jobs</CardTitle>
            <CardDescription>View, edit, or remove current job listings.</CardDescription>
          </div>
          <Link href="/post-job">
            <Button size="sm">Post New Job</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {jobs && jobs.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} data-testid={`row-admin-job-${job.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {job.title}
                        {job.featured && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{job.location}</span>
                        {job.remote && <span className="text-xs text-muted-foreground">Remote</span>}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{job.applicationCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Job">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(job.id)}
                          disabled={deleteMutation.isPending}
                          title="Delete Job"
                          data-testid={`btn-delete-job-${job.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState title="No jobs posted yet" description="Create your first job listing to get started." />
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsManager() {
  const { data: jobs, isLoading: jobsLoading } = useListJobs();
  const [selectedJobId, setSelectedJobId] = useState<number | "all">("all");
  
  // If "all" is selected, we don't have a specific API endpoint for all apps across all jobs,
  // so we'd normally just fetch the first job's apps or implement a global list.
  // For this scaffold, we'll enforce selecting a job to see apps if there are multiple.
  const activeJobId = selectedJobId === "all" && jobs && jobs.length > 0 ? jobs[0].id : (selectedJobId !== "all" ? selectedJobId : 0);
  
  const { data: applications, isLoading: appsLoading } = useListJobApplications(activeJobId as number, {
    query: { enabled: !!activeJobId && activeJobId > 0, queryKey: getListJobApplicationsQueryKey(activeJobId as number) }
  });

  const updateStatusMutation = useUpdateApplicationStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (appId: number, status: string) => {
    updateStatusMutation.mutate(
      { id: appId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListJobApplicationsQueryKey(activeJobId as number) });
          toast({ title: "Status updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update status", variant: "destructive" });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-transparent shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Reviewed</Badge>;
      case 'shortlisted': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent shadow-none"><StarIcon className="w-3 h-3 mr-1"/> Shortlisted</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-transparent shadow-none"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-transparent shadow-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  // Internal tiny icon for shortlisted
  const StarIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Review Applications</CardTitle>
            <CardDescription>Manage candidate submissions.</CardDescription>
          </div>
          
          <div className="w-full sm:w-64">
            <Select 
              value={selectedJobId.toString()} 
              onValueChange={(v) => setSelectedJobId(v === "all" ? "all" : parseInt(v))}
            >
              <SelectTrigger data-testid="select-admin-job-filter">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobsLoading ? (
                  <SelectItem value="loading" disabled>Loading jobs...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="all" disabled>Select a specific job</SelectItem>
                    {jobs?.map(job => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} ({job.applicationCount})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {appsLoading ? (
          <SkeletonTable />
        ) : !activeJobId ? (
          <EmptyState title="Select a job" description="Choose a job from the dropdown to view its applications." />
        ) : applications && applications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} data-testid={`row-admin-app-${app.id}`}>
                    <TableCell>
                      <div className="font-medium">{app.applicantName}</div>
                      <div className="text-sm text-muted-foreground">{app.applicantEmail}</div>
                    </TableCell>
                    <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="View Resume">
                            <FileText className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        value={app.status} 
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-[130px] ml-auto h-8 text-xs" data-testid={`select-status-${app.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map(status => (
                            <SelectItem key={status} value={status} className="text-xs">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState title="No applications yet" description="There are no applications for this job posting." />
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string, description: string }) {
  return (
    <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed flex flex-col items-center">
      <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
