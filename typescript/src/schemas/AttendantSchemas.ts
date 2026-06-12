import z from "zod";

export const CreateOrUpdateAttendantSchema = z.object({
	email: z.email(),
	agentSlots: z.number().nullable().optional(),
	teams: z.array(z.string()).optional(),
});


export const AttendantEmailSchema = z.email();
export const AttendantQueuesSchema = z.array(z.string())

export const AttendantPermissionSchema = z.object({
	ownerIdentity: z.string(),
    name: z.string(),
    isActive: z.boolean(),
});

export type CreateOrUpdateAttendantData = z.infer<typeof CreateOrUpdateAttendantSchema>;
export type AttendantPermissionData = z.infer<typeof AttendantPermissionSchema>;