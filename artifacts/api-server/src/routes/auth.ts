import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const SALT_ROUNDS = 10;

function toUserPublic(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    bio: u.bio ?? null,
    location: u.location ?? null,
    profileImageUrl: u.profileImageUrl ?? null,
    resumeUrl: u.resumeUrl ?? null,
    createdAt: u.createdAt,
  };
}

function toCompanyPublic(c: typeof companiesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    logoUrl: c.logoUrl ?? null,
    website: c.website ?? null,
    industry: c.industry ?? null,
    description: c.description ?? null,
    size: c.size ?? null,
    location: c.location ?? null,
    approved: c.approved,
    createdAt: c.createdAt,
  };
}

// ─── User Auth ──────────────────────────────────────────────────────────────

router.post("/auth/user/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, location } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, phone, location }).returning();
  req.session.userId = user.id;
  req.session.userType = "user";
  res.status(201).json(toUserPublic(user));
});

router.post("/auth/user/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session.userId = user.id;
  req.session.userType = "user";
  res.json(toUserPublic(user));
});

router.post("/auth/user/logout", (req, res): void => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

router.get("/auth/user/me", async (req, res): Promise<void> => {
  if (!req.session.userId || req.session.userType !== "user") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(toUserPublic(user));
});

router.patch("/auth/user/me", async (req, res): Promise<void> => {
  if (!req.session.userId || req.session.userType !== "user") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { name, phone, bio, location, profileImageUrl, resumeUrl } = req.body;
  const [updated] = await db
    .update(usersTable)
    .set({ name, phone, bio, location, profileImageUrl, resumeUrl })
    .where(eq(usersTable.id, req.session.userId))
    .returning();
  res.json(toUserPublic(updated));
});

// ─── Company Auth ────────────────────────────────────────────────────────────

router.post("/auth/company/register", async (req, res): Promise<void> => {
  const { name, email, password, website, industry, description, size, location } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" });
    return;
  }
  const existing = await db.select().from(companiesTable).where(eq(companiesTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [company] = await db
    .insert(companiesTable)
    .values({ name, email, passwordHash, website, industry, description, size, location })
    .returning();
  req.session.companyId = company.id;
  req.session.userType = "company";
  res.status(201).json(toCompanyPublic(company));
});

router.post("/auth/company/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.email, email)).limit(1);
  if (!company) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, company.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session.companyId = company.id;
  req.session.userType = "company";
  res.json(toCompanyPublic(company));
});

router.post("/auth/company/logout", (req, res): void => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

router.get("/auth/company/me", async (req, res): Promise<void> => {
  if (!req.session.companyId || req.session.userType !== "company") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, req.session.companyId)).limit(1);
  if (!company) {
    res.status(401).json({ error: "Company not found" });
    return;
  }
  res.json(toCompanyPublic(company));
});

router.patch("/auth/company/me", async (req, res): Promise<void> => {
  if (!req.session.companyId || req.session.userType !== "company") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { name, website, industry, description, size, location, logoUrl } = req.body;
  const [updated] = await db
    .update(companiesTable)
    .set({ name, website, industry, description, size, location, logoUrl })
    .where(eq(companiesTable.id, req.session.companyId))
    .returning();
  res.json(toCompanyPublic(updated));
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

router.get("/admin/companies", async (req, res): Promise<void> => {
  const all = await db.select().from(companiesTable).orderBy(companiesTable.createdAt);
  res.json(all.map(toCompanyPublic));
});

router.patch("/admin/companies/:id", async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  const { approved, name } = req.body;
  const [updated] = await db
    .update(companiesTable)
    .set({ approved, name })
    .where(eq(companiesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toCompanyPublic(updated));
});

router.delete("/admin/companies/:id", async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  await db.delete(companiesTable).where(eq(companiesTable.id, id));
  res.status(204).send();
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const all = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(all.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    location: u.location ?? null,
    createdAt: u.createdAt,
  })));
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
