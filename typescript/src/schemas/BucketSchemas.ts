import { z } from "zod";

export const DocumentSchema = z.object({
	type: z.string(),
	content: z.any()
})


export const DocumentKeySchema = z.string()

export type Document = z.infer<typeof DocumentSchema>;
