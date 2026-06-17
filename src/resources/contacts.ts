import type { BlipTransport } from "../clients/BlipTransport.js";
import { ContactFilterSchema, ContactIdentitySchema, ContactSchema, type Contact, type ContactFilter } from "../schemas/ContactSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCursorCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

interface IGetAllParams {
	pagination?: Partial<Pagination>;
	filter?: ContactFilter;
}

/**
 * Contact management operations.
 *
 * Create, update, retrieve, and delete contacts
 * stored in the BLiP CRM.
 *
 * @category Resources
 */
export class ContactsResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Retrieves contacts using optional pagination and filtering.
	 *
	 * Results are returned using BLiP's cursor-based
	 * pagination format.
	 *
	 * @param params - Optional filtering and pagination settings.
	 *
	 * @returns A cursor collection containing contacts and
	 * pagination metadata.
	 *
	 * @example
	 * ```ts
	 * const contacts = await client.contacts.getAll();
	 * ```
	 *
	 * @example
	 * ```ts
	 * const contacts = await client.contacts.getAll({
	 *   pagination: {
	 *     skip: 0,
	 *     take: 20
	 *   }
	 * });
	 * ```
	 *
	 * @example
	 * ```ts
	 * const contacts = await client.contacts.getAll({
	 *   filter: {
	 *     key: "name",
	 *     comparator: "startsWith",
	 *     value: "John"
	 *   }
	 * });
	 * ```
	 *
	 * @group Contacts
	 */
	async getAll(params?: IGetAllParams): Promise<IBlipCursorCollectionResponse<Contact>> {
		const searchParams: Record<string, string> = {};

		if (params?.pagination) {
			const { skip = 0, take = 20 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		if (params?.filter) {
			const parsed = ContactFilterSchema.parse(params?.filter);
			searchParams.$filter = this.buildFilter(parsed);
		}

		const { resource } = await this.transport.sendCommand<IBlipCursorCollectionResponse<Contact>>({
			method: "get",
			to: "postmaster@crm.msging.net",
			uri: `/contacts-cursor${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}

	/**
	 * Retrieves a contact by identity.
	 *
	 * @param contactIdentity - The contact identity
	 * (for example, `user@wa.gw.msging.net`).
	 *
	 * @returns The contact if found, otherwise `null`.
	 *
	 * @example
	 * ```ts
	 * const contact =
	 *   await client.contacts.getByIdentity(
	 *     "user@wa.gw.msging.net"
	 *   );
	 * ```
	 *
	 * @group Contacts
	 */
	async getByIdentity(contactIdentity: string): Promise<Contact | null> {
		const identity = ContactIdentitySchema.parse(contactIdentity);

		const { resource } = await this.transport.sendCommand<Contact>({
			method: "get",
			to: "postmaster@crm.msging.net",
			uri: `/contacts/${identity}`,
		});

		return resource ?? null;
	}

	/**
	 * Creates or updates a contact.
	 *
	 * If a contact with the same identity already exists,
	 * its information will be updated.
	 *
	 * @param data - Contact data.
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.contacts.createOrUpdate({
	 *   identity: "user@wa.gw.msging.net",
	 *   name: "John Doe"
	 * });
	 * ```
	 *
	 * @group Contacts
	 */
	async createOrUpdate(data: Contact): Promise<IBlipSuccessfulResponse> {
		const parsed = ContactSchema.parse(data);

		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@crm.msging.net",
			uri: `/contacts`,
			type: "application/vnd.lime.contact+json",
			resource: parsed,
		});
	}

	/**
	 * Deletes a contact.
	 *
	 * @param contactIdentity - The contact identity
	 * (for example, `user@wa.gw.msging.net`).
	 *
	 * @returns A successful response.
	 *
	 * @example
	 * ```ts
	 * await client.contacts.delete(
	 *   "user@wa.gw.msging.net"
	 * );
	 * ```
	 *
	 * @group Contacts
	 */
	async delete(contactIdentity: string): Promise<IBlipSuccessfulResponse> {
		const identity = ContactIdentitySchema.parse(contactIdentity);

		return await this.transport.sendCommand({
			method: "delete",
			to: "postmaster@crm.msging.net",
			uri: `/contacts/${identity}`,
		});
	}

	private buildFilter({ comparator, key, value }: ContactFilter) {
		if (comparator === "startsWith") {
			return `(startswith(${key}, '${value}'))`;
		}
		return `(${key} ${comparator} '${value}')`;
	}
}
