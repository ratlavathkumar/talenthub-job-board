import { Router, type IRouter } from "express";
import { eq, desc, ilike } from "drizzle-orm";
import { db, applicationsTable, jobsTable } from "@workspace/db";
import {
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const email = typeof req.query.email === "string" ? req.query.email.trim() : null;

  if (!email) {
    const applications = await db
      .select({
        id: applicationsTable.id,
        jobId: applicationsTable.jobId,
        applicantName: applicationsTable.applicantName,
        applicantEmail: applicationsTable.applicantEmail,
        coverLetter: applicationsTable.coverLetter,
        resumeUrl: applicationsTable.resumeUrl,
        status: applicationsTable.status,
        createdAt: applicationsTable.createdAt,
        jobTitle: jobsTable.title,
        company: jobsTable.company,
        location: jobsTable.location,
        jobType: jobsTable.jobType,
        companyLogo: jobsTable.companyLogo,
      })
      .from(applicationsTable)
      .innerJoin(jobsTable, eq(jobsTable.id, applicationsTable.jobId))
      .orderBy(desc(applicationsTable.createdAt));
    res.json(applications);
    return;
  }

  const applications = await db
    .select({
      id: applicationsTable.id,
      jobId: applicationsTable.jobId,
      applicantName: applicationsTable.applicantName,
      applicantEmail: applicationsTable.applicantEmail,
      coverLetter: applicationsTable.coverLetter,
      resumeUrl: applicationsTable.resumeUrl,
      status: applicationsTable.status,
      createdAt: applicationsTable.createdAt,
      jobTitle: jobsTable.title,
      company: jobsTable.company,
      location: jobsTable.location,
      jobType: jobsTable.jobType,
      companyLogo: jobsTable.companyLogo,
    })
    .from(applicationsTable)
    .innerJoin(jobsTable, eq(jobsTable.id, applicationsTable.jobId))
    .where(ilike(applicationsTable.applicantEmail, email))
    .orderBy(desc(applicationsTable.createdAt));

  res.json(applications);
});

router.patch("/applications/:id/status", async (req, res): Promise<void> => {
  const params = UpdateApplicationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [application] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(application);
});

export default router;
