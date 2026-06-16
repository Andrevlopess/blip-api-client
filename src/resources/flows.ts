import type {
	DetailedFlows,
	Flows,
	FlowsJsonResponse,
	GetFlowsJsonResponse,
	IHeadersResponse,
} from "@/interfaces/Flows.js";
import {
	CreateFlowSchema,
	FlowIdSchema,
	FlowJsonSchema,
	UpdateFlowMetadataSchema,
	UploadPublicKeySchema,
	type CreateFlowInput,
	type FlowJsonInput,
	type UpdateFlowMetadataInput,
	type UploadPublicKeyInput,
} from "@/schemas/FlowsSchemas.js";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { IBlipSuccessfulResponse } from "../types/BlipCommands.js";

export class FlowsResources {
	constructor(private readonly transport: BlipTransport) {}

	async findAll(): Promise<Flows[]> {
		const { resource } = await this.transport.sendCommand<{ data: Flows[] }>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: "/whatsapp-flows",
		});

		return resource.data;
	}

	async findById(flowId: string): Promise<DetailedFlows> {
		const id = FlowIdSchema.parse(flowId);

		const { resource } = await this.transport.sendCommand<DetailedFlows>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/${id}`,
		});

		return resource;
	}

	async create(input: CreateFlowInput): Promise<{ id: string }> {
		const data = CreateFlowSchema.parse(input);

		const { resource } = await this.transport.sendCommand<{ id: string }>({
			method: "set",
			to: "postmaster@wa.gw.msging.net",
			type: "application/json",
			uri: "/whatsapp-flows",
			resource: data,
		});

		return resource;
	}

	async updateMetadata(flowId: string, input: UpdateFlowMetadataInput): Promise<IBlipSuccessfulResponse> {
		const id = FlowIdSchema.parse(flowId);
		const resource = UpdateFlowMetadataSchema.parse(input);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "set",
			to: "postmaster@wa.gw.msging.net",
			type: "application/json",
			uri: `/whatsapp-flows/${id}`,
			resource,
		});
	}

	async getFlowJson(flowId: string): Promise<FlowsJsonResponse | undefined> {
		const id = FlowIdSchema.parse(flowId);

		const { resource } = await this.transport.sendCommand<GetFlowsJsonResponse>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/assets/${id}`,
		});

		return resource.data[0];
	}

	async updateFlowJson(flowId: string, flowJson: FlowJsonInput): Promise<IHeadersResponse> {
		const id = FlowIdSchema.parse(flowId);
		const data = FlowJsonSchema.parse(flowJson);

		const { resource } = await this.transport.sendCommand<IHeadersResponse>({
			method: "set",
			to: "postmaster@wa.gw.msging.net",
			type: "application/json",
			uri: `/whatsapp-flows/flow-json/${id}`,
			resource: data,
		});

		return resource;
	}

	async publishFlow(flowId: string): Promise<IBlipSuccessfulResponse> {
		const id = FlowIdSchema.parse(flowId);

		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/publish/${id}`,
		});
	}

	async deprecateFlow(flowId: string): Promise<IBlipSuccessfulResponse> {
		const id = FlowIdSchema.parse(flowId);

		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/deprecate/${id}`,
		});
	}

	async uploadPublicKey(input: UploadPublicKeyInput): Promise<IBlipSuccessfulResponse> {
		const { businessPublicKey } = UploadPublicKeySchema.parse(input);

		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@wa.gw.msging.net",
			type: "application/json",
			uri: "/whatsapp-flows/public-key/upload",
			resource: {
				business_public_key: businessPublicKey,
			},
		});
	}

	async getUploadedPublicKey() {
		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: "/whatsapp-flows/public-key/upload",
		});
	}
}
