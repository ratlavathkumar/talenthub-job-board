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

export const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};
