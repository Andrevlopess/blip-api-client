import type { BlipTransport } from "../clients/BlipTransport.js";
import type { CreatedTicket, Ticket } from "../interfaces/Ticket.js";
import {
	CloseTicketSchema,
	CreateTicketSchema,
	TicketIdSchema,
	TransferTicketSchema,
	type CloseTicketInput,
	type CreateTicketInput,
	type TransferTicket,
} from "../schemas/TicketSchemas.js";
import type { IBlipSuccessfulResponse } from "../types/BlipCommands.js";

export class TicketsResources {
	constructor(private readonly transport: BlipTransport) {}

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

	async findById(ticketId: string): Promise<Ticket> {
		const id = TicketIdSchema.parse(ticketId);

		const { resource } = await this.transport.sendCommand<Ticket>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/ticket/${id}`,
		});

		return resource;
	}

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
}
