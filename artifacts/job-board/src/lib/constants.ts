import { Code2, Palette, Megaphone, TrendingUp, Layers, Users, Settings, Scale } from "lucide-react";

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Finance",
  "Product",
  "Sales",
  "Operations",
  "Legal"
];

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Engineering": Code2,
  "Design": Palette,
  "Marketing": Megaphone,
  "Finance": TrendingUp,
  "Product": Layers,
  "Sales": Users,
  "Operations": Settings,
  "Legal": Scale
};

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship"
];

export const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "contract": "Contract",
  "internship": "Internship"
};

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected"
];

export const STATUS_COLORS: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "reviewed": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "shortlisted": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "rejected": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

export const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export function timeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
