import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";
import {
	CreateQueueSchema,
	QueueIdSchema,
	RoutingRuleSchema,
	UpdateQueueSchema,
	type CreateQueueData,
	type RoutingRule,
	type UpdateQueueData,
} from "@/schemas/QueueSchemas.js";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { IQueueTag, Queue } from "../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";
interface IPaginationParams {
	pagination?: Partial<Pagination>;
}
interface IGetQueueAttendanceRulesParams extends IPaginationParams  {
	ascending?: boolean
}

export class QueuesResources {
	constructor(private readonly transport: BlipTransport) {}

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

	async setQueue(data: CreateQueueData): Promise<Queue> {
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

	async updateQueue(data: UpdateQueueData): Promise<Queue> {
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

	async deleteQueue(queueId: string): Promise<IBlipSuccessfulResponse> {
		const id = QueueIdSchema.parse(queueId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${id}`,
		});
	}

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

	async findQueueAttendanceRules(queueName: string, params?: IGetQueueAttendanceRulesParams): Promise<IQueueTag[]> {
		const searchParams: Record<string, string> = {};

		if (params?.pagination) {
			const { skip = 0, take = 9999 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<IQueueTag>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/rules/queue/${encodeURIComponent(queueName)}${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items ?? [];
	}

	async setQueueAttendanceRules(queueName: string, rules?: RoutingRule): Promise<IQueueTag[]> {
		const parsed = RoutingRuleSchema.parse(rules);

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<IQueueTag>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/rules/queue/${encodeURIComponent(queueName)}`,
		});

		return resource.items ?? [];
	}
}
