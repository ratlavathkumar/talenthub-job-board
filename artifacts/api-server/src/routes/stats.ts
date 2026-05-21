import { Router, type IRouter } from "express";
import { sql, gte, desc } from "drizzle-orm";
import { db, jobsTable, applicationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalJobsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(jobsTable);

  const [totalApplicationsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(applicationsTable);

  const [featuredJobsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(jobsTable)
    .where(sql`${jobsTable.featured} = true`);

  const [newJobsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(jobsTable)
    .where(gte(jobsTable.createdAt, oneWeekAgo));

  res.json({
    totalJobs: totalJobsRow?.count ?? 0,
    totalApplications: totalApplicationsRow?.count ?? 0,
    featuredJobs: featuredJobsRow?.count ?? 0,
    newJobsThisWeek: newJobsRow?.count ?? 0,
  });
});

router.get("/stats/by-category", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: jobsTable.category,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(jobsTable)
    .groupBy(jobsTable.category)
    .orderBy(desc(sql`count(*)`));

  res.json(rows);
});

router.get("/stats/recent-jobs", async (_req, res): Promise<void> => {
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: jobsTable.company,
      companyLogo: jobsTable.companyLogo,
      location: jobsTable.location,
      remote: jobsTable.remote,
      jobType: jobsTable.jobType,
      category: jobsTable.category,
      description: jobsTable.description,
      requirements: jobsTable.requirements,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      currency: jobsTable.currency,
      featured: jobsTable.featured,
      viewCount: jobsTable.viewCount,
      createdAt: jobsTable.createdAt,
      expiresAt: jobsTable.expiresAt,
      applicationCount: sql<number>`cast(count(${applicationsTable.id}) as int)`,
    })
    .from(jobsTable)
    .leftJoin(applicationsTable, sql`${applicationsTable.jobId} = ${jobsTable.id}`)
    .groupBy(jobsTable.id)
    .orderBy(desc(jobsTable.createdAt))
    .limit(6);

  res.json(jobs);
});

router.get("/stats/applications-over-time", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as date,
      cast(count(*) as int) as count
    FROM applications
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY date
    ORDER BY date ASC
  `);

  res.json(rows.rows);
});

export default router;
