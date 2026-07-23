import { prisma } from "../lib/prisma";
export const createTask = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, tags = [] } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }
        const cleanedTags = Array.isArray(tags)
            ? [...new Set(tags
                    .map((tag) => tag.trim().toLowerCase())
                    .filter((tag) => tag.length > 0))]
            : [];
        for (const tagName of cleanedTags) {
            await prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
            });
        }
        const newTask = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                userId,
                tags: {
                    connect: cleanedTags.map((name) => ({ name })),
                },
            },
            include: {
                tags: true,
            },
        });
        return res.status(201).json(newTask);
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
export const readTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await prisma.task.findMany({
            where: { userId: userId },
            include: { tags: true },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json(tasks);
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
export const updateTask = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const userId = req.user.userId;
        const { tags, ...rest } = req.body;
        const found = await prisma.task.findFirst({
            where: {
                id: id,
                userId: userId
            }
        });
        if (!found)
            return res.status(404).json({ message: "Task not found" });
        let tagsData = {};
        if (Array.isArray(tags)) {
            const cleanedTags = [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0))];
            for (const tagName of cleanedTags) {
                await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });
            }
            tagsData = {
                tags: {
                    set: cleanedTags.map((name) => ({ name })),
                }
            };
        }
        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: {
                ...rest,
                ...tagsData,
            },
            include: {
                tags: true
            },
        });
        return res.status(200).json(updatedTask);
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
export const deleteTask = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const userId = req.user.userId;
        const found = await prisma.task.findFirst({
            where: { id, userId },
        });
        if (!found) {
            return res.status(404).json({ message: "Task not found" });
        }
        await prisma.task.delete({
            where: { id },
        });
        return res.status(200).json({ message: "Task deleted" });
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
export const toggleTask = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const userId = req.user.userId;
        const found = await prisma.task.findFirst({
            where: { id, userId },
        });
        if (!found) {
            return res.status(404).json({ message: "Task not found" });
        }
        const updated = await prisma.task.update({
            where: { id },
            data: {
                completed: !found.completed,
            },
            include: {
                tags: true,
            },
        });
        return res.status(200).json(updated);
    }
    catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
//# sourceMappingURL=task.controller.js.map