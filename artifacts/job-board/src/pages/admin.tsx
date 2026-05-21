import { 
  useListJobs, 
  useDeleteJob, 
  getListJobsQueryKey,
  useListJobApplications,
  useUpdateApplicationStatus,
  getListJobApplicationsQueryKey,
  useGetStatsSummary,
  useGetApplicationsOverTime,
  useGetStatsByCategory
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { AdminGate } from "../components/admin-gate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import { APPLICATION_STATUSES, STATUS_COLORS } from "../lib/constants";
import { Trash2, ExternalLink, FileText, Search, Briefcase, TrendingUp, Users, Star, PieChart as PieChartIcon, Activity, LogOut, ShieldCheck, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAdminContext } from "@/App";

export default function Admin() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}

function AdminDashboard() {
  const { logout } = useAdminContext();

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary text-white shadow-md shadow-primary/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-lg text-muted-foreground">Manage your job board, applications, and analytics.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 self-start sm:self-auto"
            data-testid="btn-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-8">
          <TabsList className="grid w-full sm:w-[700px] grid-cols-4 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="jobs" className="text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-admin-jobs">
              Job Listings
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-admin-applications">
              Applications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-admin-analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="post" className="text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5" data-testid="tab-admin-post">
              <PlusCircle className="w-3.5 h-3.5" />
              Post a Job
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <JobsManager />
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <ApplicationsManager />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="post" className="mt-6">
            <PostJobInline />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PostJobInline() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center shadow-sm">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Post a New Job</CardTitle>
            <CardDescription>Create a new job listing on TalentHub.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-muted-foreground text-center max-w-md">
            Use the dedicated job posting form to create a detailed listing with all required fields.
          </p>
          <Link href="/post-job">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20 px-8"
              data-testid="btn-goto-post-job"
            >
              <PlusCircle className="w-5 h-5" />
              Open Job Posting Form
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: timeData, isLoading: timeLoading } = useGetApplicationsOverTime();
  const { data: categoryData, isLoading: catLoading } = useGetStatsByCategory();

  const PIE_COLORS = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
    "#06b6d4", "#f97316", "#ec4899"
  ];

  const chartData = [...(timeData || [])];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-blue-200/50 dark:border-blue-800/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Jobs</p>
              <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? <Skeleton className="h-10 w-16" /> : stats?.totalJobs}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">New This Week</p>
              <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? <Skeleton className="h-10 w-16" /> : stats?.newJobsThisWeek}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/5 to-violet-600/10 border-violet-200/50 dark:border-violet-800/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Applications</p>
              <div className="p-2 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? <Skeleton className="h-10 w-16" /> : stats?.totalApplications}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border-amber-200/50 dark:border-amber-800/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Featured Roles</p>
              <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-xl">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? <Skeleton className="h-10 w-16" /> : stats?.featuredJobs}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Applications Over Time
            </CardTitle>
            <CardDescription>Daily application volume</CardDescription>
          </CardHeader>
          <CardContent>
            {timeLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
                      }
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-muted-foreground" />
              Jobs by Category
            </CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="category"
                      stroke="none"
                    >
                      {categoryData?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
          toast({ title: "Failed to delete job", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) return <SkeletonTable />;

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Manage Jobs</CardTitle>
            <CardDescription>View, edit, or remove current job listings.</CardDescription>
          </div>
          <Link href="/post-job">
            <Button size="sm" className="shadow-sm gap-1.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
              <PlusCircle className="w-4 h-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {jobs && jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">Job Title</TableHead>
                  <TableHead className="font-semibold text-foreground">Company</TableHead>
                  <TableHead className="font-semibold text-foreground">Location</TableHead>
                  <TableHead className="font-semibold text-foreground">Posted</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Apps</TableHead>
                  <TableHead className="text-right font-semibold text-foreground pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} data-testid={`row-admin-job-${job.id}`} className="hover:bg-muted/10">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-2">
                        {job.title}
                        {job.featured && (
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700/40">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{job.company}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{job.location}</span>
                        {job.remote && <span className="text-xs text-primary/70 font-medium">Remote</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono bg-background">{job.applicationCount ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" title="View Job">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
          <div className="p-12">
            <EmptyState title="No jobs posted yet" description="Create your first job listing to get started." />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsManager() {
  const { data: jobs, isLoading: jobsLoading } = useListJobs();
  const [selectedJobId, setSelectedJobId] = useState<number | "all">("all");

  const activeJobId =
    selectedJobId === "all" && jobs && jobs.length > 0
      ? jobs[0].id
      : selectedJobId !== "all"
      ? selectedJobId
      : 0;

  const { data: applications, isLoading: appsLoading } = useListJobApplications(
    activeJobId as number,
    { query: { enabled: !!activeJobId && activeJobId > 0, queryKey: getListJobApplicationsQueryKey(activeJobId as number) } }
  );

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
        },
      }
    );
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/40 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Review Applications</CardTitle>
            <CardDescription>Manage candidate submissions and statuses.</CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <Select
              value={selectedJobId.toString()}
              onValueChange={(v) => setSelectedJobId(v === "all" ? "all" : parseInt(v))}
            >
              <SelectTrigger data-testid="select-admin-job-filter" className="bg-background shadow-sm">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobsLoading ? (
                  <SelectItem value="loading" disabled>Loading jobs…</SelectItem>
                ) : (
                  <>
                    <SelectItem value="all" disabled>Select a specific job</SelectItem>
                    {jobs?.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} ({job.applicationCount ?? 0})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {appsLoading ? (
          <div className="p-6"><SkeletonTable /></div>
        ) : !activeJobId ? (
          <div className="p-12"><EmptyState title="Select a job" description="Choose a job from the dropdown to view its applications." /></div>
        ) : applications && applications.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">Applicant</TableHead>
                  <TableHead className="font-semibold text-foreground">Applied On</TableHead>
                  <TableHead className="font-semibold text-foreground">Links</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground pr-6">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} data-testid={`row-admin-app-${app.id}`} className="hover:bg-muted/10">
                    <TableCell className="py-4">
                      <div className="font-semibold">{app.applicantName}</div>
                      <div className="text-sm text-muted-foreground">{app.applicantEmail}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          Resume
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`shadow-none border-transparent ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Select
                        value={app.status}
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger
                          className="w-[140px] ml-auto h-9 text-sm bg-background shadow-sm"
                          data-testid={`select-status-${app.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="text-sm">
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
          <div className="p-12">
            <EmptyState title="No applications yet" description="There are no applications for this job posting." />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/60 flex flex-col items-center">
      <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
