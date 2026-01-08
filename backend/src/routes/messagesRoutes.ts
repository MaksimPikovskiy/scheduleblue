import express, { Router } from 'express';
import prisma from '../prisma';

const router: Router = express.Router();

router.get("/", async (_, res) => {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
});

router.post("/", async (req, res) => {
    const { to, body } = req.body;

    if (!to || !body) {
        return res.status(400).json({ error: "Missing required fields: to, body" });
    }

    try {
        const newMessage = await prisma.message.create({
            data: {
                to: to,
                body: body
            }
        });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to schedule a message" });
    }
});

router.get("/next_message", async (_, res) => {
    const nextMessage = await prisma.message.findFirst({
        where: { status: 'QUEUED' },
        orderBy: { createdAt: 'asc' }
    });

    if (!nextMessage) {
        return res.status(404).json({ error: "No queued messages found" });
    }

    res.json(nextMessage);
});

router.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
        return res.status(400).json({ error: "Missing required fields: id, status" });
    }

    if (!['QUEUED', 'ACCEPTED', 'SENT', 'DELIVERED', 'FAILED'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    try {
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { status }
        });
        res.json(updatedMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to update message status" });
    }
});

export default router;
