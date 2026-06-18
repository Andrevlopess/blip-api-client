import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: process.env.API_KEY,
});

const res = await client.messages.getMergedThreads("5511954291628@wa.gw.msging.net", {
	pagination: {
		take: 3,
		storageDate: "2026-06-18T19:49:16.178Z",
	},
	direction: 'desc',
});

console.log(res);
