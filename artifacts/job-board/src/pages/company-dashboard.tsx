import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListJobs,
  useCreateJob,
  useDeleteJob,
  useListApplications,
  useUpdateApplicationStatus,
  useGetStatsSummary,
  useGetApplicationsOverTime,
  getListJobsQueryKey,
  getListApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCompanyAuthContext } from "@/contexts";
import {
  Building2, Briefcase, Users, BarChart3, TrendingUp, Eye, LogOut, PlusCircle,
  Trash2, ExternalLink, FileText, Settings, Globe, MapPin, Loader2
} from "lucide-react";
import { formatCurrency, timeAgo, APPLICATION_STATUSES, STATUS_COLORS, JOB_CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useFileUpload } from "@/hooks/use-file-upload";

const jobSchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  jobType: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(10),
  requirements: z.string().optional(),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  remote: z.boolean().default(false),
  featured: z.boolean().default(false),
});
type JobFormValues = z.infer<typeof jobSchema>;

export default function CompanyDashboard() {
  const { company, logout } = useCompanyAuthContext();
  const [, navigate] = useLocation();

  if (!company) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">You need to sign in as a company to access this page.</p>
            <Link href="/company/login">
              <Button className="bg-gradient-to-r from-violet-600 to-violet-700 text-white">Sign In as Company</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                <p className="text-sm text-muted-foreground">{company.industry ?? "Company"} · {company.location ?? "Remote"}</p>
              </div>
            </div>
            <p className="text-muted-foreground">Manage your job listings, applications, and company profile.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 self-start sm:self-auto">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 rounded-xl w-full sm:w-auto">
            {[
              { value: "overview", icon: BarChart3, label: "Overview" },
              { value: "jobs", icon: Briefcase, label: "My Jobs" },
              { value: "applications", icon: Users, label: "Applications" },
              { value: "post", icon: PlusCircle, label: "Post a Job" },
              { value: "profile", icon: Settings, label: "Profile" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 px-4">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"><OverviewTab companyId={company.id} /></TabsContent>
          <TabsContent value="jobs"><JobsTab companyId={company.id} companyName={company.name} /></TabsContent>
          <TabsContent value="applications"><ApplicationsTab companyId={company.id} /></TabsContent>
          <TabsContent value="post"><PostJobTab companyId={company.id} companyName={company.name} /></TabsContent>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function OverviewTab({ companyId }: { companyId: number }) {
  const { data: jobs, isLoading: jobsLoading } = useListJobs({ companyId });
  const { data: stats } = useGetStatsSummary();
  const { data: chartData } = useGetApplicationsOverTime();

  const myJobs = jobs ?? [];
  const totalViews = myJobs.reduce((s, j) => s + (j.viewCount ?? 0), 0);
  const totalApps = myJobs.reduce((s, j) => s + (j.applicationCount ?? 0), 0);

  const statCards = [
    { label: "Active Jobs", value: myJobs.length, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-500/10" },
    { label: "Total Views", value: totalViews, icon: Eye, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Applications", value: totalApps, icon: Users, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Conversion", value: totalViews ? `${Math.round((totalApps / totalViews) * 100)}%` : "0%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobsLoading ? "–" : value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Platform Applications Over Time</CardTitle>
          <CardDescription>Last 30 days across all jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData ?? []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {myJobs.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location} · {job.jobType}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.viewCount}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationCount}</span>
                    <Link href={`/jobs/${job.id}`}><ExternalLink className="w-3.5 h-3.5 hover:text-primary cursor-pointer" /></Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function JobsTab({ companyId, companyName }: { companyId: number; companyName: string }) {
  const { data: jobs, isLoading } = useListJobs({ companyId });
  const deleteMutation = useDeleteJob();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
      toast({ title: "Job deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  const myJobs = (jobs ?? []).filter(j => j.companyId === companyId || j.company === companyName);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Job Listings ({myJobs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {myJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No jobs posted yet. Create your first listing!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {myJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{job.jobType}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{job.viewCount}</TableCell>
                  <TableCell className="text-muted-foreground">{job.applicationCount}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{timeAgo(job.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/jobs/${job.id}`}><Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(job.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsTab({ companyId }: { companyId: number }) {
  const { data: apps, isLoading } = useListApplications();
  const updateStatus = useUpdateApplicationStatus();
  const qc = useQueryClient();
  const { data: jobs } = useListJobs({ companyId });
  const { toast } = useToast();

  const myJobIds = new Set((jobs ?? []).map(j => j.id));
  const myApps = (apps ?? []).filter(a => myJobIds.has(a.jobId));

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Applications ({myApps.length})</CardTitle>
        <CardDescription>Review and manage candidates who applied to your jobs</CardDescription>
      </CardHeader>
      <CardContent>
        {myApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myApps.map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/60 hover:border-border transition-colors">
                <div className="flex items-center gap-3">
                  {app.profileImageUrl ? (
                    <img src={`/api/storage${app.profileImageUrl.startsWith("/objects") ? app.profileImageUrl : `/objects/${app.profileImageUrl}`}`} alt={app.applicantName} className="w-10 h-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                      {app.applicantName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{app.applicantName}</p>
                    <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
                    <p className="text-xs text-muted-foreground">{app.jobTitle} · {timeAgo(app.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-13 sm:ml-0">
                  {app.resumeUrl && (
                    <a href={`/api/storage${app.resumeUrl.startsWith("/objects") ? app.resumeUrl : `/objects/${app.resumeUrl}`}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><FileText className="w-3 h-3" />Resume</Button>
                    </a>
                  )}
                  <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v)}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge className={`${STATUS_COLORS[app.status] ?? ""} text-xs capitalize border`}>{app.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PostJobTab({ companyId, companyName }: { companyId: number; companyName: string }) {
  const createMutation = useCreateJob();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: { remote: false, featured: false, salaryMin: 0, salaryMax: 0 },
  });

  const onSubmit = async (data: JobFormValues) => {
    try {
      const job = await createMutation.mutateAsync({
        data: { ...data, company: companyName, companyId, currency: "USD" },
      });
      qc.invalidateQueries({ queryKey: getListJobsQueryKey() });
      toast({ title: "Job posted!", description: "Your listing is now live." });
      navigate(`/jobs/${job.id}`);
    } catch {
      toast({ title: "Failed to post job", variant: "destructive" });
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-violet-600" />
          Post a New Job
        </CardTitle>
        <CardDescription>Create a job listing for {companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label>Job title <span className="text-destructive">*</span></Label>
              <Input placeholder="Senior Software Engineer" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Job type <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => form.setValue("jobType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{JOB_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
              </Select>
              {form.formState.errors.jobType && <p className="text-xs text-destructive">{form.formState.errors.jobType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{JOB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Location <span className="text-destructive">*</span></Label>
              <Input placeholder="San Francisco, CA" {...form.register("location")} />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch id="remote" checked={form.watch("remote")} onCheckedChange={(v) => form.setValue("remote", v)} />
                <Label htmlFor="remote">Remote</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="featured" checked={form.watch("featured")} onCheckedChange={(v) => form.setValue("featured", v)} />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Min Salary (USD) <span className="text-destructive">*</span></Label>
              <Input type="number" placeholder="80000" {...form.register("salaryMin")} />
            </div>

            <div className="space-y-2">
              <Label>Max Salary (USD) <span className="text-destructive">*</span></Label>
              <Input type="number" placeholder="120000" {...form.register("salaryMax")} />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label>Job description <span className="text-destructive">*</span></Label>
              <Textarea rows={5} placeholder="Describe the role, responsibilities, and what makes it exciting..." {...form.register("description")} />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label>Requirements</Label>
              <Textarea rows={4} placeholder="List required skills, experience, and qualifications..." {...form.register("requirements")} />
            </div>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-md">
            {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PlusCircle className="w-4 h-4" /> Publish Job</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileTab() {
  const { company, updateProfile } = useCompanyAuthContext();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: company?.name ?? "",
      website: company?.website ?? "",
      industry: company?.industry ?? "",
      description: company?.description ?? "",
      size: company?.size ?? "",
      location: company?.location ?? "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: Record<string, string>) => {
    setSaving(true);
    try {
      let logoUrl = company?.logoUrl ?? undefined;
      if (logoFile) {
        const result = await uploadFile(logoFile);
        logoUrl = result.objectPath;
      }
      await updateProfile({ ...data, logoUrl });
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60 max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-600" />
          Company Profile
        </CardTitle>
        <CardDescription>Update your company information visible to candidates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {logoPreview || company?.logoUrl ? (
                <img
                  src={logoPreview ?? `/api/storage${company!.logoUrl}`}
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-2xl border-2 border-border">
                  {company?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary">
                  {isUploading ? "Uploading..." : "Upload Logo"}
                </div>
              </Label>
              <input id="logo" type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Company name</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Website</Label>
              <Input placeholder="https://yourcompany.com" {...form.register("website")} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Location</Label>
              <Input placeholder="San Francisco, CA" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input placeholder="Technology" {...form.register("industry")} />
            </div>
            <div className="space-y-2">
              <Label>Company size</Label>
              <Input placeholder="51–200 employees" {...form.register("size")} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="What makes your company a great place to work?" {...form.register("description")} />
            </div>
          </div>

          <Button type="submit" disabled={saving || isUploading} className="gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
