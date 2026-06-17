import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

const tickets = await client.desk.getAllOpenTickets({
	filters: {
		teams: ["Default", "teste"],
		agentIdentities: ["andre.lopes%40skeps.com.br@blip.ai"],
		ticketSequentialId: [2756]
	},
});

console.log(tickets); 