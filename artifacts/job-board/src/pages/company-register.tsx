import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2, Building2, ArrowRight, User } from "lucide-react";
import { useCompanyAuthContext } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Company name required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "E-commerce", "Media", "Manufacturing", "Consulting", "Other"];

export default function CompanyRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { register: registerCompany } = useCompanyAuthContext();
  const { toast } = useToast();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
  console.log(data);

  toast({
    title: "Company registered!",
    description: "Your company dashboard is ready.",
  });

  navigate("/company/dashboard");
};

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/8 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <header className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">TalentHub</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
              <Building2 className="w-3 h-3" />
              For Employers
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Register your company</h1>
            <p className="text-muted-foreground">Start posting jobs and finding top talent</p>
          </div>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-600" />
                Company Profile
              </CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Company name <span className="text-destructive">*</span></Label>
                    <Input placeholder="Acme Corp" {...form.register("name")} className={form.formState.errors.name ? "border-destructive" : ""} />
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Company email <span className="text-destructive">*</span></Label>
                    <Input type="email" placeholder="hiring@acme.com" autoComplete="email" {...form.register("email")} className={form.formState.errors.email ? "border-destructive" : ""} />
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" autoComplete="new-password" {...form.register("password")} className={`pr-10 ${form.formState.errors.password ? "border-destructive" : ""}`} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select onValueChange={(v) => form.setValue("industry", v)}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Company size</Label>
                    <Select onValueChange={(v) => form.setValue("size", v)}>
                      <SelectTrigger><SelectValue placeholder="Employees" /></SelectTrigger>
                      <SelectContent>{COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://acme.com" {...form.register("website")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input placeholder="San Francisco, CA" {...form.register("location")} />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Company description</Label>
                    <Textarea placeholder="Tell candidates what makes your company great..." rows={3} {...form.register("description")} />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-md shadow-violet-500/20" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Create Company Account</>}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link href="/company/login" className="text-violet-600 font-medium hover:underline">Sign in</Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-3">Looking for a job?</span></div>
          </div>

          <Link href="/register">
            <Button variant="outline" className="w-full gap-2">
              <User className="w-4 h-4" />
              Register as Candidate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
