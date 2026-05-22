import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import statsRouter from "./stats";
import authRouter from "./auth";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(statsRouter);
router.use(authRouter);
router.use(storageRouter);

export default router;
