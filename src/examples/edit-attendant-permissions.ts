import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: process.env.API_KEY,
});

const permission = await client.attendants.setPermissions("andre.lopes@skeps.com.br", [
	{
		ownerIdentity: "testeia157@msging.net",
		name: "canReadFullThreadMessages",
		isActive: true,
	},
]);
console.log(permission);
