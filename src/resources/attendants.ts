import z from "zod";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { Attendant, AttendantPermission } from "../interfaces/Attendant.js";
import {
	AttendantEmailSchema,
	AttendantPermissionSchema,
	AttendantQueuesSchema,
	CreateOrUpdateAttendantSchema,
	type AttendantPermissionInput,
	type CreateOrUpdateAttendantInput,
} from "../schemas/AttendantSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

interface IFindAllParams {
	pagination?: Partial<Pagination>;
	teams?: string[];
}

export class AttendantsResources {
	constructor(private readonly transport: BlipTransport) {}

	async findAll(params?: IFindAllParams): Promise<Attendant[]> {
		const searchParams: Record<string, string> = {
			includeStatus: "false",
		};

		if (params?.pagination) {
			const { skip = 0, take = 500 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}
		if (params?.teams) {
			searchParams.teams = params.teams.join(",");
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<Attendant>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/agents/v2${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	async findByEmail(attendantEmail: string): Promise<Attendant | null> {
		const email = AttendantEmailSchema.parse(attendantEmail);

		const searchParams = {
			$skip: "0",
			$take: "1",
			$filter: `(identity eq '${encodeURIComponent(email)}@blip.ai')`,
		};

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<Attendant>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/attendants${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items[0] ?? null;
	}

	async createOrUpdate(input: CreateOrUpdateAttendantInput): Promise<IBlipSuccessfulResponse> {
		const parsed = CreateOrUpdateAttendantSchema.parse(input);

		const searchParams = {
			userCulture: "pt",
		};

		const attendant = {
			identity: `${encodeURIComponent(parsed.email)}@blip.ai`,
			...parsed,
		};

		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendants${this.transport.buildSearchParams(searchParams)}`,
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.attendant+json",
				items: [attendant],
			},
		});
	}

	async delete(attendantEmail: string): Promise<IBlipSuccessfulResponse> {
		const email = AttendantEmailSchema.parse(attendantEmail);

		const identity = `${encodeURIComponent(encodeURIComponent(email))}@blip.ai`;

		return await this.transport.sendCommand({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/attendants/${identity}`,
		});
	}

	async findPermissions(attendantEmail: string): Promise<AttendantPermission[]> {
		const email = AttendantEmailSchema.parse(attendantEmail);

		const identity = `${encodeURIComponent(encodeURIComponent(email))}@blip.ai`;

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<AttendantPermission>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/agent/${identity}/permission`,
		});

		return resource.items ?? [];
	}
	async setPermissions(
		attendantEmail: string,
		permissions: AttendantPermissionInput[],
	): Promise<IBlipSuccessfulResponse<IBlipCollectionResponse<AttendantPermission>>> {
		const email = AttendantEmailSchema.parse(attendantEmail);
		const validatedPermissions = z.array(AttendantPermissionSchema).parse(permissions);

		const identity = `${encodeURIComponent(email)}@blip.ai`;

		return await this.transport.sendCommand<IBlipCollectionResponse<AttendantPermission>>({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/agent/permissions`,
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.agentspermissions+json",
				items: [{ agents: [identity], permissions: validatedPermissions }],
			},
		});
	}

	async setQueuesByEmail(attendantEmail: string, queues: string[]): Promise<IBlipSuccessfulResponse> {
		const email = AttendantEmailSchema.parse(attendantEmail);
		const teams = AttendantQueuesSchema.parse(queues);

		const searchParams = {
			userCulture: "pt",
		};

		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@desk.msging.net",
			uri: `/attendants${this.transport.buildSearchParams(searchParams)}`,
			type: "application/vnd.lime.collection+json",
			resource: {
				itemType: "application/vnd.iris.desk.attendant+json",
				items: [
					{
						identity: `${encodeURIComponent(email)}@blip.ai`,
						teams: teams,
					},
				],
			},
		});
	}
}
