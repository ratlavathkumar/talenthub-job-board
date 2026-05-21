import { Job } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { MapPin, Clock, Globe, Users, Eye, Heart, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatCurrency, JOB_TYPE_LABELS, timeAgo, JOB_TYPE_COLORS, CATEGORY_COLORS } from "../lib/constants";
import { Button } from "./ui/button";
import { useSavedJobs } from "@/hooks/use-saved-jobs";

interface JobCardProps {
  job: Job;
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
  "bg-gradient-to-br from-violet-400 to-violet-600 text-white",
  "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
  "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
  "bg-gradient-to-br from-rose-400 to-rose-600 text-white",
  "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white",
  "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white",
  "bg-gradient-to-br from-teal-400 to-teal-600 text-white",
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

  const typeColor = JOB_TYPE_COLORS[job.jobType] || "bg-muted text-muted-foreground border-border";
  const catColors = CATEGORY_COLORS[job.category];
  const categoryBadgeClass = catColors?.badge || "bg-muted/50 text-muted-foreground border-border";

  const handleCardClick = () => {
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
      className="relative cursor-pointer hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300 group flex flex-col h-full bg-card"
      data-testid={`card-job-${job.id}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        onClick={handleSaveClick}
        data-testid={`btn-save-job-${job.id}`}
      >
        <Heart
          className={`w-4.5 h-4.5 transition-all duration-200 ${
            saved
              ? "fill-rose-500 text-rose-500 scale-110"
              : "text-muted-foreground group-hover:text-rose-400"
          }`}
        />
      </Button>

      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={`${job.company} logo`}
            className="w-14 h-14 rounded-xl object-cover border bg-background shadow-sm"
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${getCompanyColor(job.company)}`}
          >
            {getInitials(job.company)}
          </div>
        )}
        <div className="flex-1 overflow-hidden pr-8">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
              <Link
                href={`/jobs/${job.id}`}
                className="focus:outline-none"
                data-testid={`link-job-title-${job.id}`}
                onClick={(e) => e.preventDefault()}
              >
                {job.title}
              </Link>
            </CardTitle>
            {job.featured && (
              <Badge className="shrink-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40 text-xs font-semibold">
                Featured
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate font-medium">{job.company}</p>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5" data-testid={`text-job-location-${job.id}`}>
            {job.remote ? (
              <Globe className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            ) : (
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            )}
            <span className="truncate text-xs">{job.location}{job.remote ? " · Remote" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5" data-testid={`text-job-salary-${job.id}`}>
            <DollarSign className="w-3.5 h-3.5 shrink-0 text-primary/60" />
            <span className="truncate text-xs">
              {formatCurrency(job.salaryMin, job.currency)}–{formatCurrency(job.salaryMax, job.currency)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryBadgeClass}`}>
            {job.category}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 mt-auto border-t p-4 flex items-center justify-between bg-muted/20 rounded-b-xl">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title={`${job.viewCount ?? 0} views`}>
            <Eye className="w-3.5 h-3.5" />
            {job.viewCount ?? 0}
          </span>
          <span className="flex items-center gap-1" title={`${job.applicationCount ?? 0} applications`}>
            <Users className="w-3.5 h-3.5" />
            {job.applicationCount ?? 0}
          </span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(job.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}
