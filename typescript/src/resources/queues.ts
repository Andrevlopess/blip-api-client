import type { BlipTransport } from "../clients/BlipTransport.js";
import type { IQueue } from "../interfaces/IQueue.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

export class QueuesResources {
	constructor(private readonly transport: BlipTransport) {}

	async getAll(): Promise<IQueue[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<IQueue>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: "/attendance-queues?$skip=0&$take=999&$ascending=true",
		});

		return resource.items;
	}

	async setTags(queue: string, tags: string[]): Promise<void> {
		await this.transport.sendCommand({
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
