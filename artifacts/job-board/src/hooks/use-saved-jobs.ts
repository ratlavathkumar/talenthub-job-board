import { useState } from "react";

const KEY = "talentHub_savedJobs";

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  const toggle = (id: number) => setSavedIds(prev => {
    const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  });

  const isSaved = (id: number) => savedIds.includes(id);

  return { savedIds, toggle, isSaved };
}
