import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

const queues = await client.queues.getAll();

const responses = await Promise.all(
	queues.map((queue) =>
		client.queues.rules.set({
			isActive: true,
			operator: "And",
			queueId: queue.id,
			relation: "Equals",
			team: queue.name,
			title: `Rule for queue ${queue.name}`,
			conditions: [
				{
					extrasProperty: "queue",
					property: "Contact.Extras.queue",
					relation: "Equals",
					values: [queue.name],
				},
			],
		}),
	),
);

const rules = await client.queues.rules.getAll("Default");

