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

export const CATEGORY_COLORS: Record<string, { card: string; icon: string; badge: string }> = {
  "Engineering": {
    card: "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-200/60 dark:border-blue-800/40",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800/60",
  },
  "Design": {
    card: "from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border-pink-200/60 dark:border-pink-800/40",
    icon: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
    badge: "bg-pink-500/10 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-800/60",
  },
  "Marketing": {
    card: "from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border-orange-200/60 dark:border-orange-800/40",
    icon: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    badge: "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800/60",
  },
  "Finance": {
    card: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-200/60 dark:border-emerald-800/40",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  "Product": {
    card: "from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 border-indigo-200/60 dark:border-indigo-800/40",
    icon: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-800/60",
  },
  "Sales": {
    card: "from-cyan-500/10 to-sky-500/10 hover:from-cyan-500/20 hover:to-sky-500/20 border-cyan-200/60 dark:border-cyan-800/40",
    icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-800/60",
  },
  "Operations": {
    card: "from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border-amber-200/60 dark:border-amber-800/40",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800/60",
  },
  "Legal": {
    card: "from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border-red-200/60 dark:border-red-800/40",
    icon: "bg-red-500/15 text-red-600 dark:text-red-400",
    badge: "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800/60",
  },
};

export const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800/60",
  "part-time": "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800/60",
  "contract": "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800/60",
  "internship": "bg-violet-500/10 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-800/60",
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
