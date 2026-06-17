import { AttendantsResources } from "../resources/attendants.js";
import { BucketsResource } from "../resources/buckets.js";
import { ContactsResources } from "../resources/contacts.js";
import { DeskResources } from "../resources/desk.js";
import { FlowsResources } from "../resources/flows.js";
import { MediaResources } from "../resources/media.js";
import { MessagesResources } from "../resources/messages.js";
import { QueuesResources } from "../resources/queues/queues.js";
import { TicketsResources } from "../resources/tickets.js";
import { TrackingResources } from "../resources/trackings.js";
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

	/**
	 *  Manage attendants in your chatbot.
	 *  Available methods:
	 * - getAll
	 * - getByEmail
	 * - createOrUpdate
	 * - delete
	 * - getPermissions
	 * - setPermissions
	 * - setQueuesByEmail
	 */
	public readonly attendants: AttendantsResources;

	/** Manage queue assignments and routing.
	 *
	 * Available methods:
	 * - getAll
	 * - set
	 * - update
	 * - delete
	 *
	 */
	public readonly queues: QueuesResources;

	/** Create, update, and delete contacts.
	 *
	 * Available methods:
	 * - getAll
	 * - getByIdentity
	 * - createOrUpdate
	 * - delete
	 */
	public readonly contacts: ContactsResources;

	/** Read and write documents in the key-value bucket store.
	 *
	 * Available methods:
	 * - getDocumentCollection
	 * - getDocument
	 * - setDocument
	 * - deleteDocument
	 */
	public readonly buckets: BucketsResource;

	/** Send and query messages.
	 *
	 * Available methods:
	 * - sendMessage
	 * - sendEmail
	 * - getThreads
	 */
	public readonly messages: MessagesResources;

	/** Access and publish chatbot flows.
	 *
	 *  Available methods:
	 * - getAll
	 * - getById
	 * - create
	 * - updateMetadata
	 * - getFlowJson
	 * - updateFlowJson
	 * - publish
	 * - deprecate
	 * - uploadPublicKey
	 * - getUploadedPublicKey
	 */
	public readonly flows: FlowsResources;

	/** Manage support tickets.
	 *
	 * Available methods:
	 * - create
	 * - findById
	 * - transfer
	 * - close
	 * - setTags
	 * - getHistory
	 * - comment
	 * - getContactComments
	 */
	public readonly tickets: TicketsResources;

	/** Interact with the Blip Desk (human handoff) features.
	 *
	 * Available methods:
	 * - getAllOpenTickets
	 * - getAllWaitingTickets
	 * - getTicketSummary
	 * - getTicketMetrics
	 * - getAttendantsStatusMetrics
	 * - getAttendantsMetrics
	 * - getQueuesMetrics
	 * - getTagsMetrics
	 */
	public readonly desk: DeskResources;

	/** Interact with your trackings
	 *
	 *  Available methods:
	 * - create
	 * - getCategories
	 * - getCategoryCounters
	 * - getEventDetails
	 *
	 */
	public readonly trackings: TrackingResources;

	/** Create presigned urls to upload content in a pulic url
	 *
	 * Available methods:
	 * - getUploadUrl
	 * - refreshExpiredUrl
	 */
	public readonly media: MediaResources;

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
		this.trackings = new TrackingResources(this.transport);
		this.media = new MediaResources(this.transport);
	}

	/**
	 * Sends a custom command to the Blip API via the underlying transport layer.
	 *
	 * Use this method when the built-in resource methods do not cover your use
	 * case and you need to dispatch a raw command with a custom URI, method,
	 * or payload.
	 *
	 * @typeParam T - The expected shape of the {@link IBlipSuccessfulResponse} data payload.
	 *
	 * @param body - The command body to send, including the URI, method, and
	 *   optional resource payload.
	 *
	 * @returns A promise that resolves to a successful Blip response wrapping
	 *   the typed result `T`.
	 *
	 * @throws {BlipCommandError} If the API returns an error status or the
	 *   transport fails to deliver the command.
	 *
	 * @example
	 * ```typescript
	 * const response = await client.sendCustomCommand<MyResource>({
	 *   id: '1',
	 *   to: 'postmaster@msging.net',
	 *   method: 'get',
	 *   uri: '/custom/resource',
	 * });
	 *
	 * console.log(response.resource); // MyResource
	 * ```
	 */
	async sendCustomCommand<T>(body: IBlipCommandBody): Promise<IBlipSuccessfulResponse<T>> {
		return this.transport.sendCommand<T>(body);
	}
}
