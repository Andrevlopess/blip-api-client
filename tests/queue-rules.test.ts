import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport";
import { QueuesRulesResources } from "../src/resources/queues/rules";
import { RoutingRuleInput } from "../src/schemas/QueueSchemas";

describe("QueuesRulesResources", () => {
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
		it("should fetch all rules", async () => {
			const items = [
				{
					id: "rule-1",
					name: "Sales",
				},
			];

			sendCommand.mockResolvedValue({
				resource: {
					items,
				},
			});

			const resource = new QueuesRulesResources(transport);

			const result = await resource.getAll("Sales");

			expect(buildSearchParams).toHaveBeenCalledWith({});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/rules/queue/Sales",
			});

			expect(result).toEqual(items);
		});

		it("should apply pagination", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			buildSearchParams.mockReturnValue("?$skip=10&$take=20");

			const resource = new QueuesRulesResources(transport);

			await resource.getAll("Sales", {
				pagination: {
					skip: 10,
					take: 20,
				},
			});

			expect(buildSearchParams).toHaveBeenCalledWith({
				$skip: "10",
				$take: "20",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/rules/queue/Sales?$skip=10&$take=20",
			});
		});

		it("should return empty array when items is undefined", async () => {
			sendCommand.mockResolvedValue({
				resource: {},
			});

			const resource = new QueuesRulesResources(transport);

			const result = await resource.getAll("Sales");

			expect(result).toEqual([]);
		});

		it("should encode queue name", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			const resource = new QueuesRulesResources(transport);

			await resource.getAll("Support Team");

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/rules/queue/Support%20Team",
			});
		});
	});

	describe("set", () => {
		it("should create a rule with provided id", async () => {
			const uuid = crypto.randomUUID();

			const response = {
				status: "success",
			};

			sendCommand.mockResolvedValue(response);

			const resource = new QueuesRulesResources(transport);

			const input: RoutingRuleInput = {
				id: uuid,
				title: "rule title",
				isActive: true,
				relation: "Equals",
				operator: "Or",
				queueId: uuid,
				team: "queue-1",
				conditions: [
					{
						property: "Contact.Email",
						relation: "Equals",
						values: ["teste"],
					},
				],
			};

			const result = await resource.set(input);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/rules/",
				type: "application/vnd.iris.desk.rule+json",
				resource: {
					id: uuid,
					title: "rule title",
					isActive: true,
					relation: "Equals",
					operator: "Or",
					queueId: uuid,
					team: "queue-1",
					conditions: [
						{
							property: "Contact.Email",
							relation: "Equals",
							values: ["teste"],
						},
					],
				},
			});

			expect(result).toEqual(response);
		});

		it("should generate an id when one is not provided", async () => {
			const uuid = crypto.randomUUID();

			vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(uuid);

			sendCommand.mockResolvedValue({
				status: "success",
			});

			const resource = new QueuesRulesResources(transport);

            const input: RoutingRuleInput = {
				title: "rule title",
				isActive: true,
				relation: "Equals",
				operator: "Or",
				queueId: uuid,
				team: "queue-1",
				conditions: [
					{
						property: "Contact.Email",
						relation: "Equals",
						values: ["teste"],
					},
				],
			};

			await resource.set(input);

			expect(sendCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					resource: expect.objectContaining({
						id: uuid,
					}),
				}),
			);
		});

		it("should throw when payload is invalid", async () => {
			const resource = new QueuesRulesResources(transport);

			await expect(resource.set({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a rule", async () => {
			const response = {
				status: "success",
			};

			sendCommand.mockResolvedValue(response);

			const resource = new QueuesRulesResources(transport);

			const ruleId = "550e8400-e29b-41d4-a716-446655440000";

			const result = await resource.delete(ruleId);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "delete",
				to: "postmaster@desk.msging.net",
				uri: `/rules/${ruleId}`,
			});

			expect(result).toEqual(response);
		});

		it("should throw for invalid uuid", async () => {
			const resource = new QueuesRulesResources(transport);

			await expect(resource.delete("invalid-id")).rejects.toThrow();

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});
});
