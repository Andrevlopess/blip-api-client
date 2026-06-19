import z from "zod";

export const TransportConfigSchema = z.object({
	tenant: z.string().min(1, "Missing tentant slug"),
	apiKey: z.string().min(1, "Missing router/bot key"),
	maxConcurrentRequests: z.number().min(0).optional(),
});
