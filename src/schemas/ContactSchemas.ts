import { z } from "zod";

export const ContactSchema = z.object({
	identity: z.string(),
	group: z.string().optional(),
	name: z.string().optional(),
	extras: z.record(z.string(), z.any()).optional(),
	email: z.email().optional(),
	phoneNumber: z.string().optional(),
	source: z.string().optional(),
	taxDocument: z.string().optional(),
	tenantId: z.string().optional(),
	isGroupEnabled: z.boolean().optional(),
	identityName: z.string().optional(),
	identityDomain: z.string().optional(),
	lastUpdateDate: z.iso.datetime().optional(),
	lastMessageDate: z.iso.datetime().optional()
});


export const ContactFilterSchema = z
	.object({
		key: z.enum(["phoneNumber", "email", 'name', 'city', 'identity', 'taxdocument']),
		comparator: z.enum(["eq", "ne", "startsWith"]),
		value: z.string(),
	})

export const ContactIdentitySchema = z.string().regex(/^[^@]+@[^@]+$/, "Invalid identity format");

export type Contact = z.infer<typeof ContactSchema>;
export type ContactFilter = z.infer<typeof ContactFilterSchema>;
