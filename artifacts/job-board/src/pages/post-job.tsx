import { useCreateJob } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Layout } from "../components/layout";
import { AdminGate } from "../components/admin-gate";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { JOB_CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from "../lib/constants";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(2, "Job title is required").max(100),
  company: z.string().min(2, "Company name is required").max(100),
  companyLogo: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  location: z.string().min(2, "Location is required"),
  remote: z.boolean().default(false),
  jobType: z.string().min(1, "Job type is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().optional(),
  salaryMin: z.coerce.number().min(0, "Minimum salary must be 0 or greater"),
  salaryMax: z.coerce.number().min(0, "Maximum salary must be 0 or greater"),
  currency: z.string().default("USD"),
  featured: z.boolean().default(false),
}).refine(data => data.salaryMax >= data.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salaryMax"],
});

type JobFormValues = z.infer<typeof jobSchema>;

function PostJobForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      companyLogo: "",
      location: "",
      remote: false,
      jobType: "full-time",
      category: "Engineering",
      description: "",
      requirements: "",
      salaryMin: 50000,
      salaryMax: 100000,
      currency: "USD",
      featured: false,
    },
  });

  const onSubmit = (data: JobFormValues) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: (newJob) => {
          toast({
            title: "Job posted successfully",
            description: "Your job listing is now live.",
          });
          setLocation(`/jobs/${newJob.id}`);
        },
        onError: () => {
          toast({
            title: "Error posting job",
            description: "Please check your inputs and try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-3xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Post a Job</h1>
          <p className="text-lg text-muted-foreground">Reach thousands of talented professionals looking for their next opportunity.</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide accurate information to attract the right candidates.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior Frontend Engineer" {...field} data-testid="input-post-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} data-testid="input-post-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyLogo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-post-logo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Categorization */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2">Role Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {JOB_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {JOB_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{JOB_TYPE_LABELS[type]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. San Francisco, CA or Worldwide" {...field} data-testid="input-post-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2 sm:mt-8">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Remote Position</FormLabel>
                            <FormDescription>
                              Can this role be performed remotely?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-post-remote"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Compensation */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2">Compensation (Annual)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-post-salary-min" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-post-salary-max" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-currency">
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (£)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2">Description & Requirements</h3>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and team..." 
                            className="min-h-[200px]" 
                            {...field} 
                            data-testid="input-post-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List required skills, experience, and qualifications..." 
                            className="min-h-[150px]" 
                            {...field} 
                            data-testid="input-post-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto px-10 text-lg h-14" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit-job"
                  >
                    {createMutation.isPending ? "Posting..." : "Post Job Listing"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function PostJob() {
  return (
    <AdminGate>
      <PostJobForm />
    </AdminGate>
  );
}
