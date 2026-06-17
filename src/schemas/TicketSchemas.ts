import z from "zod";
import { PaginationSchema } from "./PaginationSchema.js";

export const TicketIdSchema = z.uuid();

export const CustomerIdentitySchema = z.string().min(1);

export const CloseTicketStatusSchema = z.enum(["ClosedAttendant", "ClosedClient"]);

export const CreateTicketSchema = z.object({
	customerIdentity: z.string().min(1),
	agentIdentity: z.string().min(1).optional(),
	team: z.string().optional(),
});

export const CreateAttendanceTicketSchema = z.object({
	customerIdentity: z.string().min(1),
	context: z.string().min(1),
});

export const TransferTicketSchema = z.object({
	agentIdentity: z.string().min(1).optional(),
	// ticketId: TicketIdSchema,
	team: z.string().min(1),
});

export const CloseTicketSchema = z.object({
	id: TicketIdSchema,
	status: CloseTicketStatusSchema,
	customerIdentity: z.string(),
	tags: z.array(z.string()).min(1).optional(),
	closedBy: z.string(),
});

export const AddTicketTagsSchema = z.object({
	ticketId: TicketIdSchema,
	tags: z.array(z.string()).min(1),
});

export const FinishTicketSchema = z.object({
	ticketId: TicketIdSchema,
	customerIdentity: z.string().min(1),
	ownerIdentity: z.string().min(1),
	tags: z.array(z.string()).default([]),
});

export const TicketHistoryParamsSchema = z.object({
	beginDate: z.string(),
	endDate: z.string(),
	includeIdentitiesNames: z.boolean().optional(),
	pagination: PaginationSchema.partial().optional(),
});

export const UserTicketHistorySchema = z.object({
	identity: z.string().min(1),
	pagination: PaginationSchema.partial().optional(),
});

export const TicketCommentSchema = z.object({
	authorEmail: z.string().min(1),
	content: z.string().min(1),
});

export const GetTicketsHistoryFiltersSchema = z.object({
	beginDate: z.iso.datetime({ offset: true }),
	endDate: z.iso.datetime({ offset: true }),

	agentIdentities: z.union([z.string(), z.array(z.string())]).optional(),
	tags: z.union([z.string(), z.array(z.string())]).optional(),
	teams: z.union([z.string(), z.array(z.string())]).optional(),
	customerIdentities: z.union([z.string(), z.array(z.string())]).optional(),
	ticketIds: z.union([z.number().positive(), z.array(z.number().positive())]).optional(),

	includeIdentitiesNames: z.coerce.boolean().optional(),
});

export type GetTicketsHistoryFilters = z.infer<typeof GetTicketsHistoryFiltersSchema>;

export type TicketCommentInput = z.infer<typeof TicketCommentSchema>;
export type TicketId = z.infer<typeof TicketIdSchema>;
export type CloseTicketStatus = z.infer<typeof CloseTicketStatusSchema>;

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type CreateAttendanceTicket = z.infer<typeof CreateAttendanceTicketSchema>;
export type TransferTicket = z.infer<typeof TransferTicketSchema>;
export type CloseTicketInput = z.infer<typeof CloseTicketSchema>;
export type AddTicketTags = z.infer<typeof AddTicketTagsSchema>;
export type FinishTicket = z.infer<typeof FinishTicketSchema>;
export type TicketHistoryParams = z.infer<typeof TicketHistoryParamsSchema>;
export type UserTicketHistory = z.infer<typeof UserTicketHistorySchema>;
