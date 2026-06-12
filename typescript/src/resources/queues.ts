import type { BlipTransport } from "../clients/BlipTransport.js";
import type { Queue } from "../interfaces/Queue.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse, IPagination } from "../types/BlipCommands.js";
interface IFindAllParams {
	pagination?: Partial<IPagination>;
}

export class QueuesResources {
	constructor(private readonly transport: BlipTransport) {}


	async findAll(params?: IFindAllParams): Promise<Queue[]> {
		const { skip = 0, take = 9999 } = params?.pagination ?? {};

		const searchParams = {
			$skip: String(skip),
			$take: String(take),
			ascending: "true",
		};

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
