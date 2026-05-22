import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2, Sparkles, ArrowRight, Building2, User } from "lucide-react";
import { useUserAuthContext } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  location: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { register: registerUser } = useUserAuthContext();
  const { toast } = useToast();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

 const onSubmit = async (data: FormValues) => {
  const candidates = JSON.parse(
    localStorage.getItem("candidates") || "[]"
  );

  candidates.push(data);

  localStorage.setItem(
    "candidates",
    JSON.stringify(candidates)
  );

  toast({
    title: "Account created!",
    description: "Welcome to TalentHub.",
  });

  navigate("/jobs");
};

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-amber-500/8 blur-3xl animate-blob animation-delay-2000" />
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
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Join TalentHub
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Find and apply to your dream job</p>
          </div>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Candidate Account
              </CardTitle>
              <CardDescription>Browse jobs and apply with your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder="Jane Doe" {...form.register("name")} className={form.formState.errors.name ? "border-destructive" : ""} />
                    {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="email">Email address <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" placeholder="jane@example.com" autoComplete="email" {...form.register("email")} className={form.formState.errors.email ? "border-destructive" : ""} />
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        {...form.register("password")}
                        className={`pr-10 ${form.formState.errors.password ? "border-destructive" : ""}`}
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="phone" type="tel" placeholder="+1 555-0100" {...form.register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="location" placeholder="New York, NY" {...form.register("location")} />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Create Account</>}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-3">Are you hiring?</span></div>
          </div>

          <Link href="/company/register">
            <Button variant="outline" className="w-full gap-2 hover:border-primary/40 hover:text-primary">
              <Building2 className="w-4 h-4" />
              Register as Company
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
