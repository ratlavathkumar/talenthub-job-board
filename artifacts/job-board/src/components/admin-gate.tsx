import { useState, type ReactNode } from "react";
import { Layout } from "./layout";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Lock, Shield } from "lucide-react";
import { useAdminContext } from "@/App";

export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, login } = useAdminContext();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (isAdmin) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-violet-500/8 z-0" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-xl shadow-primary/25 mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Access</h1>
            <p className="text-muted-foreground">Enter your admin password to manage the job board.</p>
          </div>

          <Card className={`shadow-2xl border-border/40 bg-card/80 backdrop-blur-xl transition-transform ${shake ? "animate-shake" : ""}`}>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    className={`pl-10 h-12 text-base ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoFocus
                    data-testid="input-admin-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
                    Incorrect password. Please try again.
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20"
                  data-testid="btn-admin-login"
                >
                  Access Admin Dashboard
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-6">
                Demo password:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">admin123</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
