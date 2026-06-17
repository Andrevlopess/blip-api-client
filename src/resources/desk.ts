import type { BlipTransport } from "../clients/BlipTransport.js";
import type { AttendantMetric, QueuesMetrics, TagsMetrics } from "../interfaces/Desk.js";
import type {
	AttendantStatusMetrics,
	OpenTicket,
	TicketMetrics,
	TicketMonitoringSummary,
	WaitingTicket,
} from "../interfaces/Ticket.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

interface Filters {
	teams?: string | string[];
	agentIdentities?: string | string[];
	customerIdentities?: string | string[];
}
interface GetTicketsFilters extends Filters {
	ticketSequentialId?: number | number[];
}

interface GetAllTicketsParams {
	pagination: Partial<Pagination>;
	filters: Partial<GetTicketsFilters>;
	calculateSla: boolean;
	refreshCache: boolean;
}
interface GetMetricsParams {
	pagination: Pagination;
	filters: Filters;
}

/**
 * Provides access to BLiP Desk monitoring and analytics operations.
 *
 * This resource allows retrieving ticket information,
 * operational metrics, attendant performance data,
 * queue metrics, and tag metrics.
 *
 * @category Resources
 */
export class DeskResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Retrieves all currently open tickets.
	 *
	 * Results can be filtered and paginated.
	 *
	 * @param params - Optional filtering, pagination,
	 * SLA calculation, and cache settings.
	 *
	 * @returns A list of open tickets.
	 *
	 * @example
	 * ```ts
	 * const tickets = await client.desk.getAllOpenTickets();
	 * ```
	 *
	 * @example
	 * ```ts
	 * const tickets = await client.desk.getAllOpenTickets({
	 *   pagination: {
	 *     skip: 0,
	 *     take: 100
	 *   },
	 *   filters: {
	 *     teams: ["Support"]
	 *   }
	 * });
	 * ```
	 *
	 * @group Tickets
	 */
	async getAllOpenTickets(params?: Partial<GetAllTicketsParams>): Promise<OpenTicket[]> {
		const { calculateSla = true, refreshCache = true, pagination, filters } = params ?? {};

		const searchParams: Record<string, unknown> = {
			version: "2",
			calculateSla: calculateSla,
			refreshCache: refreshCache,
			...filters,
		};

		if (pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<OpenTicket>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/open-tickets${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
	/**
	 * Retrieves all waiting tickets.
	 *
	 * Results can be filtered and paginated.
	 *
	 * @param params - Optional filtering, pagination,
	 * SLA calculation, and cache settings.
	 *
	 * @returns A list of waiting tickets.
	 *
	 * @example
	 * ```ts
	 * const tickets =
	 *   await client.desk.getAllWaitingTickets();
	 * ```
	 *
	 * @group Tickets
	 */

	async getAllWaitingTickets(params?: Partial<GetAllTicketsParams>): Promise<WaitingTicket[]> {
		const { calculateSla = true, refreshCache = true, pagination, filters } = params ?? {};

		const searchParams: Record<string, unknown> = {
			version: "2",
			calculateSla: calculateSla,
			refreshCache: refreshCache,
			...filters,
		};

		if (pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<WaitingTicket>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/waiting-tickets${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	/**
	 * Retrieves a summary of ticket monitoring statistics.
	 *
	 * Includes overall counts and operational indicators
	 * related to ticket activity.
	 *
	 * @returns Ticket monitoring summary data.
	 *
	 * @example
	 * ```ts
	 * const summary =
	 *   await client.desk.getTicketSummary();
	 * ```
	 *
	 * @group Metrics
	 */
	async getTicketSummary(): Promise<TicketMonitoringSummary> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",
		};

		const { resource } = await this.transport.sendCommand<TicketMonitoringSummary>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/tickets${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}
	/**
	 * Retrieves ticket performance metrics.
	 *
	 * @returns Ticket metrics.
	 *
	 * @example
	 * ```ts
	 * const metrics =
	 *   await client.desk.getTicketMetrics();
	 * ```
	 *
	 * @group Metrics
	 */

	async getTicketMetrics(): Promise<TicketMetrics> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",
		};

		const { resource } = await this.transport.sendCommand<TicketMetrics>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/ticket-metrics${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}

	/**
	 * Retrieves attendant status metrics.
	 *
	 * Includes information such as online, offline,
	 * and active attendant counts.
	 *
	 * @returns Attendant status metrics.
	 *
	 * @example
	 * ```ts
	 * const metrics =
	 *   await client.desk.getAttendantsStatusMetrics();
	 * ```
	 *
	 * @group Metrics
	 */
	async getAttendantsStatusMetrics(): Promise<AttendantStatusMetrics> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",
		};

		const { resource } = await this.transport.sendCommand<AttendantStatusMetrics>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/attendant-status-metrics${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}
	/**
	 * Retrieves attendant performance metrics.
	 *
	 * Results can be filtered and paginated.
	 *
	 * @param params - Optional filtering and pagination settings.
	 *
	 * @returns A list of attendant metrics.
	 *
	 * @example
	 * ```ts
	 * const attendants =
	 *   await client.desk.getAttendantsMetrics();
	 * ```
	 *
	 * @example
	 * ```ts
	 * const attendants =
	 *   await client.desk.getAttendantsMetrics({
	 *     filters: {
	 *       teams: ["Support"]
	 *     }
	 *   });
	 * ```
	 *
	 * @group Metrics
	 */
	async getAttendantsMetrics(params?: Partial<GetMetricsParams>): Promise<AttendantMetric[]> {
		const searchParams: Record<string, unknown> = {
			refreshCache: "true",
			version: "2",
			...params?.filters,
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<AttendantMetric>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/attendants${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
	/**
	 * Retrieves queue performance metrics.
	 *
	 * Results can be filtered and paginated.
	 *
	 * @param params - Optional filtering and pagination settings.
	 *
	 * @returns A list of queue metrics.
	 *
	 * @example
	 * ```ts
	 * const queues =
	 *   await client.desk.getQueuesMetrics();
	 * ```
	 *
	 * @group Metrics
	 */
	async getQueuesMetrics(params?: Partial<GetMetricsParams>): Promise<QueuesMetrics[]> {
		const searchParams: Record<string, unknown> = {
			refreshCache: "true",
			version: "2",
			...params?.filters,
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<QueuesMetrics>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/teams${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	/**
	 * Retrieves tag performance metrics.
	 *
	 * Results can be filtered and paginated.
	 *
	 * @param params - Optional filtering and pagination settings.
	 *
	 * @returns A list of tag metrics.
	 *
	 * @example
	 * ```ts
	 * const tags =
	 *   await client.desk.getTagsMetrics();
	 * ```
	 *
	 * @group Metrics
	 */
	async getTagsMetrics(params?: Partial<GetMetricsParams>): Promise<TagsMetrics[]> {
		const searchParams: Record<string, unknown> = {
			refreshCache: "true",
			version: "2",
			...params?.filters,
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<TagsMetrics>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/tags-metrics${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	// private buildFilters(filters?: Partial<GetTicketsFilters> | Partial<Filters>): Record<string, string> {
	// 	if (!filters) return {};

	// 	const result: Record<string, string> = {};

	// 	for (const [key, value] of Object.entries(filters)) {
	// 		if (value == null) continue;

	// 		result[key] = Array.isArray(value) ? value.join(",") : value;
	// 	}

	// 	return result;
	// }
}
