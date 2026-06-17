import type { BlipTransport } from "../clients/BlipTransport.js";
import type {
	DetailedFlows,
	Flows,
	FlowsJsonResponse,
	GetFlowsJsonResponse,
	IHeadersResponse,
} from "../interfaces/Flows.js";
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
} from "../schemas/FlowsSchemas.js";
import type { IBlipSuccessfulResponse } from "../types/BlipCommands.js";

/**
 * WhatsApp Flows management operations.
 *
 * Create, update, publish, and manage WhatsApp Flows.
 * This resource also provides access to Flow JSON assets
 * and Flow public key management.
 *
 * @category Resources
 */
export class FlowsResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Retrieves all WhatsApp Flows available for the bot.
	 *
	 * @returns A list of Flow summaries.
	 *
	 * @example
	 * ```ts
	 * const flows = await client.flows.getAll();
	 * ```
	 *
	 * @group Flows
	 */
	async getAll(): Promise<Flows[]> {
		const { resource } = await this.transport.sendCommand<{ data: Flows[] }>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: "/whatsapp-flows",
		});

		return resource.data;
	}

	/**
	 * Retrieves detailed information about a Flow.
	 *
	 * @param flowId - The Flow identifier.
	 *
	 * @returns The Flow details.
	 *
	 * @example
	 * ```ts
	 * const flow = await client.flows.getById(
	 *   "923852065234756"
	 * );
	 * ```
	 *
	 * @group Flows
	 */
	async getById(flowId: string): Promise<DetailedFlows> {
		const id = FlowIdSchema.parse(flowId);

		const { resource } = await this.transport.sendCommand<DetailedFlows>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/${id}`,
		});

		return resource;
	}

	/**
	 * Creates a new WhatsApp Flow.
	 *
	 * @param input - Flow creation data.
	 *
	 * @returns The identifier of the newly created Flow.
	 *
	 * @example
	 * ```ts
	 * const flow = await client.flows.create({
	 *   name: "Customer Registration",
	 *   categories: ["OTHER"]
	 * });
	 * ```
	 *
	 * @group Flows
	 */
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

	/**
	 * Updates a Flow's metadata.
	 *
	 * Metadata includes properties such as the Flow name,
	 * categories, endpoint URI, and other configuration options.
	 *
	 * @param flowId - The Flow identifier.
	 * @param input - Metadata update payload.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.flows.updateMetadata(flowId, {
	 *   name: "Updated Flow Name"
	 * });
	 * ```
	 *
	 * @group Flows
	 */
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

	/**
	 * Retrieves the JSON definition of a Flow.
	 *
	 * @param flowId - The Flow identifier.
	 *
	 * @returns The Flow JSON asset, if available.
	 *
	 * @example
	 * ```ts
	 * const flowJson = await client.flows.getFlowJson(flowId);
	 * ```
	 *
	 * @group Flows
	 */
	async getFlowJson(flowId: string): Promise<FlowsJsonResponse | undefined> {
		const id = FlowIdSchema.parse(flowId);

		const { resource } = await this.transport.sendCommand<GetFlowsJsonResponse>({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/assets/${id}`,
		});

		return resource.data[0];
	}

	/**
	 * Updates the JSON definition of a Flow.
	 *
	 * The Flow JSON describes screens, components,
	 * navigation, and business logic used by the Flow.
	 *
	 * @param flowId - The Flow identifier.
	 * @param flowJson - The Flow JSON payload.
	 *
	 * @returns Response headers returned by the platform.
	 *
	 * @example
	 * ```ts
	 * await client.flows.updateFlowJson(flowId, flowJson);
	 * ```
	 *
	 * @group Flows
	 */
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

	/**
	 * Publishes a Flow.
	 *
	 * Once published, the Flow becomes available for use.
	 *
	 * @param flowId - The Flow identifier.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.flows.publish(flowId);
	 * ```
	 *
	 * @group Flows
	 */
	async publish(flowId: string): Promise<IBlipSuccessfulResponse> {
		const id = FlowIdSchema.parse(flowId);

		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/publish/${id}`,
		});
	}
	/**
	 * Deprecates a published Flow.
	 *
	 * Deprecated Flows can no longer be used in new
	 * interactions but remain available for historical reference.
	 *
	 * @param flowId - The Flow identifier.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.flows.deprecate(flowId);
	 * ```
	 *
	 * @group Flows
	 */
	async deprecate(flowId: string): Promise<IBlipSuccessfulResponse> {
		const id = FlowIdSchema.parse(flowId);

		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: `/whatsapp-flows/deprecate/${id}`,
		});
	}

	/**
	 * Uploads a business public key used by WhatsApp Flows.
	 *
	 * @param input - Public RSA key upload payload.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.flows.uploadPublicKey({
	 *   businessPublicKey: publicKey
	 * });
	 * ```
	 *
	 * @group Public Keys
	 */
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

	/**
	 * Retrieves the currently uploaded business public key.
	 *
	 * @returns The uploaded public key information.
	 *
	 * @example
	 * ```ts
	 * const key = await client.flows.getUploadedPublicKey();
	 * ```
	 *
	 * @group Public Keys
	 */
	async getUploadedPublicKey() {
		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@wa.gw.msging.net",
			uri: "/whatsapp-flows/public-key/upload",
		});
	}
}
