import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";
import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { IQueueTag } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
import { QueueIdSchema } from "@/schemas/QueueSchemas.js";
interface IPaginationParams {
	pagination?: Partial<Pagination>;
}


export class QueueTagsResource {
	constructor(private readonly transport: BlipTransport) {}

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

	async findQueueTags(queueId: string, params?: IPaginationParams): Promise<IQueueTag[]> {
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
