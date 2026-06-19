export interface Campaign {
	id: string;
	name: string;
	campaignType: "INDIVIDUAL" | "BATCH";
	masterState: string;
	flowId: string;
	stateId: string;
	status: string;
	created: string;
	scheduled?: string;
	tags: string[];
	isToUseLiteApi: boolean;
	channelType: "WHATSAPP";
	canSendWithOpenTicket: boolean;
}
export interface Campaign {
	id: string;
	name: string;
	campaignType: "INDIVIDUAL" | "BATCH";
	masterState: string;
	flowId: string;
	stateId: string;
	status: string;
	created: string;
	tags: string[];
	isToUseLiteApi: boolean;
	channelType: "WHATSAPP";
	canSendWithOpenTicket: boolean;
}

export interface CampaignAudienceStatus {
	RecipientIdentity: string;
	Status: string;
	ReasonCode?: number;
	ReasonDescription?: string;
}

export interface CampaignSummary {
	id: string;
	name: string;
	messageTemplate: string;
	flowId: string;
	stateId: string;
	sendDate: string; // ISO date string
	statusAudience: CampaignAudienceStatus[];
}

export interface CampaignAudience {
	OwnerIdentity: string;
	CampaignId: string;
	recipient: string;
	recipientType: string;
	channelType: "WHATSAPP";
	messageParams: Record<string, string>;
	status: string;
	validatedAccount?: string;
	processed?: string; // ISO date string
	received?: string; // ISO date string
	read?: string; // ISO date string
}
export interface CampaignMessage {
	channelType: string;
	messageTemplate: string;
	messageTemplateLanguage: string;
}

export type AudienceStatus = "PROCESSED" | "FAILED" | "SENT" | "DELIVERED" | "READ";

export type NumberStatus = "VALID" | "INVALID";

export interface CampaignReport extends CampaignSummary {
	stateName?: string;
}
