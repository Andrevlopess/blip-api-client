import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";
import {
	CreateQueueSchema,
	QueueIdSchema,
	UpdateQueueSchema,
	type CreateQueueData,
	type UpdateQueueData
} from "@/schemas/QueueSchemas.js";
import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { Queue } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
import { QueuesRulesResources } from "./rules.js";
import { QueueTagsResource } from "./tags.js";

interface IPaginationParams {
	pagination?: Partial<Pagination>;
}

export class QueuesResources {
	public readonly rules: QueuesRulesResources;
	public readonly tags: QueueTagsResource;

	constructor(private readonly transport: BlipTransport) {
		this.rules = new QueuesRulesResources(transport);
		this.tags = new QueueTagsResource(transport);
	}

	async findAll(params?: IPaginationParams): Promise<Queue[]> {
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

	async set(data: CreateQueueData): Promise<Queue> {
		const parsed = CreateQueueSchema.parse(data);

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

	async update(data: UpdateQueueData): Promise<Queue> {
		const parsed = UpdateQueueSchema.parse(data);

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

	async delete(queueId: string): Promise<IBlipSuccessfulResponse> {
		const id = QueueIdSchema.parse(queueId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${id}`,
		});
	}
}
