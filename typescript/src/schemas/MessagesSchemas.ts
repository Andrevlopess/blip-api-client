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


export const ContactFilterSchema = z
	.object({
		key: z.enum(["phoneNumber", "email", 'name', 'city', 'identity', 'taxdocument']),
		comparator: z.enum(["eq", "ne", "startsWith"]),
		value: z.string(),
	})

export const ContactIdentitySchema = z.string().regex(/^[^@]+@[^@]+$/, "Invalid identity format");

export type SendMessageData = z.infer<typeof SendMessageSchema>;
export type SendEmailData = z.infer<typeof SendEmailSchema>;
export type ContactFilter = z.infer<typeof ContactFilterSchema>;
