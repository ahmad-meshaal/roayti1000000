import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";
import uploadRouter from "./upload";
import usersRouter from "./users";
import novelsRouter from "./novels";
import chaptersRouter from "./chapters";
import followsRouter from "./follows";
import libraryRouter from "./library";
import progressRouter from "./progress";
import commentsRouter from "./comments";
import charactersRouter from "./characters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(uploadRouter);
router.use(usersRouter);
router.use(novelsRouter);
router.use(chaptersRouter);
router.use(followsRouter);
router.use(libraryRouter);
router.use(progressRouter);
router.use(commentsRouter);
router.use(charactersRouter);

export default router;
