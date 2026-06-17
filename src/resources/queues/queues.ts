import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { Queue } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
import { PaginationSchema, type Pagination } from "../../schemas/PaginationSchema.js";
import {
	CreateQueueSchema,
	QueueIdSchema,
	UpdateQueueSchema,
	type CreateQueueInput,
	type UpdateQueueInput,
} from "../../schemas/QueueSchemas.js";
import { QueuesRulesResources } from "./rules.js";
import { QueueTagsResource } from "./tags.js";

interface IPaginationParams {
	pagination?: Partial<Pagination>;
}

/**
 * Queue management operations.
 *
 * Create, update, delete, and list service queues.
 * This resource also provides access to queue rules
 * and queue tags.
 *
 * @category Resources
 */
export class QueuesResources {
	/**
	 * Queue rule management operations.
	 *
	 * Access queue routing and assignment rules.
	 *
	 * @group Subresources
	 */
	public readonly rules: QueuesRulesResources;
	/**
	 * Queue tag management operations.
	 *
	 * Manage tags associated with service queues.
	 *
	 * @group Subresources
	 */
	public readonly tags: QueueTagsResource;

	constructor(private readonly transport: BlipTransport) {
		this.rules = new QueuesRulesResources(transport);
		this.tags = new QueueTagsResource(transport);
	}

	/**
	 * Retrieves all queues.
	 *
	 * Results can be paginated using the `pagination`
	 * parameter.
	 *
	 * @param params - Optional pagination settings.
	 *
	 * @returns A list of queues.
	 *
	 * @example
	 * ```ts
	 * const queues = await client.queues.getAll();
	 * ```
	 *
	 * @example
	 * ```ts
	 * const queues = await client.queues.getAll({
	 *   pagination: {
	 *     skip: 0,
	 *     take: 50
	 *   }
	 * });
	 * ```
	 *
	 * @group Queues
	 */
	async getAll(params?: IPaginationParams): Promise<Queue[]> {
		const searchParams: Record<string, string> = {
			ascending: "true",
		};

		if (params?.pagination) {
			const { skip = 0, take = 9999 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<Queue>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	/**
	 * Creates a new queue.
	 *
	 * @param input - Queue creation data.
	 *
	 * @returns The created queue.
	 *
	 * @example
	 * ```ts
	 * const queue = await client.queues.set({
	 *   name: "Support",
	 *   isActive: true
	 * });
	 * ```
	 *
	 * @group Queues
	 */
	async set(input: CreateQueueInput): Promise<Queue> {
		const parsed = CreateQueueSchema.parse(input);

		const { resource } = await this.transport.sendCommand<Queue>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues`,
			type: "application/vnd.iris.desk.attendancequeue+json",
			resource: {
				isActive: parsed.isActive || true,
				...parsed,
			},
		});

		return resource;
	}

	/**
	 * Updates an existing queue.
	 *
	 * @param input - Queue update data.
	 *
	 * @returns The updated queue.
	 *
	 * @example
	 * ```ts
	 * const queue = await client.queues.update({
	 *   id: "<uuid>",
	 *   name: "Premium Support"
	 * });
	 * ```
	 *
	 * @group Queues
	 */
	async update(input: UpdateQueueInput): Promise<Queue> {
		const parsed = UpdateQueueSchema.parse(input);

		const { resource } = await this.transport.sendCommand<Queue>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues`,
			type: "application/vnd.iris.desk.attendancequeue+json",
			resource: {
				uniqueId: parsed.id,
				...parsed,
			},
		});

		return resource;
	}

	/**
	 * Deletes a queue.
	 *
	 * @param queueId - The queue identifier.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.queues.delete("<uuid>");
	 * ```
	 *
	 * @group Queues
	 */
	async delete(queueId: string): Promise<IBlipSuccessfulResponse> {
		const id = QueueIdSchema.parse(queueId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${id}`,
		});
	}
}
