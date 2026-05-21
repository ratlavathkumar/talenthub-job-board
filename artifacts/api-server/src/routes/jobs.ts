import { Router, type IRouter } from "express";
import { and, eq, gte, lte, ilike, or, sql, desc } from "drizzle-orm";
import { db, jobsTable, applicationsTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
  ListJobApplicationsParams,
  ApplyToJobParams,
  ApplyToJobBody,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, location, jobType, category, salaryMin, salaryMax, featured } = parsed.data;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(jobsTable.title, `%${search}%`),
        ilike(jobsTable.company, `%${search}%`),
        ilike(jobsTable.description, `%${search}%`)
      )
    );
  }
  if (location) {
    conditions.push(ilike(jobsTable.location, `%${location}%`));
  }
  if (jobType) {
    conditions.push(eq(jobsTable.jobType, jobType));
  }
  if (category) {
    conditions.push(eq(jobsTable.category, category));
  }
  if (salaryMin != null) {
    conditions.push(gte(jobsTable.salaryMin, salaryMin));
  }
  if (salaryMax != null) {
    conditions.push(lte(jobsTable.salaryMax, salaryMax));
  }
  if (featured != null) {
    conditions.push(eq(jobsTable.featured, featured));
  }

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
      createdAt: jobsTable.createdAt,
      expiresAt: jobsTable.expiresAt,
      applicationCount: sql<number>`cast(count(${applicationsTable.id}) as int)`,
    })
    .from(jobsTable)
    .leftJoin(applicationsTable, eq(applicationsTable.jobId, jobsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(jobsTable.id)
    .orderBy(desc(jobsTable.featured), desc(jobsTable.createdAt));

  res.json(jobs);
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.insert(jobsTable).values(parsed.data).returning();

  res.status(201).json({ ...job, applicationCount: 0 });
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
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
      createdAt: jobsTable.createdAt,
      expiresAt: jobsTable.expiresAt,
      applicationCount: sql<number>`cast(count(${applicationsTable.id}) as int)`,
    })
    .from(jobsTable)
    .leftJoin(applicationsTable, eq(applicationsTable.jobId, jobsTable.id))
    .where(eq(jobsTable.id, params.data.id))
    .groupBy(jobsTable.id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({ ...job, applicationCount: 0 });
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .delete(jobsTable)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/jobs/:id/applications", async (req, res): Promise<void> => {
  const params = ListJobApplicationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const applications = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.jobId, params.data.id))
    .orderBy(desc(applicationsTable.createdAt));

  res.json(applications);
});

router.post("/jobs/:id/applications", async (req, res): Promise<void> => {
  const params = ApplyToJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ApplyToJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existingJob] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id)).limit(1);
  if (!existingJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({ ...parsed.data, jobId: params.data.id })
    .returning();

  res.status(201).json(application);
});

export default router;
