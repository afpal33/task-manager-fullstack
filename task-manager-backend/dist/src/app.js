import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes";
import tagRoutes from "./routes/tag.routes";
import authRoutes from "./routes/auth.routes";
const app = express();
// Global middlewares
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});
// Routes
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/auth", authRoutes);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "404: Endpoint Not Found",
    });
});
export default app;
//# sourceMappingURL=app.js.map