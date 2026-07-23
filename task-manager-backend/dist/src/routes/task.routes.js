import { Router } from "express";
import { createTask, deleteTask, readTasks, toggleTask, updateTask } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();
router.use(authMiddleware);
router.get("/", readTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/toggle", toggleTask);
export default router;
//# sourceMappingURL=task.routes.js.map