import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: process.env.API_KEY,
});

const aMonthAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

const tickets = await client.tickets.getHistory({
	filters: {
		beginDate: aMonthAgo.toISOString(),
		endDate: new Date().toISOString(),
		teams: ["Fila 1", "Fila 2"],
	},
});

console.log(tickets);
