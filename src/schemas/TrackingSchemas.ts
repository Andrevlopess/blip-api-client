import z from "zod";
import { ContactIdentitySchema } from "./ContactSchemas.js";



export const CreateTrackingSchema = z.object({
	category: z.string().min(1),
	action: z.string().min(1),
	contact: z.object({
		identity: ContactIdentitySchema
	}).optional()
});

export const EventCountersFiltersSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

// Response schema
const EventCounterSchema = z.object({
  storageDate: z.string(),
  category: z.string(),
  action: z.string(),
  count: z.string(),
});

export type EventCountersFilters = z.infer<typeof EventCountersFiltersSchema>;
export type EventCounter = z.infer<typeof EventCounterSchema>;
export type CreateTrackingInput = z.infer<typeof CreateTrackingSchema>;
