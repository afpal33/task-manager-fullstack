import type {Request, Response} from "express";
import {prisma} from "../lib/prisma";

export const createTag = async (req: Request, res: Response) => {
    let statusCode = 201;
    let newTag;

    try {
        newTag = await prisma.tag.create({
            data: {
                name: req.body.name,
            }
        })
    } catch (error: any) {
       statusCode = 500;
       newTag = { message: error.message };
    }

    return res.status(statusCode).json(newTag);
}

export const readTags = async (req: Request, res: Response) => {
    let statusCode = 200;
    const tags = await prisma.tag.findMany();

    return res.status(statusCode).json(tags);
}

export const updateTag = async (req: Request, res: Response) => {
    let statusCode = 200;
    let id = parseInt(<string>req.params.id);
    let tag

    try {
        tag = await prisma.tag.findUnique({ where: { id: id } });
        if (!tag) {
            statusCode = 404;
            tag = { message: "Tag not found" };
        } else tag = await prisma.tag.update({
            where: { id: id },
            data: {
                id: id,
                ...req.body,
            }
        })
    } catch (error: any) {
       statusCode = 500;
       tag = { message: error.message };
    }
    return res.status(statusCode).json(tag);
}

export const deleteTag = async (req: Request, res: Response) => {
    let statusCode = 200;
    let id = parseInt(<string>req.params.id);
    let tag;

    try {
        tag = await prisma.tag.findUnique({ where: { id: id } });
        if (!tag) {
            statusCode = 404;
            tag = { message: "Tag not found" };
        }else await prisma.tag.delete({ where: { id: id } });
    } catch (error: any) {
        statusCode = 500;
        tag = { message: error.message };
    }

    return res.status(statusCode).json(tag);
}