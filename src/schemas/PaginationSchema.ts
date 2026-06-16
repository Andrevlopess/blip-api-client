import { z } from "zod";

export const PaginationSchema = z.object({
	take: z.number().int().min(1).optional(),
	skip: z.number().optional()
});

export type Pagination = z.infer<typeof PaginationSchema>;
