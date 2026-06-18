import type { BlipTransport } from "../clients/BlipTransport.js";
import type { MergedThreadMessage, ThreadMessage } from "../interfaces/Message.js";
import { ContactIdentitySchema } from "../schemas/ContactSchemas.js";
import {
	SendEmailSchema,
	SendMessageSchema,
	type SendEmailInput,
	type SendMessageInput,
} from "../schemas/MessagesSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

export interface GetThreadsParams {
	pagination: Partial<Pagination>;
}
export interface GetMergedThreadsParams {
	pagination?: Pick<Pagination, "take"> & { storageDate?: string };
	direction?: "asc" | "desc";
	getFromOriginator?: boolean;
}

/**
 * Messaging operations.
 *
 * Send messages, send emails, and retrieve conversation threads.
 *
 * @hideconstructor
 * @group Resources
 */
export class MessagesResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Sends a message to a BLiP contact.
	 *
	 * @param data - Message payload.
	 *
	 * @example
	 * ```ts
	 * await client.messages.sendMessage({
	 *   to: "user@wa.gw.msging.net",
	 *   type: "text/plain",
	 *   content: "Hello!"
	 * });
	 * ```
	 *
	 * @group Messages
	 */
	async sendMessage(data: SendMessageInput): Promise<void> {
		const { to, content, type } = SendMessageSchema.parse(data);
		await this.transport.sendMessage({
			to,
			type,
			content,
		});
	}

	/**
	 * Sends an email through BLiP's Mailgun integration.
	 *
	 * The destination may be a single email address or multiple
	 * email addresses.
	 *
	 * @param data - Email payload.
	 *
	 * @example
	 * ```ts
	 * await client.messages.sendEmail({
	 *   to: "john@example.com",
	 *   subject: "Welcome",
	 *   type: "text/plain",
	 *   content: "Thanks for signing up."
	 * });
	 * ```
	 *
	 * @example
	 * ```ts
	 * await client.messages.sendEmail({
	 *   to: [
	 *     "john@example.com",
	 *     "jane@example.com"
	 *   ],
	 *   subject: "Newsletter",
	 *   type: "text/plain",
	 *   content: "Thanks for signing up."
	 * });
	 * ```
	 *
	 * @group Messages
	 */
	async sendEmail(data: SendEmailInput): Promise<void> {
		const { content, subject, to, type } = SendEmailSchema.parse(data);

		const toArray = Array.isArray(to) ? to : [to];
		const destination = toArray
			.map((email) => encodeURIComponent(email))
			.join(",")
			.concat("@mailgun.gw.msging.net");

		console.log({
			to: destination,
			content,
			type,
			metadata: {
				"mail.subject": subject,
			},
		});

		await this.transport.sendMessage({
			to: destination,
			content,
			type,
			metadata: {
				"mail.subject": subject,
			},
		});
	}

	/**
	 * Retrieves conversation threads for a contact.
	 *
	 * Results can be paginated using the `pagination`
	 * parameter.
	 *
	 * @param contactIdentity - Contact identity (e.g. `user@wa.gw.msging.net`).
	 * @param params - Optional pagination settings.
	 *
	 * @returns A list of thread messages.
	 *
	 * @example
	 * ```ts
	 * const threads = await client.messages.getThreads(
	 *   "user@wa.gw.msging.net"
	 * );
	 * ```
	 *
	 * @example
	 * ```ts
	 * const threads = await client.messages.getThreads(
	 *   "user@wa.gw.msging.net",
	 *   {
	 *     pagination: {
	 *       skip: 0,
	 *       take: 100
	 *     }
	 *   }
	 * );
	 * ```
	 *
	 * @group Messages
	 */
	async getThreads(contactIdentity: string, params?: GetThreadsParams): Promise<ThreadMessage[]> {
		const identity = ContactIdentitySchema.parse(contactIdentity);

		const searchParams: Record<string, string> = {};

		if (params?.pagination) {
			const { skip = 0, take = 9999 } = PaginationSchema.parse(params.pagination);

			searchParams.$skip = String(skip);
			searchParams.$take = String(take);
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<ThreadMessage>>({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/threads/${identity}${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}

	/**
	 * Retrieves merged thread messages for a given contact identity.
	 *
	 * Merges threads from multiple channels into a single unified conversation view,
	 * with support for pagination, ordering, and media refresh.
	 *
	 * @param contactIdentity - The contact identity string to fetch threads for (validated against `ContactIdentitySchema`).
	 * @param params - Optional parameters to control the query behavior.
	 * @param params.pagination - Pagination options for the result set.
	 * @param params.pagination.take - Number of messages to retrieve (defaults to `20`).
	 * @param params.pagination.storageDate - Cursor date for paginating through older messages.
	 * @param params.direction - Sort order of the returned messages. Defaults to descending if omitted.
	 * @param params.getFromOriginator - Whether to retrieve messages from the originator's perspective.
	 *
	 * @returns A promise that resolves to an array of {@link MergedThreadMessage}.
	 *
	 * @throws {ZodError} If `contactIdentity` does not satisfy `ContactIdentitySchema`.
	 *
	 * @example
	 * const messages = await client.getMergedThreads("user123@msging.net", {
	 *   pagination: { take: 10, storageDate: "2024-01-15T10:00:00Z" },
	 *   direction: "asc"
	 * });
	 * @group Messages
	 */
	async getMergedThreads(contactIdentity: string, params?: GetMergedThreadsParams): Promise<MergedThreadMessage[]> {
		const identity = ContactIdentitySchema.parse(contactIdentity);

		const searchParams: Record<string, unknown> = {
			refreshExpiredMedia: true,
			...params,
		};

		if (params?.pagination) {
			const { take = 20, storageDate } = params.pagination;

			searchParams.$take = take;
			if (storageDate) searchParams.storageDate = storageDate;
		}

		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<MergedThreadMessage>>({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/threads-merged/${identity}${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource.items;
	}
}
