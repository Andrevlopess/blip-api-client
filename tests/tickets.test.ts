import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport.js";
import type { CreatedTicket, HistoryTicket, Ticket, TicketComment } from "../src/interfaces/Ticket.js";
import { TicketsResources } from "../src/resources/tickets.js";

describe("TicketsResources", () => {
	let transport: BlipTransport;
	let sendCommand: ReturnType<typeof vi.fn>;
	let buildSearchParams: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		sendCommand = vi.fn();
		buildSearchParams = vi.fn().mockReturnValue("");

		transport = {
			sendCommand,
			buildSearchParams,
		} as unknown as BlipTransport;
	});

	describe("create", () => {
		it("should create a ticket", async () => {
			const created: CreatedTicket = {
				id: crypto.randomUUID(),
				customerIdentity: "user@tunnel.msging.net",
				team: "Support",
			} as CreatedTicket;

			sendCommand.mockResolvedValue({ resource: created });

			const resource = new TicketsResources(transport);

			const result = await resource.create({
				customerIdentity: "user@tunnel.msging.net",
				team: "Support",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/tickets",
				type: "application/vnd.iris.ticket+json",
				resource: {
					customerIdentity: "user@tunnel.msging.net",
					team: "Support",
				},
			});

			expect(result).toEqual(created);
		});

		it("should throw when payload is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.create({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("findById", () => {
		it("should fetch a ticket by id", async () => {
			const uuid = crypto.randomUUID();
			const ticket = { id: uuid, status: "Open" } as unknown as Ticket;

			sendCommand.mockResolvedValue({ resource: ticket });

			const resource = new TicketsResources(transport);

			const result = await resource.findById(uuid);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: `/ticket/${uuid}`,
			});

			expect(result).toEqual(ticket);
		});

		it("should throw when ticket id is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.findById("" as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("transfer", () => {
		it("should transfer a ticket to another team", async () => {
			const uuid = crypto.randomUUID();
			const ticket = { id: uuid, team: "Financial" } as unknown as Ticket;

			sendCommand.mockResolvedValue({ resource: ticket });

			const resource = new TicketsResources(transport);

			const result = await resource.transfer(uuid, { team: "Financial" });

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: `/tickets/${uuid}/transfer`,
				type: "application/vnd.iris.ticket+json",
				resource: { team: "Financial" },
			});

			expect(result).toEqual(ticket);
		});

		it("should throw when ticket id is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.transfer("", { team: "Financial" })).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});

		it("should throw when transfer payload is invalid", async () => {
			const uuid = crypto.randomUUID();
			const resource = new TicketsResources(transport);

			await expect(resource.transfer(uuid, {} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("close", () => {
		it("should close a ticket", async () => {
			const uuid = crypto.randomUUID();
			const response = { status: "success" };

			sendCommand.mockResolvedValue(response);

			const resource = new TicketsResources(transport);

			const input = {
				id: uuid,
				status: "ClosedAttendant",
				customerIdentity: "customer@wa.gw.msging.net",
				closedBy: "agent@company.com",
			};

			const result = await resource.close(input as any);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/tickets/change-status",
				type: "application/vnd.iris.ticket+json",
				resource: input,
			});

			expect(result).toEqual(response);
		});

		it("should throw when close payload is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.close({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("setTags", () => {
		it("should set tags on a ticket", async () => {
			const uuid = crypto.randomUUID();
			const response = { status: "success" };

			sendCommand.mockResolvedValue(response);

			const resource = new TicketsResources(transport);

			const result = await resource.setTags(uuid, ["vip", "sales"]);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: `/tickets/${uuid}/change-tags`,
				type: "application/vnd.iris.ticket+json",
				resource: {
					id: uuid,
					tags: ["vip", "sales"],
				},
			});

			expect(result).toEqual(response);
		});

		it("should set an empty tags array", async () => {
			const uuid = crypto.randomUUID();

			sendCommand.mockResolvedValue({ status: "success" });

			const resource = new TicketsResources(transport);

			await resource.setTags(uuid, []);

			expect(sendCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					resource: { id: uuid, tags: [] },
				}),
			);
		});

		it("should throw when ticket id is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.setTags("", ["vip"])).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getHistory", () => {
		it("should fetch ticket history without pagination", async () => {
			const items: HistoryTicket[] = [
				{ id: "1", status: "Closed" } as unknown as HistoryTicket,
				{ id: "2", status: "Closed" } as unknown as HistoryTicket,
			];

			sendCommand.mockResolvedValue({ resource: { items } });
			buildSearchParams.mockReturnValue("?status=Closed&includeIdentitiesNames=true");

			const filters = { beginDate: new Date().toISOString(), endDate: new Date().toISOString() };
			const resource = new TicketsResources(transport);

			const result = await resource.getHistory({
				filters,
			});

			expect(buildSearchParams).toHaveBeenCalledWith(
				expect.objectContaining({
					includeIdentitiesNames: true,
					...filters,
				}),
			);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/tickets/history/v2?status=Closed&includeIdentitiesNames=true",
			});

			expect(result).toEqual(items);
		});

		it("should apply pagination parameters", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });
			buildSearchParams.mockReturnValue("?$skip=10&$take=20");

			const resource = new TicketsResources(transport);

			await resource.getHistory({
				filters: { beginDate: new Date().toISOString(), endDate: new Date().toISOString() },
				pagination: { skip: 10, take: 20 },
			});

			expect(buildSearchParams).toHaveBeenCalledWith(
				expect.objectContaining({
					$skip: 10,
					$take: 20,
				}),
			);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/tickets/history/v2?$skip=10&$take=20",
			});
		});

		it("should use default pagination values", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TicketsResources(transport);

			await resource.getHistory({
				filters: { beginDate: new Date().toISOString(), endDate: new Date().toISOString() },
				pagination: {},
			});

			expect(buildSearchParams).toHaveBeenCalledWith(
				expect.objectContaining({
					$skip: 0,
					$take: 50,
				}),
			);
		});

		it("should throw when filters are invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.getHistory({ filters: null as any })).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("comment", () => {
		it("should add a comment to a ticket", async () => {
			const uuid = crypto.randomUUID();
			const ticketComment: TicketComment = {
				id: crypto.randomUUID(),
				content: "Customer confirmed the issue.",
			} as TicketComment;

			sendCommand.mockResolvedValue({ resource: ticketComment });

			const resource = new TicketsResources(transport);

			const result = await resource.comment(uuid, {
				content: "Customer confirmed the issue.",
				authorEmail: "agent@company.com",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: `/tickets/${uuid}/change-tags`,
				type: "application/vnd.iris.ticket+json",
				resource: {
					content: "Customer confirmed the issue.",
					authorIdentity: `${encodeURIComponent("agent@company.com")}@blip.ai`,
				},
			});

			expect(result).toEqual(ticketComment);
		});

		it("should throw when ticket id is invalid", async () => {
			const resource = new TicketsResources(transport);

			await expect(resource.comment("", { content: "Test", authorEmail: "agent@company.com" })).rejects.toBeInstanceOf(
				ZodError,
			);

			expect(sendCommand).not.toHaveBeenCalled();
		});

		it("should throw when comment payload is invalid", async () => {
			const uuid = crypto.randomUUID();
			const resource = new TicketsResources(transport);

			await expect(resource.comment(uuid, {} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getContactComments", () => {
		it("should fetch all comments for a contact", async () => {
			const comments: TicketComment[] = [
				{ id: "1", content: "First comment" } as unknown as TicketComment,
				{ id: "2", content: "Second comment" } as unknown as TicketComment,
			];

			sendCommand.mockResolvedValue({ resource: { items: comments } });

			const resource = new TicketsResources(transport);

			const result = await resource.getContactComments("user@wa.gw.msging.net");

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@crm.msging.net",
				uri: "contacts/user@wa.gw.msging.net/comments",
			});

			expect(result).toEqual(comments);
		});
	});
});
