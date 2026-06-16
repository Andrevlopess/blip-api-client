import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlipTransport } from "../src/clients/BlipTransport";
import { QueueTagsResource } from "../src/resources/queues/tags";

const queueId = "550e8400-e29b-41d4-a716-446655440000";

describe("QueueTagsResource", () => {
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

	describe("setQueueTags", () => {
		it("should set queue tags", async () => {
			const response = {
				status: "success",
			};

			sendCommand.mockResolvedValue(response);

			const resource = new QueueTagsResource(transport);

			const tags = ["sales", "vip"];

			const result = await resource.setQueueTags(queueId, tags);

			expect(sendCommand).toHaveBeenCalledTimes(1);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: `/attendance-queues/${queueId}/tags`,
				type: "application/vnd.lime.collection+json",
				resource: {
					itemType: "application/vnd.iris.desk.attendancequeuetag+json",
					items: [{ tag: "sales" }, { tag: "vip" }],
				},
			});

			expect(result).toEqual(response);
		});

		it("should support empty tags list", async () => {
			sendCommand.mockResolvedValue({
				status: "success",
			});

			const resource = new QueueTagsResource(transport);

			await resource.setQueueTags(queueId, []);

			expect(sendCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					resource: {
						itemType: "application/vnd.iris.desk.attendancequeuetag+json",
						items: [],
					},
				}),
			);
		});

		it("should throw when queue id is invalid", async () => {
			const resource = new QueueTagsResource(transport);

			await expect(resource.setQueueTags("" as any, ["sales"])).rejects.toThrow();

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("findQueueTags", () => {
		it("should fetch queue tags", async () => {
			const tags = [
				{
					tag: "sales",
				},
				{
					tag: "vip",
				},
			];

			sendCommand.mockResolvedValue({
				resource: {
					items: tags,
				},
			});

			const resource = new QueueTagsResource(transport);

			const result = await resource.findQueueTags(queueId);

			expect(buildSearchParams).toHaveBeenCalledWith({});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: `/attendance-queues/${queueId}/tags`,
			});

			expect(result).toEqual(tags);
		});

		it("should apply pagination", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			buildSearchParams.mockReturnValue("?$skip=10&$take=20");

			const resource = new QueueTagsResource(transport);

			await resource.findQueueTags(queueId, {
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
				uri: `/attendance-queues/${queueId}/tags?$skip=10&$take=20`,
			});
		});

		it("should use default pagination values", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			const resource = new QueueTagsResource(transport);

			await resource.findQueueTags(queueId, {
				pagination: {},
			});

			expect(buildSearchParams).toHaveBeenCalledWith({
				$skip: "0",
				$take: "9999",
			});
		});

		it("should return empty array when items is undefined", async () => {
			sendCommand.mockResolvedValue({
				resource: {},
			});

			const resource = new QueueTagsResource(transport);

			const queueId = "550e8400-e29b-41d4-a716-446655440000";
			const result = await resource.findQueueTags(queueId);

			expect(result).toEqual([]);
		});

		it("should throw when queue id is invalid", async () => {
			const resource = new QueueTagsResource(transport);

			await expect(resource.findQueueTags("" as any)).rejects.toThrow();

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});
});
