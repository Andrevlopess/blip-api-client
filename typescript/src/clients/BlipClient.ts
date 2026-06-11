import { AttendantsResources } from "../resources/attendants.js";
import { QueuesResources } from "../resources/queues.js";
import { BlipTransport, type BlipTransportConfig } from "./BlipTransport.js";

export class BlipClient {
	private transport: BlipTransport;

	public readonly attendants: AttendantsResources;
	public readonly queues: QueuesResources;

	constructor(config: BlipTransportConfig) {
		this.transport = new BlipTransport(config);

		this.attendants = new AttendantsResources(this.transport);
		this.queues = new QueuesResources(this.transport);
	}

	use(config: Partial<BlipTransportConfig>) {
		this.transport.setConfig(config);
		return this;
	}
}
