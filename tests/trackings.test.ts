import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport.js";
import type { EventCounter } from "../src/schemas/TrackingSchemas.js";
import { TrackingResources } from "../src/resources/trackings.js";

const filters = {
	startDate: "2024-01-01",
	endDate: "2024-01-31",
};

describe("TrackingResources", () => {
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
		it("should create a tracking entry", async () => {
			const input = { category: "payments", action: "success-order" };

			sendCommand.mockResolvedValue({ resource: { status: "success" } });

			const resource = new TrackingResources(transport);

			const result = await resource.create(input);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@analytics.msging.net",
				type: "application/vnd.iris.eventTrack+json",
				uri: "/event-track",
				resource: input,
			});

			expect(result).toEqual({ status: "success" });
		});

		it("should throw when input is invalid", async () => {
			const resource = new TrackingResources(transport);

			await expect(resource.create({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getCategories", () => {
		it("should return all tracking categories", async () => {
			const categories = [{ category: "payments" }, { category: "orders" }];

			sendCommand.mockResolvedValue({ resource: { items: categories } });

			const resource = new TrackingResources(transport);

			const result = await resource.getCategories();

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@analytics.msging.net",
				uri: "/event-track",
			});

			expect(result).toEqual(categories);
		});

		it("should return an empty array when there are no categories", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TrackingResources(transport);

			const result = await resource.getCategories();

			expect(result).toEqual([]);
		});
	});

	describe("getCategoryCounters", () => {
		it("should return event counters for a category", async () => {
			const counters: EventCounter[] = [
				{ category: "payments", action: "success-order", count: "4", storageDate: "2024-01-15T03:00:00.000Z" },
			];

			sendCommand.mockResolvedValue({ resource: { items: counters } });

			const resource = new TrackingResources(transport);

			const result = await resource.getCategoryCounters("payments", { filters });

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@analytics.msging.net",
				uri: "/event-track/payments",
			});

			expect(result).toEqual(counters);
		});

		it("should encode the category in the URI", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TrackingResources(transport);

			await resource.getCategoryCounters("my category", { filters });

			expect(sendCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					uri: "/event-track/my%20category",
				}),
			);
		});

		it("should apply pagination parameters", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });
			buildSearchParams.mockReturnValue("?$skip=10&$take=50");

			const resource = new TrackingResources(transport);

			await resource.getCategoryCounters("payments", {
				filters,
				pagination: { skip: 10, take: 50 },
			});

			expect(buildSearchParams).toHaveBeenCalledWith(expect.objectContaining({ $skip: 10, $take: 50 }));
		});

		it("should use default pagination values when pagination is an empty object", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TrackingResources(transport);

			await resource.getCategoryCounters("payments", {
				filters,
				pagination: {},
			});

			expect(buildSearchParams).toHaveBeenCalledWith(expect.objectContaining({ $skip: 0, $take: 100 }));
		});

		it("should throw when filters are invalid", async () => {
			const resource = new TrackingResources(transport);

			await expect(resource.getCategoryCounters("payments", { filters: {} as any })).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getEventDetails", () => {
		it("should return event details for a category and action", async () => {
			const details: EventCounter[] = [
				{ category: "payments", action: "success-order", count: "4", storageDate: "2024-01-15T03:00:00.000Z" },
			];

			sendCommand.mockResolvedValue({ resource: { items: details } });

			const resource = new TrackingResources(transport);

			const result = await resource.getEventDetails("payments", "success-order", { filters });

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@analytics.msging.net",
				uri: "/event-track/payments/success-order",
			});

			expect(result).toEqual(details);
		});

		it("should encode category and action in the URI", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TrackingResources(transport);

			await resource.getEventDetails("my category", "my action", { filters });

			expect(sendCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					uri: "/event-track/my%20category/my%20action",
				}),
			);
		});

		it("should apply pagination parameters", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });
			buildSearchParams.mockReturnValue("?$skip=0&$take=20");

			const resource = new TrackingResources(transport);

			await resource.getEventDetails("payments", "success-order", {
				filters,
				pagination: { skip: 0, take: 20 },
			});

			expect(buildSearchParams).toHaveBeenCalledWith(expect.objectContaining({ $skip: 0, $take: 20 }));
		});

		it("should use default pagination values when pagination is an empty object", async () => {
			sendCommand.mockResolvedValue({ resource: { items: [] } });

			const resource = new TrackingResources(transport);

			await resource.getEventDetails("payments", "success-order", {
				filters,
				pagination: {},
			});

			expect(buildSearchParams).toHaveBeenCalledWith(expect.objectContaining({ $skip: 0, $take: 100 }));
		});

		it("should throw when filters are invalid", async () => {
			const resource = new TrackingResources(transport);

			await expect(
				resource.getEventDetails("payments", "success-order", { filters: {} as any }),
			).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});
});
