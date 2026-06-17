import z from "zod";
import type { BlipTransport } from "../../clients/BlipTransport.js";
import type { IQueueTag } from "../../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../../types/BlipCommands.js";
import { PaginationSchema, type Pagination } from "../../schemas/PaginationSchema.js";
import {
	RoutingRuleSchema,
	type RoutingRuleInput,
} from "../../schemas/QueueSchemas.js";
interface IPaginationParams {
	pagination?: Partial<Pagination>;
}
interface IGetQueueAttendanceRulesParams extends IPaginationParams {
	ascending?: boolean;
}

/**
 * Queue routing rule management operations.
 *
 * Create, list, and delete routing rules associated
 * with service queues.
 *
 * @category Resources
 */
export class QueuesRulesResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Retrieves all routing rules associated with a queue.
	 *
	 * Results can be paginated using the `pagination`
	 * parameter.
	 *
	 * @param queueName - The queue name.
	 * @param params - Optional query settings.
	 *
	 * @returns A list of routing rules.
	 *
	 * @example
	 * ```ts
	 * const rules = await client.queues.rules.getAll(
	 *   "Support"
	 * );
	 * ```
	 *
	 * @example
	 * ```ts
	 * const rules = await client.queues.rules.getAll(
	 *   "Support",
	 *   {
	 *     pagination: {
	 *       skip: 0,
	 *       take: 50
	 *     }
	 *   }
	 * );
	 * ```
	 *
	 * @group Queue Rules
	 */
	async getAll(queueName: string, params?: IGetQueueAttendanceRulesParams): Promise<IQueueTag[]> {
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

	/**
	 * Creates or updates a queue routing rule.
	 *
	 * If an identifier is not provided, a new rule identifier
	 * will be generated automatically.
	 *
	 * @param input - Routing rule configuration.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.queues.rules.set({
	 * 	isActive: true,
	 * 	operator: 'And',
	 * 	queueId: '0e1e13f9-28b5-4760-8266-f13d2f80c4b6',
	 * 	relation: 'Equals',
	 * 	team: 'Fila-1',
	 * 	title: 'Extras Queue',
	 * 	conditions: [
	 * 		{
	 * 			extrasProperty: "queue",
	 * 			property: "Contact.Extras.queue",
	 * 			relation: "Equals",
	 * 			values: ["fila-1"]
	 * 		},
	 * 	],
	 * });
	 * ```
	 *
	 * @group Queue Rules
	 */
	async set(input: RoutingRuleInput): Promise<IBlipSuccessfulResponse> {
		const parsed = RoutingRuleSchema.parse(input);

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

	/**
	 * Deletes a routing rule.
	 *
	 * @param ruleId - The routing rule identifier.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.queues.rules.delete(
	 *   "3d651f90-4f4c-4d0a-8b57-f0f3c6b0f5ab"
	 * );
	 * ```
	 *
	 * @group Queue Rules
	 */
	async delete(ruleId: string): Promise<IBlipSuccessfulResponse> {
		const id = z.uuid().parse(ruleId);

		return await this.transport.sendCommand<IBlipSuccessfulResponse>({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/rules/${id}`,
		});
	}
}
