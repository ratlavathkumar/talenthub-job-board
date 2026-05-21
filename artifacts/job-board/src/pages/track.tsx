import { useState } from "react";
import { useListApplications, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { STATUS_COLORS, timeAgo, JOB_TYPE_LABELS } from "../lib/constants";
import { Search, Mail, Building2, MapPin, Briefcase, CheckCircle2, Clock, Check } from "lucide-react";
import { Link } from "wouter";

export default function Track() {
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { data: applications, isLoading, isFetching } = useListApplications(
    { email: submittedEmail },
    { query: { enabled: !!submittedEmail, queryKey: getListApplicationsQueryKey({ email: submittedEmail }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubmittedEmail(emailInput.trim());
    }
  };

  const getCompanyColor = (company: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ];
    let hash = 0;
    for (let i = 0; i < company.length; i++) {
      hash = company.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const STAGES = ["pending", "reviewed", "shortlisted", "hired"];

  return (
    <Layout>
      <div className="bg-muted/20 py-12 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Applications</h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Enter the email address you used to apply to see the status of all your job applications.
          </p>
          
          <Card className="p-2 shadow-lg border-border/50 bg-background/80 backdrop-blur-xl max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  type="email"
                  placeholder="Enter your email address" 
                  className="pl-12 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  data-testid="input-track-email"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-lg shadow-sm" disabled={isFetching} data-testid="button-track-submit">
                {isFetching ? "Searching..." : "Track"}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl">
        {isLoading || isFetching ? (
          <div className="space-y-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-[250px] w-full rounded-2xl" />)}
          </div>
        ) : submittedEmail && applications ? (
          applications.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Found {applications.length} {applications.length === 1 ? 'application' : 'applications'} for {submittedEmail}
              </h2>
              {applications.map(app => (
                <Card key={app.id} className="border-border/50 shadow-sm overflow-hidden bg-card" data-testid={`card-app-${app.id}`}>
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                      <div className="flex gap-4 items-center">
                        {app.companyLogo ? (
                          <img src={app.companyLogo} alt={app.company} className="w-14 h-14 rounded-xl border bg-background object-cover" />
                        ) : (
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border border-transparent ${getCompanyColor(app.company)}`}>
                            {app.company.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link href={`/jobs/${app.jobId}`} className="text-xl font-bold hover:text-primary transition-colors block mb-1">
                            {app.jobTitle}
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4"/> {app.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {app.location}</span>
                            <Badge variant="secondary" className="font-normal bg-muted/50">{JOB_TYPE_LABELS[app.jobType] || app.jobType}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between">
                        <Badge variant="outline" className={`px-3 py-1 shadow-sm border-transparent ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Applied {timeAgo(app.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline */}
                    <div className="p-6 bg-muted/10">
                      <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-border/60 -translate-y-1/2 rounded-full z-0"></div>
                        
                        {(() => {
                          const currentIndex = app.status === 'rejected' ? -1 : STAGES.indexOf(app.status);
                          const isRejected = app.status === 'rejected';
                          
                          // Fill line
                          const fillWidth = currentIndex >= 0 ? `${(currentIndex / (STAGES.length - 1)) * 100}%` : '0%';
                          
                          return (
                            <>
                              {!isRejected && (
                                <div 
                                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                                  style={{ width: fillWidth }}
                                ></div>
                              )}
                              
                              <div className="relative z-10 flex justify-between">
                                {STAGES.map((stage, idx) => {
                                  const isCompleted = !isRejected && idx <= currentIndex;
                                  const isActive = !isRejected && idx === currentIndex;
                                  const isError = isRejected && stage === 'pending'; // Just highlight first node red if rejected for simplicity, or we can do something else.
                                  
                                  return (
                                    <div key={stage} className="flex flex-col items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors ${
                                        isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                                        isRejected ? 'bg-destructive/10 border-destructive text-destructive' :
                                        'bg-background border-border text-muted-foreground'
                                      }`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                                      </div>
                                      <span className={`text-xs mt-2 font-medium capitalize ${
                                        isCompleted ? 'text-foreground' : 
                                        isRejected ? 'text-destructive' :
                                        'text-muted-foreground'
                                      }`}>
                                        {isRejected ? (idx === 0 ? 'Rejected' : '') : stage}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/60">
              <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find any applications linked to <strong>{submittedEmail}</strong>. Please check for typos or browse our open roles.</p>
              <Link href="/jobs">
                <Button size="lg" className="shadow-sm">Browse Jobs</Button>
              </Link>
            </div>
          )
        ) : null}
      </div>
    </Layout>
  );
}
