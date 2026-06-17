import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { IQueueTag } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
import { PaginationSchema, type Pagination } from "../../schemas/PaginationSchema.js";
import { QueueIdSchema } from "../../schemas/QueueSchemas.js";
interface IPaginationParams {
	pagination?: Partial<Pagination>;
}

/**
 * Queue tag management operations.
 *
 * Assign and retrieve tags associated with service queues.
 *
 * @category Resources
 */
export class QueueTagsResource {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Replaces the tags assigned to a queue.
	 *
	 * The provided list becomes the complete set of tags
	 * associated with the queue.
	 *
	 * @param queueId - The queue identifier.
	 * @param tags - The tags to associate with the queue.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.queues.tags.setQueueTags(
	 *   "68549036-5700-4ecd-a0f3-019b04b193b4",
	 *   ["sales", "priority"]
	 * );
	 * ```
	 *
	 * @group Queue Tags
	 */
	async setQueueTags(queueId: string, tags: string[]): Promise<IBlipSuccessfulResponse> {
		const id = QueueIdSchema.parse(queueId);
		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${id}/tags`,
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.attendancequeuetag+json",
				items: tags.map((tag) => ({ tag })),
			},
		});
	}

	/**
	 * Retrieves all tags associated with a queue.
	 *
	 * Results can be paginated using the `pagination`
	 * parameter.
	 *
	 * @param queueId - The queue identifier.
	 * @param params - Optional pagination settings.
	 *
	 * @returns A list of queue tags.
	 *
	 * @example
	 * ```ts
	 * const tags = await client.queues.tags.getQueueTags(
	 *   "68549036-5700-4ecd-a0f3-019b04b193b4"
	 * );
	 * ```
	 *
	 * @example
	 * ```ts
	 * const tags = await client.queues.tags.getQueueTags(
	 *   "68549036-5700-4ecd-a0f3-019b04b193b4",
	 *   {
	 *     pagination: {
	 *       skip: 0,
	 *       take: 50
	 *     }
	 *   }
	 * );
	 * ```
	 *
	 * @group Queue Tags
	 */
	async getQueueTags(queueId: string, params?: IPaginationParams): Promise<IQueueTag[]> {
		const id = QueueIdSchema.parse(queueId);

		const searchParams: Record<string, string> = {};

		if (params?.pagination) {
			const { skip = 0, take = 9999 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<IQueueTag>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${id}/tags${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items ?? [];
	}
}
