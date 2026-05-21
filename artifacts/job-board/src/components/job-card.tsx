import { Job } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MapPin, DollarSign, Building2, Clock, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatCurrency, JOB_TYPE_LABELS } from "../lib/constants";
import { Button } from "./ui/button";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 group flex flex-col h-full" data-testid={`card-job-${job.id}`}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={`${job.company} logo`}
            className="w-12 h-12 rounded object-cover border"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border text-muted-foreground shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`} className="focus:outline-none" data-testid={`link-job-title-${job.id}`}>
                {job.title}
              </Link>
            </CardTitle>
            {job.featured && <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">Featured</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate font-medium mt-1">
            {job.company}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5" data-testid={`text-job-location-${job.id}`}>
            {job.remote ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {job.location} {job.remote && "(Remote)"}
          </div>
          <div className="flex items-center gap-1.5" data-testid={`text-job-salary-${job.id}`}>
            <DollarSign className="w-4 h-4" />
            {formatCurrency(job.salaryMin, job.currency)} - {formatCurrency(job.salaryMax, job.currency)}
          </div>
          <div className="flex items-center gap-1.5" data-testid={`text-job-type-${job.id}`}>
            <Clock className="w-4 h-4" />
            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{job.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto border-t p-4 flex items-center justify-between bg-muted/20">
        <div className="text-xs text-muted-foreground">
          {new Date(job.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </div>
        <Link href={`/jobs/${job.id}`} data-testid={`link-job-apply-${job.id}`}>
          <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
