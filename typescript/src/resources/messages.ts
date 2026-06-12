import type { ThreadMessage } from "@/interfaces/Message.js";
import { ContactIdentitySchema } from "@/schemas/ContactSchemas.js";
import {
	SendEmailSchema,
	SendMessageSchema,
	type SendEmailData,
	type SendMessageData,
} from "@/schemas/MessagesSchemas.js";
import type { BlipTransport } from "../clients/BlipTransport.js";
import type { IBlipCollectionResponse } from "../types/BlipCommands.js";
import { PaginationSchema, type Pagination } from "@/schemas/PaginationSchema.js";

interface GetThreadsParams {
	pagination: Partial<Pagination>;
}

export class MessagesResources {
	constructor(private readonly transport: BlipTransport) {}

	async sendMessage(data: SendMessageData): Promise<void> {
		const { to, content, type } = SendMessageSchema.parse(data);
		await this.transport.sendMessage({
			to,
			type,
			content,
		});
	}

	async sendEmail(data: SendEmailData): Promise<void> {
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
