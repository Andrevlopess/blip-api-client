import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: process.env.API_KEY ?? "",
});

interface MyCustomType {
	name: string;
	lastMessageDate: string;
	lastUpdateDate: string;
	identity: string;
	email: string;
	phoneNumber: string;
	extras?: Record<string, string>;
	taxDocument: string;
	tenantId: string;
	isGroupEnabled: boolean;
}

const merged = await client.sendCustomCommand<MyCustomType>({
	method: "merge",
	to: "postmaster@crm.msging.net",
	type: "application/vnd.lime.contact+json",
	uri: "/contacts/5500900000242@wa.gw.msging.net",
	resource: {
		identity: "5500900000242@wa.gw.msging.net",
		extras: {
			customExtras: "merged",
		},
	},
});

console.log(merged.resource);
