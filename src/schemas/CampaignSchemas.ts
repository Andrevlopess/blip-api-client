import { z } from "zod";

const MessageSchema = z.object({
	messageTemplate: z.string().min(1),
	channelType: z.literal("WhatsApp"),
	messageParams: z.array(z.string()).optional(),
});

const BatchSchema = z.object({
	campaign: z.object({
		campaignType: z.literal("Batch"),
		name: z.string(),
		flowId: z.uuid(),
		stateId: z.uuid(),
		masterstate: z.string(),
		channelType: z.literal("WhatsApp"),
		scheduled: z.iso.datetime().optional(),
	}),

	audiences: z
		.array(
			z.object({
				recipient: z.string(),
				messageParams: z.record(z.string(), z.string()),
			}),
		)
		.min(1),

	message: MessageSchema,
});

const IndividualSchema = z.object({
	campaign: z.object({
		campaignType: z.literal("Individual"),
		name: z.string(),
		flowId: z.uuid(),
		stateId: z.uuid(),
		masterstate: z.string(),
		channelType: z.literal("WhatsApp"),
		scheduled: z.iso.datetime().optional(),
	}),

	audience: z.object({
		recipient: z.string(),
		messageParams: z.record(z.string(), z.string()).optional(),
	}),

	message: MessageSchema,
});

export const CampaignRequestSchema = z.union([BatchSchema, IndividualSchema]);

export type CampaignRequestInput = z.infer<typeof CampaignRequestSchema>;