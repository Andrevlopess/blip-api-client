import z from "zod";

export const CreateQueueSchema = z.object({
	Priority: z.number().min(0).optional(),
	ownerIdentity: z.string().min(1),
	name: z.string().min(1),
	isActive: z.boolean().optional()
});

export const UpdateQueueSchema = z.object({
	Priority: z.number().min(0).optional(),
	id: z.uuid(),
	ownerIdentity: z.string().min(1),
	name: z.string().min(1),
	isActive: z.boolean().optional(),
	storageDate: z.iso.datetime().optional(),
	numberAttendants: z.number().optional()
});


const RelationSchema = z.enum(["Contains", "NotContains", "Equals", "NotEquals"]);

const BaseConditionSchema = z.object({
	// id: z.uuid(),
	relation: RelationSchema,
	values: z.array(z.string()).min(1),
});

const MessageConditionSchema = BaseConditionSchema.extend({
	property: z.literal("Message"),
});

const ContactNameConditionSchema = BaseConditionSchema.extend({
	property: z.literal("Contact.Name"),
});

const ContactEmailConditionSchema = BaseConditionSchema.extend({
	property: z.literal("Contact.Email"),
});

const ContactExtrasConditionSchema = BaseConditionSchema.extend({
	property: z.string().startsWith("Contact.Extras."),
	extrasProperty: z.string(),
});

const ConditionSchema = z.union([
	MessageConditionSchema,
	ContactNameConditionSchema,
	ContactEmailConditionSchema,
	ContactExtrasConditionSchema,
]);

export const RoutingRuleSchema = z.object({
	id: z.uuid().optional(),
	title: z.string(),
	team: z.string(),
	relation: RelationSchema,
	isActive: z.boolean(),
	conditions: z.array(ConditionSchema),
	operator: z.enum(["And", "Or"]),
	priority: z.number().int().optional(),
	queueId: z.uuid(),
});

export type RoutingRuleInput = z.infer<typeof RoutingRuleSchema>;

export const QueueIdSchema = z.uuid();

export type CreateQueueInput = z.infer<typeof CreateQueueSchema>;
export type UpdateQueueInput = z.infer<typeof UpdateQueueSchema>;