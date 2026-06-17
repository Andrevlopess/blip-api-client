import z from "zod";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { CreatedTicket, HistoryTicket, Ticket, TicketComment } from "../interfaces/Ticket.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import {
	CloseTicketSchema,
	CreateTicketSchema,
	GetTicketsHistoryFiltersSchema,
	TicketCommentSchema,
	TicketIdSchema,
	TransferTicketSchema,
	type CloseTicketInput,
	type CreateTicketInput,
	type GetTicketsHistoryFilters,
	type TicketCommentInput,
	type TransferTicket,
} from "../schemas/TicketSchemas.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

export interface GetHistoryParams {
	filters: GetTicketsHistoryFilters;
	pagination?: Pagination;
}

/**
 * Provides access to the Blip Ticket Resources
 * Access via {@link BlipClient.tickets} — do not instantiate directly.
 *
 * @category Resources
 */
export class TicketsResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Creates a new ticket for a given contact.
	 *
	 * @param input Ticket creation payload.
	 *
	 * @returns The created ticket information.
	 *
	 * @throws ZodError When the input is invalid.
	 *
	 * @example
	 * const ticket = await client.tickets.create({
	 *   ownerIdentity: "<uuid>@tunnel.msging.net",
	 *   team: "Support"
	 * });
	 */
	async create(input: CreateTicketInput) {
		const parsed = CreateTicketSchema.parse(input);

		const { resource } = await this.transport.sendCommand<CreatedTicket>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: "/tickets",
			type: "application/vnd.iris.ticket+json",
			resource: parsed,
		});

		return resource;
	}

	/**
	 * Retrieves a ticket by its uuid identifier.
	 *
	 * @param ticketId Ticket uuid identifier.
	 *
	 * @returns Ticket details.
	 *
	 * @throws ZodError When the ticket ID is invalid.
	 *
	 * @example
	 * const ticket = await client.tickets.findById(
	 *   "0e1e13f9-28b5-4760-8266-f13d2f80c4b6"
	 * );
	 */
	async findById(ticketId: string): Promise<Ticket> {
		const id = TicketIdSchema.parse(ticketId);

		const { resource } = await this.transport.sendCommand<Ticket>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/ticket/${id}`,
		});

		return resource;
	}

	/**
	 * Transfers a ticket to another queue or agent.
	 *
	 * @param ticketId Ticket uuid identifier.
	 * @param input Transfer configuration.
	 *
	 * @returns Updated ticket information.
	 *
	 * @example
	 * await client.tickets.transfer(ticketId, {
	 *   team: "Financial"
	 * });
	 */
	async transfer(ticketId: string, input: TransferTicket): Promise<Ticket> {
		const id = TicketIdSchema.parse(ticketId);
		const data = TransferTicketSchema.parse(input);

		const { resource } = await this.transport.sendCommand<Ticket>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/tickets/${id}/transfer`,
			type: "application/vnd.iris.ticket+json",
			resource: data,
		});

		return resource;
	}

	/**
	 * Close a ticket.
	 *
	 * @param input Close ticket payload.
	 *
	 * @returns Command execution result.
	 *
	 * @example
	 * await client.tickets.close({
	 *  id: TicketId,
	 *  status: CloseTicketStatus,
	 *  customerIdentity: string
	 *  tags?: string[]
	 *  closedBy: string
	 * });
	 */
	async close(input: CloseTicketInput): Promise<IBlipSuccessfulResponse> {
		const data = CloseTicketSchema.parse(input);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/tickets/change-status`,
			type: "application/vnd.iris.ticket+json",
			resource: data,
		});
	}

	/**
	 * Replaces all tags associated with a ticket.
	 *
	 * @param ticketId Ticket identifier.
	 * @param tags List of tags.
	 *
	 * @returns Command execution result.
	 *
	 * @example
	 * await client.tickets.setTags(ticketId, [
	 *   "vip",
	 *   "sales"
	 * ]);
	 */
	async setTags(ticketId: string, tags: string[]): Promise<IBlipSuccessfulResponse> {
		const id = TicketIdSchema.parse(ticketId);

		const parsed = z.array(z.string()).parse(tags);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/tickets/${id}/change-tags`,
			type: "application/vnd.iris.ticket+json",
			resource: {
				id,
				tags: parsed,
			},
		});
	}

	/**
	 * Retrieves ticket history records.
	 *
	 * Supports filtering and pagination.
	 *
	 * @param params Query parameters.
	 *
	 * @returns Matching history entries.
	 *
	 * @example
	 * const history = await client.tickets.getHistory({
	 *   filters: {
	 *     status: "Closed"
	 *   },
	 *   pagination: {
	 *     take: 20
	 *   }
	 * });
	 */
	async getHistory(params: GetHistoryParams): Promise<HistoryTicket[]> {
		const { includeIdentitiesNames = true, ...rest } = GetTicketsHistoryFiltersSchema.parse(params.filters);

		const searchParams: Record<string, unknown> = {
			includeIdentitiesNames,
			...rest,
		};

		if (params?.pagination) {
			const { skip = 0, take = 50 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = skip;
			searchParams.$take = take;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<HistoryTicket>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/tickets/history/v2${this.transport.buildSearchParams(searchParams)}`,
		});
		return resource.items;
	}

	/**
	 * Adds a comment to a ticket.
	 *
	 * @param ticketId Ticket identifier.
	 * @param comment Comment content and author information.
	 *
	 * @returns Created comment.
	 *
	 * @example
	 * await client.tickets.comment(ticketId, {
	 *   content: "Customer confirmed the issue.",
	 *   authorEmail: "agent@company.com"
	 * });
	 */
	async comment(ticketId: string, comment: TicketCommentInput): Promise<TicketComment> {
		const id = TicketIdSchema.parse(ticketId);
		const parsed = TicketCommentSchema.parse(comment);

		const { resource } = await this.transport.sendCommand<TicketComment>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/tickets/${id}/change-tags`,
			type: "application/vnd.iris.ticket+json",
			resource: {
				content: parsed.content,
				authorIdentity: `${encodeURIComponent(parsed.authorEmail)}@blip.ai`,
			},
		});

		return resource;
	}

	/**
	 * Retrieves all comments associated with a contact.
	 *
	 * @param contactIdentity Contact identity.
	 *
	 * @returns Contact comments.
	 *
	 * @example
	 * const comments = await client.tickets.getContactComments(
	 *   "user@wa.gw.msging.net"
	 * );
	 */
	async getContactComments(contactIdentity: string): Promise<TicketComment[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<TicketComment>>({
			method: "get",
			to: "postmaster@crm.msging.net",
			uri: `contacts/${contactIdentity}/comments`,
		});

		return resource.items;
	}
}
