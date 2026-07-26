import { z } from "zod";

export const joinQueueSchema = z.object({
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
        errorMap: () => ({ message: "Invalid difficulty level" })
    }),
    socketId: z.string().min(1, "Socket ID is required"),
    lobbyId: z.string().optional()
});

export const matchProposalSchema = z.object({
    proposalId: z.string().min(1, "Proposal ID is required")
});
