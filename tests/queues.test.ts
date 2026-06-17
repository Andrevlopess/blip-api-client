import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport.js";
import { Queue } from "../src/interfaces/Queue.js";
import { QueuesResources } from "../src/resources/queues/queues.js";
import { type CreateQueueInput } from "../src/types/index.js";
import { UpdateQueueInput } from "../src/schemas/QueueSchemas.js";

describe("QueuesResources", () => {
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

	describe("getAll", () => {
		it("should fetch all queues without pagination", async () => {
			const queues: Queue[] = [{ uniqueId: "1", name: "Support" } as Queue, { uniqueId: "2", name: "Sales" } as Queue];

			sendCommand.mockResolvedValue({
				resource: {
					items: queues,
				},
			});

			const resource = new QueuesResources(transport);

			const result = await resource.getAll();

			expect(buildSearchParams).toHaveBeenCalledWith({
				ascending: "true",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/attendance-queues",
			});

			expect(result).toEqual(queues);
		});

		it("should apply pagination parameters", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			buildSearchParams.mockReturnValue("?$skip=10&$take=20");

			const resource = new QueuesResources(transport);

			await resource.getAll({
				pagination: {
					skip: 10,
					take: 20,
				},
			});

			expect(buildSearchParams).toHaveBeenCalledWith({
				ascending: "true",
				$skip: "10",
				$take: "20",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/attendance-queues?$skip=10&$take=20",
			});
		});

		it("should use default pagination values", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			const resource = new QueuesResources(transport);

			await resource.getAll({
				pagination: {},
			});

			expect(buildSearchParams).toHaveBeenCalledWith({
				ascending: "true",
				$skip: "0",
				$take: "9999",
			});
		});
	});

	describe("set", () => {
		it("should create a queue", async () => {
			const queue: CreateQueueInput = {
				name: "Support",
				ownerIdentity: "teste@msging.net",
			};

			sendCommand.mockResolvedValue({
				resource: queue,
			});

			const resource = new QueuesResources(transport);

			const result = await resource.set({
				name: "Support",
				ownerIdentity: "teste@msging.net",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/attendance-queues",
				type: "application/vnd.iris.desk.attendancequeue+json",
				resource: {
					name: "Support",
					ownerIdentity: "teste@msging.net",
					isActive: true,
				},
			});

			expect(result).toEqual(queue);
		});

		it("should throw when payload is invalid", async () => {
			const resource = new QueuesResources(transport);

			await expect(resource.set({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update a queue", async () => {

			const uuid = crypto.randomUUID()
			const queue: UpdateQueueInput = {
				name: "Updated Queue",
				ownerIdentity: "teste@msging.net",
				id: uuid,
			};

			sendCommand.mockResolvedValue({
				resource: queue,
			});

			const resource = new QueuesResources(transport);

			const result = await resource.update({
				id: uuid,
				name: "Updated Queue",
			 	ownerIdentity: "teste@msging.net",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/attendance-queues",
				type: "application/vnd.iris.desk.attendancequeue+json",
				resource: {
					id: uuid,
					uniqueId: uuid,
					name: "Updated Queue",
					ownerIdentity: "teste@msging.net",
				},
			});

			expect(result).toEqual(queue);
		});

		it("should throw when update payload is invalid", async () => {
			const resource = new QueuesResources(transport);

			await expect(resource.update({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a queue", async () => {

			const uuid = crypto.randomUUID();
			
			const response = {
				status: "success",
			};

			sendCommand.mockResolvedValue(response);

			const resource = new QueuesResources(transport);

			const result = await resource.delete(uuid);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "delete",
				to: "postmaster@desk.msging.net",
				uri: `/attendance-queues/${uuid}`,
			});

			expect(result).toEqual(response);
		});

		it("should throw when queue id is invalid", async () => {
			const resource = new QueuesResources(transport);

			await expect(resource.delete("" as any)).rejects.toThrow();

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("constructor", () => {
		it("should initialize nested resources", () => {
			const resource = new QueuesResources(transport);

			expect(resource.rules).toBeDefined();
			expect(resource.tags).toBeDefined();
		});
	});
});
