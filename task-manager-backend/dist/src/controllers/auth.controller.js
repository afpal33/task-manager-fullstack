import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name.trim() || !email.trim() || !password.trim())
            return res.status(400).json({ message: "Name, email and password are required." });
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser)
            return res.status(400).json({ message: "Email is already registered." });
        console.log("hasshing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });
        return res.status(201).json(user);
    }
    catch (e) {
        return res.status(500).json({ message: `Internal server error: ${e.message}` });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email.trim() || !password.trim())
            return res.status(400).json({ message: "Email and password are required." });
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user)
            return res.status(401).json({ message: "Invalid email or password." });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return res.status(401).json({ message: "Invalid password" });
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return res.status(500).json({ message: "JWT_SECRET is not configured." });
        // @ts-ignore
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        });
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (e) {
        return res.status(500).json({ message: `Internal server error: ${e.message}` });
    }
};
//# sourceMappingURL=auth.controller.js.map