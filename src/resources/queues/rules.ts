import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";
import {
    RoutingRuleSchema,
    type RoutingRule
} from "@/schemas/QueueSchemas.js";
import z from "zod";
import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { IQueueTag } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
interface IPaginationParams {
	pagination?: Partial<Pagination>;
}
interface IGetQueueAttendanceRulesParams extends IPaginationParams {
	ascending?: boolean;
}

export class QueuesRulesResources {
	constructor(private readonly transport: BlipTransport) {}

	async findAll(queueName: string, params?: IGetQueueAttendanceRulesParams): Promise<IQueueTag[]> {
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

	async set(rule: RoutingRule): Promise<IBlipSuccessfulResponse> {
		const parsed = RoutingRuleSchema.parse(rule);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/rules/`,
			type: "application/vnd.iris.desk.rule+json",
			resource: {
				id: parsed.id ?? crypto.randomUUID(),
				...parsed,
			},
		});
	}

	async delete(ruleId: string): Promise<IBlipSuccessfulResponse> {
		const id = z.uuid().parse(ruleId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/rules/${id}`,
		});
	}
}
