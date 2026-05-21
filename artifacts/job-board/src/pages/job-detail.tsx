import { useGetJob, useApplyToJob, useIncrementJobView, useListJobs } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Layout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { formatCurrency, JOB_TYPE_LABELS, timeAgo } from "../lib/constants";
import { JobCard } from "../components/job-card";
import { Building2, MapPin, DollarSign, Clock, Globe, Calendar, ArrowLeft, Send, Users, Eye, Link as LinkIcon, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

const applicationSchema = z.object({
  applicantName: z.string().min(2, "Name is required"),
  applicantEmail: z.string().email("Invalid email address"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || "0", 10);
  const { toast } = useToast();
  
  const { data: job, isLoading, error } = useGetJob(jobId, { 
    query: { 
      enabled: !!jobId, 
      queryKey: ["/api/jobs", jobId]
    } 
  });

  const { data: similarJobsData } = useListJobs(
    { category: job?.category },
    { query: { enabled: !!job?.category } }
  );

  const incrementView = useIncrementJobView();

  useEffect(() => {
    if (jobId) {
      incrementView.mutate({ id: jobId });
    }
  }, [jobId]);
  
  const applyMutation = useApplyToJob();
  const [hasApplied, setHasApplied] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantName: "",
      applicantEmail: "",
      coverLetter: "",
      resumeUrl: "",
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    applyMutation.mutate(
      { id: jobId, data },
      {
        onSuccess: () => {
          setHasApplied(true);
          toast({
            title: "Application submitted!",
            description: "Your application has been sent successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to submit application. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Job link copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-6 w-24 mb-8" />
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-[500px] w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Job not found</h1>
          <p className="text-lg text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button size="lg">Browse other jobs</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const similarJobs = similarJobsData?.filter(j => j.id !== job.id).slice(0, 3) || [];

  return (
    <Layout>
      <div className="bg-muted/10 border-b border-border/40 pb-12">
        <div className="container mx-auto px-4 sm:px-8 pt-8 max-w-6xl">
          <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to jobs
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex items-start gap-6">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border bg-background shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 shadow-md">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              )}
              
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{job.title}</h1>
                  {job.featured && <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm">Featured</Badge>}
                </div>
                <div className="text-xl text-muted-foreground mb-5 font-medium flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {job.company}
                </div>
                
                <div className="flex flex-wrap gap-4 gap-y-3 text-sm font-medium">
                  <Badge variant="outline" className="text-muted-foreground py-1 px-3 bg-background" data-testid="detail-location">
                    {job.remote ? <Globe className="w-4 h-4 mr-1.5" /> : <MapPin className="w-4 h-4 mr-1.5" />}
                    {job.location} {job.remote && "(Remote)"}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground py-1 px-3 bg-background" data-testid="detail-salary">
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    {formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground py-1 px-3 bg-background" data-testid="detail-type">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[220px]">
              <Button 
                size="lg" 
                className="w-full shadow-md text-base h-12" 
                onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                disabled={hasApplied}
                data-testid="button-scroll-to-apply"
              >
                {hasApplied ? "Application Sent" : "Apply for this role"}
              </Button>
              <Button variant="outline" className="w-full h-12" onClick={handleShare}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Share this job
              </Button>
              <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-2 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Posted {timeAgo(job.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">About the role</h2>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </section>
            
            {job.requirements && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Requirements</h2>
                <ul className="space-y-3 text-muted-foreground list-disc pl-5 marker:text-primary/50">
                  {job.requirements.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="pl-2">{line.replace(/^[-\*]\s*/, '')}</li>
                  ))}
                </ul>
              </section>
            )}

            <section id="apply-form" className="scroll-mt-24 pt-8">
              <Card className="border-border/50 shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
                  <CardTitle className="text-2xl">Submit your application</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {hasApplied ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Application Sent Successfully!</h3>
                      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Your application is on its way to {job.company}. We'll email you with status updates.</p>
                      <Button variant="outline" size="lg" onClick={() => setHasApplied(false)}>
                        Submit another application
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="applicantName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="Jane Doe" className="h-12" {...field} data-testid="input-apply-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="applicantEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="jane@example.com" className="h-12" {...field} data-testid="input-apply-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="resumeUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resume URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/..." className="h-12" {...field} data-testid="input-apply-resume" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="coverLetter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Letter</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Why are you a great fit for this role?" 
                                  className="min-h-[160px] resize-y" 
                                  {...field} 
                                  data-testid="input-apply-cover-letter"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full h-14 text-base shadow-md" 
                          disabled={applyMutation.isPending}
                          data-testid="button-submit-application"
                        >
                          {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
          
          <div className="space-y-8">
            <Card className="border-border/50 shadow-sm bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Category
                  </div>
                  <div className="font-semibold text-right">{job.category}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </div>
                  <div className="font-semibold text-right">{job.location}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Job Type
                  </div>
                  <div className="font-semibold text-right">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Salary
                  </div>
                  <div className="font-semibold text-right">{formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-bold text-xl">{job.applicationCount || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Applicants</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-bold text-xl">{job.viewCount || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-muted/10">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-background border border-border rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-sm">
                  {job.company.substring(0,2).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg mb-1">{job.company}</h3>
                <Link href={`/jobs?search=${encodeURIComponent(job.company)}`} className="text-sm text-primary hover:underline">
                  View all company jobs
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {similarJobs.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/40">
            <h2 className="text-2xl font-bold mb-8">Similar Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
