import type { BlipTransportConfig } from "@/types/BlipTransportConfig.js";
import { BlipTransport } from "./BlipTransport.js";
import { AttendantsResources } from "@/resources/attendants.js";
import { QueuesResources } from "@/resources/queues.js";
import { ContactsResources } from "@/resources/contacts.js";
import { BucketsResource } from "@/resources/buckets.js";
import { MessagesResources } from "@/resources/messages.js";

export class BlipClient {
	private transport: BlipTransport;

	public readonly attendants: AttendantsResources;
	public readonly queues: QueuesResources;
	public readonly contacts: ContactsResources;
	public readonly buckets: BucketsResource;
	public readonly messages: MessagesResources;

	constructor(config: BlipTransportConfig) {
		this.transport = new BlipTransport(config);

		this.attendants = new AttendantsResources(this.transport);
		this.queues = new QueuesResources(this.transport);
		this.contacts = new ContactsResources(this.transport);
		this.buckets = new BucketsResource(this.transport);
		this.messages = new MessagesResources(this.transport);
	}

	useConfig(config: Partial<BlipTransportConfig>) {
		this.transport.setConfig(config);
		return this;
	}

}
