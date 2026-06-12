import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { Queue } from "../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";
interface IFindAllParams {
	pagination?: Partial<Pagination>;
}

export class QueuesResources {
	constructor(private readonly transport: BlipTransport) {}

	async findAll(params?: IFindAllParams): Promise<Queue[]> {
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
			uri: `/attendance-queues?${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	async setTags(queue: string, tags: string[]): Promise<IBlipSuccessfulResponse> {
		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendance-queues/${encodeURIComponent(queue)}/tags`,
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.attendancequeuetag+json",
				items: tags.map((tag) => {
					tag;
				}),
			},
		});
	}
}
