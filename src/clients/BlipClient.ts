import { AttendantsResources } from "../resources/attendants.js";
import { BucketsResource } from "../resources/buckets.js";
import { ContactsResources } from "../resources/contacts.js";
import { DeskResources } from "../resources/desk.js";
import { FlowsResources } from "../resources/flows.js";
import { MessagesResources } from "../resources/messages.js";
import { QueuesResources } from "../resources/queues/queues.js";
import { TicketsResources } from "../resources/tickets.js";
import type { IBlipCommandBody, IBlipSuccessfulResponse } from "../types/BlipCommands.js";
import type { BlipTransportConfig } from "../types/BlipTransportConfig.js";
import { BlipTransport } from "./BlipTransport.js";

/**
 * Main entry point for the Blip API.
 * Instantiate this class and access resources via its properties.
 *
 * @example
 * ```ts
 * const client = new BlipClient({ identifier: "...", accessKey: "..." });
 * const contacts = await client.contacts.findContact("user@domain.com");
 * ```
 */
export class BlipClient {
	private transport: BlipTransport;

	/** Manage attendants in your chatbot. */
	public readonly attendants: AttendantsResources;

	/** Manage queue assignments and routing. */
	public readonly queues: QueuesResources;

	/** Create, update, and delete contacts. */
	public readonly contacts: ContactsResources;

	/** Read and write documents in the key-value bucket store. */
	public readonly buckets: BucketsResource;

	/** Send and query messages. */
	public readonly messages: MessagesResources;

	/** Access and publish chatbot flows. */
	public readonly flows: FlowsResources;

	/** Manage support tickets. */
	public readonly tickets: TicketsResources;

	/** Interact with the Blip Desk (human handoff) features. */
	public readonly desk: DeskResources;

	/**
	 * @param config - Transport configuration including `identifier` and `accessKey`.
	 */
	constructor(config: BlipTransportConfig) {
		this.transport = new BlipTransport(config);

		this.attendants = new AttendantsResources(this.transport);
		this.queues = new QueuesResources(this.transport);
		this.contacts = new ContactsResources(this.transport);
		this.buckets = new BucketsResource(this.transport);
		this.messages = new MessagesResources(this.transport);
		this.tickets = new TicketsResources(this.transport);
		this.flows = new FlowsResources(this.transport);
		this.desk = new DeskResources(this.transport);
	}

	async sendCustomCommand<T>(body: IBlipCommandBody): Promise<IBlipSuccessfulResponse<T>> {
		return this.transport.sendCommand<T>(body);
	}
}
