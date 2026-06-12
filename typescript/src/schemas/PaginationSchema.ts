import { z } from "zod";

export const PaginationSchema = z.object({
	take: z.number().min(1),
	skip: z.number().optional()
});

export type Pagination = z.infer<typeof PaginationSchema>;
