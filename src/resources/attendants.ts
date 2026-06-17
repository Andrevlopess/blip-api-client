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

/**
 * Attendant management operations.
 *
 * Create, update, delete, and manage attendants,
 * including permissions and queue assignments.
 *
 * @category Resources
 */
export class AttendantsResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Retrieves all attendants.
	 *
	 * Results can be filtered by teams and paginated.
	 *
	 * @param params - Optional filtering and pagination settings.
	 *
	 * @returns A list of attendants.
	 *
	 * @example
	 * ```ts
	 * const attendants = await client.attendants.getAll();
	 * ```
	 *
	 * @example
	 * ```ts
	 * const attendants = await client.attendants.getAll({
	 *   teams: ["Support"],
	 *   pagination: {
	 *     skip: 0,
	 *     take: 50
	 *   }
	 * });
	 * ```
	 *
	 * @group Attendants
	 */
	async getAll(params?: IFindAllParams): Promise<Attendant[]> {
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
	/**
	 * Retrieves an attendant by email address.
	 *
	 * @param attendantEmail - The attendant email address.
	 *
	 * @returns The attendant if found, otherwise `null`.
	 *
	 * @example
	 * ```ts
	 * const attendant = await client.attendants.getByEmail(
	 *   "agent@company.com"
	 * );
	 * ```
	 *
	 * @group Attendants
	 */
	async getByEmail(attendantEmail: string): Promise<Attendant | null> {
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

	/**
	 * Creates or updates an attendant.
	 *
	 * If an attendant with the provided email already exists,
	 * its information will be updated.
	 *
	 * @param input - Attendant data.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.attendants.createOrUpdate({
	 *   email: "agent@company.com",
	 *   fullName: "John Doe"
	 * });
	 * ```
	 *
	 * @group Attendants
	 */
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

	/**
	 * Deletes an attendant.
	 *
	 * @param attendantEmail - The attendant email address.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.attendants.delete(
	 *   "agent@company.com"
	 * );
	 * ```
	 *
	 * @group Attendants
	 */
	async delete(attendantEmail: string): Promise<IBlipSuccessfulResponse> {
		const email = AttendantEmailSchema.parse(attendantEmail);

		const identity = `${encodeURIComponent(encodeURIComponent(email))}@blip.ai`;

		return await this.transport.sendCommand({
			method: "delete",
			to: "postmaster@desk.msging.net",
			uri: `/attendants/${identity}`,
		});
	}

	/**
	 * Retrieves the permissions assigned to an attendant.
	 *
	 * @param attendantEmail - The attendant email address.
	 *
	 * @returns A list of permissions.
	 *
	 * @example
	 * ```ts
	 * const permissions =
	 *   await client.attendants.getPermissions(
	 *     "agent@company.com"
	 *   );
	 * ```
	 *
	 * @group Permissions
	 */
	async getPermissions(attendantEmail: string): Promise<AttendantPermission[]> {
		const email = AttendantEmailSchema.parse(attendantEmail);

		const identity = `${encodeURIComponent(encodeURIComponent(email))}@blip.ai`;

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<AttendantPermission>>({
			method: "get",
			to: "postmaster@desk.msging.net",
			uri: `/agent/${identity}/permission`,
		});

		return resource.items ?? [];
	}

	/**
	 * Replaces the permissions assigned to an attendant.
	 *
	 * @param attendantEmail - The attendant email address.
	 * @param permissions - The permissions to assign.
	 *
	 * @returns A successful response containing the assigned permissions.
	 *
	 * @example
	 * ```ts
	 *	await client.attendants.setPermissions("andre.lopes@skeps.com.br", [
	 *	{
	 *		ownerIdentity: "testeia157@msging.net",
	 *		name: "canReadFullThreadMessages",
	 *		isActive: true,
	 *	},
	 *]);
	 * ```
	 *
	 * @group Permissions
	 */
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

	/**
	 * Assigns queues to an attendant.
	 *
	 * The provided queue list replaces the attendant's
	 * current queue assignments.
	 *
	 * @param attendantEmail - The attendant email address.
	 * @param queues - Queue names to assign.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.attendants.setQueuesByEmail(
	 *   "agent@company.com",
	 *   ["Support", "Sales"]
	 * );
	 * ```
	 *
	 * @group Queue Assignments
	 */
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
