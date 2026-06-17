import type { BlipTransport } from "../clients/BlipTransport.js";
import type { ThreadMessage } from "../interfaces/Message.js";
import { ContactIdentitySchema } from "../schemas/ContactSchemas.js";
import {
	SendEmailSchema,
	SendMessageSchema,
	type SendEmailInput,
	type SendMessageInput,
} from "../schemas/MessagesSchemas.js";
import { PaginationSchema, type Pagination } from "../schemas/PaginationSchema.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";

interface GetThreadsParams {
	pagination: Partial<Pagination>;
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
}