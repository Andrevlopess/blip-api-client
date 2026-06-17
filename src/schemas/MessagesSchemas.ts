import { z } from "zod";

export const SendMessageSchema = z.object({
	to: z.string(),
	content: z.union([z.record(z.string(), z.any()), z.string()]),
	type: z.string(),
});

export const SendEmailSchema = z.object({
	to: z.union([z.email(), z.array(z.email())]),
	content: z.string(),
	type: z.string(),
	subject: z.string(),
});



export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type SendEmailInput= z.infer<typeof SendEmailSchema>;
