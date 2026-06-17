import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport.js";
import type { DetailedFlows, Flows, FlowsJsonResponse, IHeadersResponse } from "../src/interfaces/Flows.js";
import { FlowsResources } from "../src/resources/flows.js";

describe("FlowsResources", () => {
	let transport: BlipTransport;
	let sendCommand: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		sendCommand = vi.fn();

		transport = {
			sendCommand,
		} as unknown as BlipTransport;
	});

	describe("getAll", () => {
		it("should fetch all flows", async () => {
			const flows: Flows[] = [
				{ id: "1", name: "Customer Registration" } as unknown as Flows,
				{ id: "2", name: "Order Tracking" } as unknown as Flows,
			];

			sendCommand.mockResolvedValue({ resource: { data: flows } });

			const resource = new FlowsResources(transport);

			const result = await resource.getAll();

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: "/whatsapp-flows",
			});

			expect(result).toEqual(flows);
		});

		it("should return an empty array when there are no flows", async () => {
			sendCommand.mockResolvedValue({ resource: { data: [] } });

			const resource = new FlowsResources(transport);

			const result = await resource.getAll();

			expect(result).toEqual([]);
		});
	});

	describe("getById", () => {
		it("should fetch a flow by id", async () => {
			const flowId = "923852065234756";
			const flow = { id: flowId, name: "Customer Registration" } as unknown as DetailedFlows;

			sendCommand.mockResolvedValue({ resource: flow });

			const resource = new FlowsResources(transport);

			const result = await resource.getById(flowId);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: `/whatsapp-flows/${flowId}`,
			});

			expect(result).toEqual(flow);
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.getById("")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("create", () => {
		it("should create a flow", async () => {
			const response = { id: "923852065234756" };

			sendCommand.mockResolvedValue({ resource: response });

			const resource = new FlowsResources(transport);

			const result = await resource.create({
				name: "Customer Registration",
				categories: ["OTHER"],
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@wa.gw.msging.net",
				type: "application/json",
				uri: "/whatsapp-flows",
				resource: {
					name: "Customer Registration",
					categories: ["OTHER"],
				},
			});

			expect(result).toEqual(response);
		});

		it("should throw when payload is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.create({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("updateMetadata", () => {
		it("should update flow metadata", async () => {
			const flowId = "923852065234756";
			const response = { status: "success" };

			sendCommand.mockResolvedValue(response);

			const resource = new FlowsResources(transport);

			const result = await resource.updateMetadata(flowId, {
				name: "Updated Flow Name",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@wa.gw.msging.net",
				type: "application/json",
				uri: `/whatsapp-flows/${flowId}`,
				resource: {
					name: "Updated Flow Name",
				},
			});

			expect(result).toEqual(response);
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.updateMetadata("", { name: "Updated" })).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});

		it("should throw when metadata payload is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.updateMetadata("923852065234756", {} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getFlowJson", () => {
		it("should return the first flow JSON asset", async () => {
			const flowId = "923852065234756";
			const flowJson = { id: "asset-1", name: "flow.json" } as unknown as FlowsJsonResponse;

			sendCommand.mockResolvedValue({ resource: { data: [flowJson] } });

			const resource = new FlowsResources(transport);

			const result = await resource.getFlowJson(flowId);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: `/whatsapp-flows/assets/${flowId}`,
			});

			expect(result).toEqual(flowJson);
		});

		it("should return undefined when there are no assets", async () => {
			const flowId = "923852065234756";

			sendCommand.mockResolvedValue({ resource: { data: [] } });

			const resource = new FlowsResources(transport);

			const result = await resource.getFlowJson(flowId);

			expect(result).toBeUndefined();
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.getFlowJson("")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("updateFlowJson", () => {
		it("should update the flow JSON definition", async () => {
			const flowId = "923852065234756";
			const headers = { "x-request-id": "abc123" } as unknown as IHeadersResponse;

			sendCommand.mockResolvedValue({ resource: headers });

			const resource = new FlowsResources(transport);

			const flowJson = {
				version: "3.1",
				screens: [],
			};

			const result = await resource.updateFlowJson(flowId, flowJson as any);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@wa.gw.msging.net",
				type: "application/json",
				uri: `/whatsapp-flows/flow-json/${flowId}`,
				resource: flowJson,
			});

			expect(result).toEqual(headers);
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.updateFlowJson("", { version: "3.1", screens: [] } as any)).rejects.toBeInstanceOf(
				ZodError,
			);

			expect(sendCommand).not.toHaveBeenCalled();
		});

		it("should throw when flow JSON payload is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.updateFlowJson("923852065234756", {} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("publish", () => {
		it("should publish a flow", async () => {
			const flowId = "923852065234756";
			const response = { status: "success" };

			sendCommand.mockResolvedValue(response);

			const resource = new FlowsResources(transport);

			const result = await resource.publish(flowId);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: `/whatsapp-flows/publish/${flowId}`,
			});

			expect(result).toEqual(response);
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.publish("")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("deprecate", () => {
		it("should deprecate a flow", async () => {
			const flowId = "923852065234756";
			const response = { status: "success" };

			sendCommand.mockResolvedValue(response);

			const resource = new FlowsResources(transport);

			const result = await resource.deprecate(flowId);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: `/whatsapp-flows/deprecate/${flowId}`,
			});

			expect(result).toEqual(response);
		});

		it("should throw when flow id is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.deprecate("")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("uploadPublicKey", () => {
		it("should upload a business public key", async () => {
			const response = { status: "success" };
			const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBg...\n-----END PUBLIC KEY-----";

			sendCommand.mockResolvedValue(response);

			const resource = new FlowsResources(transport);

			const result = await resource.uploadPublicKey({ businessPublicKey: publicKey });

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@wa.gw.msging.net",
				type: "application/json",
				uri: "/whatsapp-flows/public-key/upload",
				resource: {
					business_public_key: publicKey,
				},
			});

			expect(result).toEqual(response);
		});

		it("should throw when payload is invalid", async () => {
			const resource = new FlowsResources(transport);

			await expect(resource.uploadPublicKey({} as any)).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getUploadedPublicKey", () => {
		it("should fetch the currently uploaded public key", async () => {
			const response = {
				resource: { business_public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBg...\n-----END PUBLIC KEY-----" },
			};

			sendCommand.mockResolvedValue(response);

			const resource = new FlowsResources(transport);

			const result = await resource.getUploadedPublicKey();

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@wa.gw.msging.net",
				uri: "/whatsapp-flows/public-key/upload",
			});

			expect(result).toEqual(response);
		});
	});
});
