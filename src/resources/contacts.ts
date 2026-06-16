import type { BlipTransport } from "../clients/BlipTransport.js";
import { ContactFilterSchema, ContactIdentitySchema, ContactSchema, type Contact, type ContactFilter } from "../schemas/ContactSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCursorCollectionResponse, IBlipSuccessfulResponse } from "../types/BlipCommands.js";

interface IFindAllParams {
	pagination?: Partial<Pagination>;
	filter?: ContactFilter;
}

export class ContactsResources {
	constructor(private readonly transport: BlipTransport) {}

	async findAll(params?: IFindAllParams): Promise<IBlipCursorCollectionResponse<Contact>> {

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
			uri: `/contacts-cursor?${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}

	async findByIdentity(contactIdentity: string): Promise<Contact | null> {
		const identity = ContactIdentitySchema.parse(contactIdentity);

		const { resource } = await this.transport.sendCommand<Contact>({
			method: "get",
			to: "postmaster@crm.msging.net",
			uri: `/contacts/${identity}`,
		});

		return resource ?? null;
	}

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
