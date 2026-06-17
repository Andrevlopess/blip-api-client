import type { BlipTransport } from "../clients/BlipTransport.js";
import { type Pagination } from "../schemas/PaginationSchema.js";
import { CreateTrackingSchema, EventCountersFiltersSchema, type CreateTrackingInput, type EventCounter, type EventCountersFilters } from "../schemas/TrackingSchemas.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

export interface GetEventCountersParams {
	filters: EventCountersFilters;
	pagination?: Pagination;
}

/**
 * Provides access to the Trackings Resources.
 * Access via {@link BlipClient.trackings} — do not instantiate directly.
 *
 * @category Resources
 */
export class TrackingResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Creates a new event tracking entry.
	 *
	 * @param input - The tracking data to be created.
	 * @returns A promise that resolves to the command response status.
	 *
	 * @example
	 * ```typescript
	 * await client.trackings.create({
	 *   category: "payments",
	 *   action: "success-order",
	 * });
	 * ```
	 */
	async create(input: CreateTrackingInput): Promise<IBlipSuccessfulResponse> {
		const parsed = CreateTrackingSchema.parse(input);

		const { resource } = await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "set",
			to: "postmaster@analytics.msging.net",
			type: "application/vnd.iris.eventTrack+json",
			uri: "/event-track",
			resource: parsed,
		});

		return resource;
	}

	/**
	 * Retrieves all available tracking categories.
	 *
	 * @returns A promise that resolves to an array of category objects.
	 *
	 * @example
	 * ```typescript
	 * const categories = await client.trackings.getCategories();
	 * // => [{ category: "payments" }, { category: "orders" }]
	 * ```
	 */
	async getCategories(): Promise<{ category: string }[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<{ category: string }>>({
			method: "get",
			to: "postmaster@analytics.msging.net",
			uri: `/event-track`,
		});

		return resource.items;
	}

	/**
	 * Retrieves event counters aggregated by action for a given category.
	 *
	 * @param category - The tracking category name to query (e.g. `"payments"`).
	 * @param params - Query parameters including date filters and optional pagination.
	 * @param params.filters - Required date range filters (`startDate` and `endDate`).
	 * @param params.pagination - Optional pagination controls (`skip` and `take`). Defaults to `skip=0, take=100`.
	 * @returns A promise that resolves to an array of {@link EventCounter} objects.
	 *
	 * @example
	 * ```typescript
	 * const counters = await client.trackings.getCategoryCounters("payments", {
	 *   filters: { startDate: "2024-01-01", endDate: "2024-01-31" },
	 *   pagination: { skip: 0, take: 50 },
	 * });
	 * // => [{ category: "payments", action: "success-order", count: "4", storageDate: "..." }]
	 * ```
	 */
	async getCategoryCounters(category: string, params: GetEventCountersParams): Promise<EventCounter[]> {
		const parsed = EventCountersFiltersSchema.parse(params.filters);

		const searchParams: Record<string, unknown> = { ...parsed };

		if (params?.pagination) {
			const { skip = 0, take = 100 } = params.pagination;

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<EventCounter>>({
			method: "get",
			to: "postmaster@analytics.msging.net",
			uri: `/event-track/${encodeURIComponent(category)}${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
	
	/**
	 * Retrieves detailed event tracking entries for a specific category and action pair.
	 *
	 * @param category - The tracking category name (e.g. `"payments"`).
	 * @param action - The tracking action name (e.g. `"success-order"`).
	 * @param params - Query parameters including date filters and optional pagination.
	 * @param params.filters - Required date range filters (`startDate` and `endDate`).
	 * @param params.pagination - Optional pagination controls (`skip` and `take`). Defaults to `skip=0, take=100`.
	 * @returns A promise that resolves to an array of {@link EventCounter} objects.
	 *
	 * @example
	 * ```typescript
	 * const details = await client.trackings.getEventDetails("payments", "success-order", {
	 *   filters: { startDate: "2024-01-01", endDate: "2024-01-31" },
	 * });
	 * // => [{ category: "payments", action: "success-order", count: "4", storageDate: "..." }]
	 * ```
	 */
	async getEventDetails(category: string, action: string, params: GetEventCountersParams): Promise<EventCounter[]> {
		const parsed = EventCountersFiltersSchema.parse(params.filters);

		const searchParams: Record<string, unknown> = { ...parsed };

		if (params?.pagination) {
			const { skip = 0, take = 100 } = params.pagination;

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<EventCounter>>({
			method: "get",
			to: "postmaster@analytics.msging.net",
			uri: `/event-track/${encodeURIComponent(category)}/${encodeURIComponent(action)}${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
}
