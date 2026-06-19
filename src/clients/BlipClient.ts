import { AttendantsResources } from "../resources/attendants.js";
import { BucketsResource } from "../resources/buckets.js";
import { CampaignResources } from "../resources/campaigns.js";
import { ContactsResources } from "../resources/contacts.js";
import { DeskResources } from "../resources/desk.js";
import { FlowsResources } from "../resources/flows.js";
import { MediaResources } from "../resources/media.js";
import { MessagesResources } from "../resources/messages.js";
import { QueuesResources } from "../resources/queues/queues.js";
import { TicketsResources } from "../resources/tickets.js";
import { TrackingResources } from "../resources/trackings.js";
import { TransportConfigSchema } from "../schemas/TransportConfigSchema.js";
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
	 * - {@link AttendantsResources.getAll | getAll}
	 * - {@link AttendantsResources.getByEmail | getByEmail}
	 * - {@link AttendantsResources.createOrUpdate | createOrUpdate}
	 * - {@link AttendantsResources.delete | delete}
	 * - {@link AttendantsResources.getPermissions | getPermissions}
	 * - {@link AttendantsResources.setPermissions | setPermissions}
	 * - {@link AttendantsResources.setQueuesByEmail | setQueuesByEmail}
	 */
	public readonly attendants: AttendantsResources;

	/** Manage queue assignments and routing.
	 *
	 * Available methods:
	 * - {@link QueuesResources.getAll | getAll}
	 * - {@link QueuesResources.set | set}
	 * - {@link QueuesResources.update | update}
	 * - {@link QueuesResources.delete | delete}
	 *
	 */
	public readonly queues: QueuesResources;

	/** Create, update, and delete contacts.
	 *
	 * Available methods:
	 * - {@link ContactsResources.getAll | getAll}
	 * - {@link ContactsResources.getByIdentity | getByIdentity}
	 * - {@link ContactsResources.createOrUpdate | createOrUpdate}
	 * - {@link ContactsResources.delete | delete}
	 */
	public readonly contacts: ContactsResources;

	/** Read and write documents in the key-value bucket store.
	 *
	 * Available methods:
	 * - {@link BucketsResource.getDocumentCollection | getDocumentCollection}
	 * - {@link BucketsResource.getDocument | getDocument}
	 * - {@link BucketsResource.setDocument | setDocument}
	 * - {@link BucketsResource.deleteDocument | deleteDocument}
	 */
	public readonly buckets: BucketsResource;

	/** Send and query messages.
	 *
	 * Available methods:
	 * - {@link MessagesResources.sendMessage | sendMessage}
	 * - {@link MessagesResources.sendEmail | sendEmail}
	 * - {@link MessagesResources.getThreads | getThreads}
	 * - {@link MessagesResources.getMergedThreads | getMergedThreads}
	 */
	public readonly messages: MessagesResources;

	/** Access and publish chatbot flows.
	 *
	 * Available methods:
	 * - {@link FlowsResources.getAll | getAll}
	 * - {@link FlowsResources.getById | getById}
	 * - {@link FlowsResources.create | create}
	 * - {@link FlowsResources.updateMetadata | updateMetadata}
	 * - {@link FlowsResources.getFlowJson | getFlowJson}
	 * - {@link FlowsResources.updateFlowJson | updateFlowJson}
	 * - {@link FlowsResources.publish | publish}
	 * - {@link FlowsResources.deprecate | deprecate}
	 * - {@link FlowsResources.uploadPublicKey | uploadPublicKey}
	 * - {@link FlowsResources.getUploadedPublicKey | getUploadedPublicKey}
	 */
	public readonly flows: FlowsResources;

	/** Manage support tickets.
	 *
	 * Available methods:
	 * - {@link TicketsResources.create | create}
	 * - {@link TicketsResources.findById | findById}
	 * - {@link TicketsResources.transfer | transfer}
	 * - {@link TicketsResources.close | close}
	 * - {@link TicketsResources.setTags | setTags}
	 * - {@link TicketsResources.getHistory | getHistory}
	 * - {@link TicketsResources.comment | comment}
	 * - {@link TicketsResources.getContactComments | getContactComments}
	 */
	public readonly tickets: TicketsResources;

	/** Interact with the Blip Desk (human handoff) features.
	 *
	 * Available methods:
	 * - {@link DeskResources.getAllOpenTickets | getAllOpenTickets}
	 * - {@link DeskResources.getAllWaitingTickets | getAllWaitingTickets}
	 * - {@link DeskResources.getTicketSummary | getTicketSummary}
	 * - {@link DeskResources.getTicketMetrics | getTicketMetrics}
	 * - {@link DeskResources.getAttendantsStatusMetrics | getAttendantsStatusMetrics}
	 * - {@link DeskResources.getAttendantsMetrics | getAttendantsMetrics}
	 * - {@link DeskResources.getQueuesMetrics | getQueuesMetrics}
	 * - {@link DeskResources.getTagsMetrics | getTagsMetrics}
	 */
	public readonly desk: DeskResources;

	/** Interact with your trackings.
	 *
	 * Available methods:
	 * - {@link TrackingResources.create | create}
	 * - {@link TrackingResources.getCategories | getCategories}
	 * - {@link TrackingResources.getCategoryCounters | getCategoryCounters}
	 * - {@link TrackingResources.getEventDetails | getEventDetails}
	 */
	public readonly trackings: TrackingResources;

	/** Create presigned URLs to upload content to a public URL.
	 *
	 * Available methods:
	 * - {@link MediaResources.getUploadUrl | getUploadUrl}
	 * - {@link MediaResources.refreshExpiredUrl | refreshExpiredUrl}
	 */
	public readonly media: MediaResources;
	/** Create, Schedule, list and delete active campaigns
	 *
	 * Available methods:
	 * - {@link CampaignResources.create | create}
	 * - {@link CampaignResources.getById | getById}
	 * - {@link CampaignResources.getAll | getAll}
	 * - {@link CampaignResources.getAllSummaries | getAllSummaries}
	 * - {@link CampaignResources.getSummary | getSummary}
	 * - {@link CampaignResources.getAudience | getAudience}
	 * - {@link CampaignResources.getReport | getReport}
	 * - {@link CampaignResources.getCampaignMessages | getCampaignMessages}
	 * - {@link CampaignResources.delete | delete}
	 */
	public readonly campaign: CampaignResources;

	/**
	 * @param config - Transport configuration including `identifier` and `accessKey`.
	 */
	constructor(config: BlipTransportConfig) {
		const parsedConfig = TransportConfigSchema.parse(config);

		this.transport = new BlipTransport(parsedConfig);

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
		this.campaign = new CampaignResources(this.transport);
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
