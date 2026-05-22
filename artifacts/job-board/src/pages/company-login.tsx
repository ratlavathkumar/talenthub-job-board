import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2, Building2, ArrowRight, User, BarChart3 } from "lucide-react";
import { useCompanyAuthContext } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function CompanyLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { login } = useCompanyAuthContext();
  const { toast } = useToast();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      toast({ title: "Welcome back!", description: "You're signed in to your company account." });
      navigate("/company/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/8 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <header className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">TalentHub</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
              <Building2 className="w-3 h-3" />
              Company Portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Company sign in</h1>
            <p className="text-muted-foreground">Post jobs and manage applications from your dashboard</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Building2, label: "Post Jobs" },
              { icon: BarChart3, label: "Analytics" },
              { icon: User, label: "Manage" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border/60">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-600" />
                Company Sign In
              </CardTitle>
              <CardDescription>Access your hiring dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Company email</Label>
                  <Input id="email" type="email" placeholder="hiring@yourcompany.com" autoComplete="email" {...form.register("email")} className={form.formState.errors.email ? "border-destructive" : ""} />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" {...form.register("password")} className={`pr-10 ${form.formState.errors.password ? "border-destructive" : ""}`} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-md shadow-violet-500/20" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Access Dashboard <ArrowRight className="h-4 w-4" /></>}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  New to TalentHub?{" "}
                  <Link href="/company/register" className="text-violet-600 font-medium hover:underline">Register your company</Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-3">Looking for a job?</span></div>
          </div>

          <Link href="/login">
            <Button variant="outline" className="w-full gap-2">
              <User className="w-4 h-4" />
              Sign in as Candidate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
