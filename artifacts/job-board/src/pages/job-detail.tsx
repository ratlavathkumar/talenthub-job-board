import { useGetJob, useApplyToJob } from "@workspace/api-client-react";
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
import { formatCurrency, JOB_TYPE_LABELS } from "../lib/constants";
import { Building2, MapPin, DollarSign, Clock, Globe, Calendar, ArrowLeft, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-xl" />
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
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>Browse other jobs</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
          <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to jobs
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border bg-background shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center border text-muted-foreground shrink-0 shadow-sm">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{job.title}</h1>
                  {job.featured && <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Featured</Badge>}
                </div>
                <div className="text-xl text-muted-foreground mb-4 font-medium">
                  {job.company}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium" data-testid="detail-location">
                    {job.remote ? <Globe className="w-4.5 h-4.5" /> : <MapPin className="w-4.5 h-4.5" />}
                    {job.location} {job.remote && "(Remote)"}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium" data-testid="detail-salary">
                    <DollarSign className="w-4.5 h-4.5" />
                    {formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium" data-testid="detail-type">
                    <Clock className="w-4.5 h-4.5" />
                    {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Button 
                size="lg" 
                className="w-full shadow-sm" 
                onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                disabled={hasApplied}
                data-testid="button-scroll-to-apply"
              >
                {hasApplied ? "Applied" : "Apply Now"}
              </Button>
              <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">About the role</h2>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </section>
            
            {job.requirements && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </section>
            )}

            <section id="apply-form" className="scroll-mt-24 pt-8 border-t">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 border-b pb-6">
                  <CardTitle className="text-2xl">Apply for this position</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {hasApplied ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Application Sent!</h3>
                      <p className="text-muted-foreground mb-6">Your application has been successfully submitted to {job.company}.</p>
                      <Button variant="outline" onClick={() => setHasApplied(false)}>
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
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jane Doe" {...field} data-testid="input-apply-name" />
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="jane@example.com" {...field} data-testid="input-apply-email" />
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
                              <FormLabel>Resume URL (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/..." {...field} data-testid="input-apply-resume" />
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
                              <FormLabel>Cover Letter (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Why are you a good fit for this role?" 
                                  className="min-h-[120px]" 
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
                          className="w-full sm:w-auto px-8" 
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
          
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{job.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-medium">{job.location} {job.remote && "(Remote)"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Job Type</div>
                  <div className="font-medium">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Salary Range</div>
                  <div className="font-medium">{formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
