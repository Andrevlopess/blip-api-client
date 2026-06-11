import type { BlipTransport } from "../clients/BlipTransport.js";
import type { IAttendant } from "../interfaces/IAttendant.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

export class AttendantsResources {
	constructor(private readonly transport: BlipTransport) {}

	async getAll(): Promise<IAttendant[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<IAttendant>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: "/agents/v2?$skip=0&$take=9999&includeStatus=false",
		});

		return resource.items;
	}

	async setQueues(attendant: string, queues: string[]): Promise<void> {
		await this.transport.sendCommand({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: "/attendants?userCulture=pt",
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.attendafnt+json",
				items: [
					{
						identity: `${encodeURIComponent(attendant)}@blip.ai`,
						teams: queues,
					},
				],
			},
		});
	}
}
