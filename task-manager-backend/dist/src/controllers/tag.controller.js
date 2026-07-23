import { prisma } from "../lib/prisma";
export const createTag = async (req, res) => {
    let statusCode = 201;
    let newTag;
    try {
        newTag = await prisma.tag.create({
            data: {
                name: req.body.name,
            }
        });
    }
    catch (error) {
        statusCode = 500;
        newTag = { message: error.message };
    }
    return res.status(statusCode).json(newTag);
};
export const readTags = async (req, res) => {
    let statusCode = 200;
    const tags = await prisma.tag.findMany();
    return res.status(statusCode).json(tags);
};
export const updateTag = async (req, res) => {
    let statusCode = 200;
    let id = parseInt(req.params.id);
    let tag;
    try {
        tag = await prisma.tag.findUnique({ where: { id: id } });
        if (!tag) {
            statusCode = 404;
            tag = { message: "Tag not found" };
        }
        else
            tag = await prisma.tag.update({
                where: { id: id },
                data: {
                    id: id,
                    ...req.body,
                }
            });
    }
    catch (error) {
        statusCode = 500;
        tag = { message: error.message };
    }
    return res.status(statusCode).json(tag);
};
export const deleteTag = async (req, res) => {
    let statusCode = 200;
    let id = parseInt(req.params.id);
    let tag;
    try {
        tag = await prisma.tag.findUnique({ where: { id: id } });
        if (!tag) {
            statusCode = 404;
            tag = { message: "Tag not found" };
        }
        else
            await prisma.tag.delete({ where: { id: id } });
    }
    catch (error) {
        statusCode = 500;
        tag = { message: error.message };
    }
    return res.status(statusCode).json(tag);
};
//# sourceMappingURL=tag.controller.js.map