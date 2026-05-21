import { Job } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { MapPin, DollarSign, Building2, Clock, Globe, Users, Eye, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatCurrency, JOB_TYPE_LABELS, timeAgo } from "../lib/constants";
import { Button } from "./ui/button";
import { useSavedJobs } from "@/hooks/use-saved-jobs";

interface JobCardProps {
  job: Job;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
];

function getCompanyColor(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(company: string) {
  return company.substring(0, 2).toUpperCase();
}

export function JobCard({ job }: JobCardProps) {
  const [, setLocation] = useLocation();
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(job.id);

  const getJobTypeVariant = (type: string) => {
    switch(type) {
      case "full-time": return "default";
      case "part-time": return "secondary";
      case "contract": return "outline";
      case "internship": return "outline";
      default: return "outline";
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    setLocation(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(job.id);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="relative cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-300 group flex flex-col h-full bg-card" 
      data-testid={`card-job-${job.id}`}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-4 z-10 h-8 w-8 hover:bg-muted"
        onClick={handleSaveClick}
        data-testid={`btn-save-job-${job.id}`}
      >
        <Heart className={`w-5 h-5 transition-colors ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground group-hover:text-rose-400"}`} />
      </Button>

      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={`${job.company} logo`}
            className="w-14 h-14 rounded-xl object-cover border bg-background"
          />
        ) : (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${getCompanyColor(job.company)}`}>
            {getInitials(job.company)}
          </div>
        )}
        <div className="flex-1 overflow-hidden pr-8">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-xl truncate group-hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`} className="focus:outline-none" data-testid={`link-job-title-${job.id}`} onClick={e => e.preventDefault()}>
                {job.title}
              </Link>
            </CardTitle>
            {job.featured && <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm border-amber-200 dark:border-amber-800/50">Featured</Badge>}
          </div>
          <p className="text-base text-muted-foreground truncate font-medium">
            {job.company}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2" data-testid={`text-job-location-${job.id}`}>
            {job.remote ? <Globe className="w-4 h-4 shrink-0 text-primary/60" /> : <MapPin className="w-4 h-4 shrink-0 text-primary/60" />}
            <span className="truncate">{job.location} {job.remote && "(Remote)"}</span>
          </div>
          <div className="flex items-center gap-2" data-testid={`text-job-salary-${job.id}`}>
            <DollarSign className="w-4 h-4 shrink-0 text-primary/60" />
            <span className="truncate">{formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant={getJobTypeVariant(job.jobType) as any}>{JOB_TYPE_LABELS[job.jobType] || job.jobType}</Badge>
          <Badge variant="outline" className="bg-muted/50">{job.category}</Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-4 mt-auto border-t p-4 flex items-center justify-between bg-muted/10 rounded-b-xl">
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5" title={`${job.viewCount || 0} views`}>
            <Eye className="w-3.5 h-3.5" />
            {job.viewCount || 0}
          </span>
          <span className="flex items-center gap-1.5" title={`${job.applicationCount || 0} applications`}>
            <Users className="w-3.5 h-3.5" />
            {job.applicationCount || 0}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo(job.createdAt)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
