import { z } from "zod";

export const FlowIdSchema = z.string().trim().min(1);

export const FlowCategorySchema = z.enum([
	"SIGN_UP",
	"SIGN_IN",
	"APPOINTMENT_BOOKING",
	"LEAD_GENERATION",
	"SHOPPING",
	"CONTACT_US",
	"CUSTOMER_SUPPORT",
	"SURVEY",
	"OTHER",
]);

export const CreateFlowSchema = z.object({
	name: z.string().min(1),
	categories: z.array(FlowCategorySchema).min(1),
	endpointUri: z.url().optional()
});

export const UpdateFlowMetadataSchema = CreateFlowSchema.partial()

export const UploadPublicKeySchema = z.object({
	businessPublicKey: z.string().min(1),
});

export const FlowJsonSchema = z.object({
	screens: z.array(z.record(z.string(), z.unknown())).optional(),
	version: z.string().optional(),
})
.loose();

export type FlowCategory = z.infer<typeof FlowCategorySchema>;
export type CreateFlowInput = z.infer<typeof CreateFlowSchema>;
export type UpdateFlowMetadataInput = z.infer<typeof UpdateFlowMetadataSchema>;
export type UploadPublicKeyInput = z.infer<typeof UploadPublicKeySchema>;
export type FlowJsonInput = z.infer<typeof FlowJsonSchema>;

