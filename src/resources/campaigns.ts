import z from "zod";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type {
	Campaign,
	CampaignAudience,
	CampaignMessage,
	CampaignReport,
	CampaignSummary,
} from "../interfaces/Campaigns.js";
import { CampaignRequestSchema, type CampaignRequestInput } from "../schemas/CampaignSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

export interface GetSummariesParams {
	pagination: Partial<Pagination>;
	created: string;
	CampaignSender: string;
}
export interface GetReportParams {
	shouldHaveStateName?: boolean;
}

/**
 * Provides access to Blip Active Campaign operations.
 * Access via {@link BlipClient.campaigns} — do not instantiate directly.
 *
 * Supports campaign creation, listing, reporting, audience tracking,
 * message retrieval, and campaign deletion.
 *
 * @hideconstructor
 */
export class CampaignResources {
	constructor(private readonly transport: BlipTransport) {}
	/**
	 * Creates a new campaign.
	 *
	 * To schedule a campaign, use `campaign.scheduled` as date to dispatch the campaign.
	 *
	 * @param input - Campaign configuration and audience data.
	 * @returns The created campaign.
	 */
	async create(input: CampaignRequestInput): Promise<Campaign> {
		const parsed = CampaignRequestSchema.parse(input);

		const { resource } = await this.transport.sendCommand<Campaign>({
			to: "postmaster@activecampaign.msging.net",
			method: "set",
			uri: "/campaign/full",
			type: "application/vnd.iris.activecampaign.full-campaign+json",
			resource: parsed,
		});

		return resource;
	}

	/**
	 * Retrieves a campaign by its identifier.
	 *
	 * @param campaignId - The campaign UUID.
	 * @returns The campaign details.
	 */
	async getById(campaignId: string): Promise<Campaign> {
		const id = z.uuid().parse(campaignId);

		const { resource } = await this.transport.sendCommand<Campaign>({
			to: "postmaster@activecampaign.msging.net",
			method: "get",
			uri: `/campaigns/${id}`,
		});

		return resource;
	}
	/**
	 * Lists campaigns.
	 *
	 * @param params - Optional pagination settings.
	 * @returns A collection of campaigns.
	 */
	async getAll(params?: { pagination: Partial<Pagination> }): Promise<Campaign[]> {
		const searchParams: Record<string, unknown> = {};

		if (params?.pagination) {
			const { skip = 0, take = 20 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<Campaign>>({
			to: "postmaster@activecampaign.msging.net",
			method: "get",
			uri: `/campaigns${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
	/**
	 * Lists campaign summaries.
	 *
	 * @param params - Optional filters and pagination settings.
	 * @returns A collection of campaign summaries.
	 */
	async getAllSummaries(params?: Partial<GetSummariesParams>): Promise<CampaignSummary[]> {
		const searchParams: Record<string, unknown> = {
			...params,
		};

		if (params?.pagination) {
			const { skip = 0, take = 20 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<CampaignSummary>>({
			method: "get",
			to: "postmaster@activecampaign.msging.net",
			uri: `/campaigns/summaries${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	/**
	 * Retrieves summary information for a specific campaign.
	 *
	 * @param campaignId - The campaign UUID.
	 * @returns Campaign summary records.
	 */
	async getSummary(campaignId: string): Promise<CampaignSummary[]> {
		const id = z.uuid().parse(campaignId);

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<CampaignSummary>>({
			method: "get",
			to: "postmaster@activecampaign.msging.net",
			uri: `/campaigns/${id}/summaries`,
		});

		return resource.items;
	}

	/**
	 * Retrieves all audience entries associated with a campaign.
	 *
	 * @param campaignId - The campaign UUID.
	 * @returns Campaign audience records.
	 */
	async getAudience(campaignId: string): Promise<CampaignAudience[]> {
		const id = z.uuid().parse(campaignId);

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<CampaignAudience>>({
			method: "get",
			to: "postmaster@activecampaign.msging.net",
			uri: `/audiences/${id}`,
		});

		return resource.items;
	}
	/**
	 * Retrieves a campaign report with delivery and status information.
	 *
	 * @param campaignId - The campaign UUID.
	 * @param params - Optional report configuration.
	 * @returns The campaign report.
	 */
	async getReport(campaignId: string, params?: GetReportParams): Promise<CampaignReport> {
		const id = z.uuid().parse(campaignId);

		const searchParams: Record<string, unknown> = {
			shouldHaveStateName: params?.shouldHaveStateName ?? true,
		};

		const { resource } = await this.transport.sendCommand<CampaignReport>({
			method: "get",
			to: "postmaster@activecampaign.msging.net",
			uri: `/campaigns/${id}/reports${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}

	/**
	 * Retrieves all campaign message records.
	 *
	 * @param campaignId - The campaign UUID.
	 * @returns Campaign message records.
	 */
	async getCampaignMessages(campaignId: string): Promise<CampaignMessage[]> {
		const id = z.uuid().parse(campaignId);

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<CampaignMessage>>({
			method: "get",
			to: "postmaster@activecampaign.msging.net",
			uri: `/messages/${id}`,
		});

		return resource.items;
	}
	/**
	 * Deletes a campaign.
	 *
	 * @param campaignId - The campaign UUID.
	 * @returns The Blip operation result.
	 */
	async delete(campaignId: string): Promise<IBlipSuccessfulResponse> {
		const id = z.uuid().parse(campaignId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@activecampaign.msging.net",
			uri: `/campaigns/${id}`,
		});
	}
}
