import type { BlipTransport } from "../clients/BlipTransport.js";
import type { AttendantMetric, AttendantStatus, QueuesMetrics, TagsMetrics } from "../interfaces/Desk.js";
import type {
	AttendantStatusMetrics,
	OpenTicket,
	TicketMetrics,
	TicketMonitoringSummary,
	WaitingTicket
} from "../interfaces/Ticket.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

interface Filters {
	teams: string | string[];
	agentIdentities: string | string[];
	customerIdentities: string | string[];
}
interface GetTicketsFilters extends Filters {
	ticketSequentialId: number;
}

interface FindAllTicketsParams {
	pagination: Partial<Pagination>;
	filters: Partial<GetTicketsFilters>;
	calculateSla: boolean;
	refreshCache: boolean;
}

export class DeskResources {
	constructor(private readonly transport: BlipTransport) {}

	async getAllOpenTickets(params?: Partial<FindAllTicketsParams>): Promise<OpenTicket[]> {
		const { calculateSla = true, refreshCache = true, pagination, filters } = params ?? {};

		const searchParams: Record<string, string> = {
			version: "2",
			calculateSla: String(calculateSla),
			refreshCache: String(refreshCache),
			...this.buildFilters(filters),
		};

		if (pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<OpenTicket>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/open-tickets${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	async getAllWaitingTickets(params?: Partial<FindAllTicketsParams>): Promise<WaitingTicket[]> {
		const { calculateSla = true, refreshCache = true, pagination, filters } = params ?? {};

		const searchParams: Record<string, string> = {
			version: "2",
			calculateSla: String(calculateSla),
			refreshCache: String(refreshCache),
			...this.buildFilters(filters),
		};

		if (pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<WaitingTicket>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/waiting-tickets${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

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

	async getAttendantsMetrics(params?: { pagination: Pagination; filters: Filters }): Promise<AttendantMetric[]> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",
			...this.buildFilters(params?.filters),
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<AttendantMetric>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/attendants${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	async getQueuesMetrics(params?: { pagination: Pagination; filters: Filters }): Promise<QueuesMetrics[]> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",
			...this.buildFilters(params?.filters),
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<QueuesMetrics>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/teams${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
	async getTagsMetrics(params?: { pagination: Pagination; filters: Filters }): Promise<TagsMetrics[]> {
		const searchParams: Record<string, string> = {
			refreshCache: "true",
			version: "2",

			...this.buildFilters(params?.filters),
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params?.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<TagsMetrics>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/monitoring/tags-metrics${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	private buildFilters(filters?: Partial<GetTicketsFilters> | Partial<Filters>): Record<string, string> {
		if (!filters) return {};

		const result: Record<string, string> = {};

		for (const [key, value] of Object.entries(filters)) {
			if (value == null) continue;

			result[key] = Array.isArray(value) ? value.join(",") : String(value);
		}

		return result;
	}

	// async findHistory(params) {
	// 	const parsed = TicketHistoryParamsSchema.parse(params);

	// 	const { beginDate, endDate, includeIdentitiesNames = false, pagination } = parsed;

	// 	const { skip = 0, take = 20 } = pagination ?? {};

	// 	const searchParams = new URLSearchParams({
	// 		$skip: String(skip),
	// 		$take: String(take),
	// 		beginDate,
	// 		endDate,
	// 		includeIdentitiesNames: String(includeIdentitiesNames),
	// 	});

	// 	const { resource } = await this.transport.sendCommand({
	// 		method: "get",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/history/v2?${searchParams.toString()}`,
	// 	});

	// 	return resource;
	// }

	// async findUserHistory(params) {
	// 	const parsed = UserTicketHistorySchema.parse(params);

	// 	const { skip = 0, take = 20 } = parsed.pagination ?? {};

	// 	const { resource } = await this.transport.sendCommand({
	// 		method: "get",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/history-merged/${encodeURIComponent(parsed.identity)}?$skip=${skip}&$take=${take}`,
	// 	});

	// 	return resource;
	// }

	// async findMessages(ticketId) {
	// 	const id = TicketIdSchema.parse(ticketId);

	// 	const { resource } = await this.transport.sendCommand({
	// 		method: "get",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/${id}/messages`,
	// 	});

	// 	return resource;
	// }

	// async transfer(data) {
	// 	const parsed = TransferTicketSchema.parse(data);

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/${parsed.ticketId}/transfer`,
	// 		type: "application/vnd.iris.ticket+json",
	// 		resource: {
	// 			team: parsed.team,
	// 		},
	// 	});
	// }

	// async closeAsAttendant(ticketId, agentIdentity) {
	// 	const parsed = ChangeTicketStatusSchema.parse({
	// 		id: ticketId,
	// 		status: "ClosedAttendant",
	// 		agentIdentity,
	// 	});

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: "/tickets/change-status",
	// 		type: "application/vnd.iris.ticket+json",
	// 		resource: parsed,
	// 	});
	// }

	// async closeAsCustomer(ticketId) {
	// 	const parsed = ChangeTicketStatusSchema.parse({
	// 		id: ticketId,
	// 		status: "ClosedClient",
	// 	});

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: "/tickets/change-status",
	// 		type: "application/vnd.iris.ticket+json",
	// 		resource: parsed,
	// 	});
	// }

	// async changeStatus(data) {
	// 	const parsed = ChangeTicketStatusSchema.parse(data);

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: "/tickets/change-status",
	// 		type: "application/vnd.iris.ticket+json",
	// 		resource: parsed,
	// 	});
	// }

	// async addTags(data) {
	// 	const parsed = AddTicketTagsSchema.parse(data);

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/${parsed.ticketId}/change-tags`,
	// 		type: "application/vnd.iris.ticket+json",
	// 		resource: {
	// 			tags: parsed.tags,
	// 		},
	// 	});
	// }

	// async finish(data) {
	// 	const parsed = FinishTicketSchema.parse(data);

	// 	return await this.transport.sendCommand({
	// 		method: "set",
	// 		to: "postmaster@desk.msging.net",
	// 		uri: `/tickets/${parsed.ticketId}/close`,
	// 		resource: {
	// 			id: parsed.ticketId,
	// 			customerIdentity: parsed.customerIdentity,
	// 			ownerIdentity: parsed.ownerIdentity,
	// 			status: "ClosedClient",
	// 			tags: parsed.tags,
	// 		},
	// 	});
	// }
}
