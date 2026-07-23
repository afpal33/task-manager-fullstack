import { Router } from "express";
import { createTag, deleteTag, readTags, updateTag } from "../controllers/tag.controller";
const router = Router();
router.get("/", readTags);
router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);
export default router;
//# sourceMappingURL=tag.routes.js.map