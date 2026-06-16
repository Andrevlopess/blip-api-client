import { AttendantsResources } from "../resources/attendants.js";
import { BucketsResource } from "../resources/buckets.js";
import { ContactsResources } from "../resources/contacts.js";
import { DeskResources } from "../resources/desk.js";
import { FlowsResources } from "../resources/flows.js";
import { MessagesResources } from "../resources/messages.js";
import { QueuesResources } from "../resources/queues/queues.js";
import { TicketsResources } from "../resources/tickets.js";
import type { BlipTransportConfig } from "../types/BlipTransportConfig.js";
import { BlipTransport } from "./BlipTransport.js";

export class BlipClient {
	private transport: BlipTransport;

	public readonly attendants: AttendantsResources;
	public readonly queues: QueuesResources;
	public readonly contacts: ContactsResources;
	public readonly buckets: BucketsResource;
	public readonly messages: MessagesResources;
	public readonly flows: FlowsResources;
	public readonly tickets: TicketsResources;
	public readonly desk: DeskResources;

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

	useConfig(config: Partial<BlipTransportConfig>) {
		this.transport.setConfig(config);
		return this;
	}
}
