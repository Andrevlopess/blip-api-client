import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

const permission = await client.attendants.setPermissions("andre.lopes@skeps.com.br", [
	{
		ownerIdentity: "testeia157@msging.net",
		name: "canReadFullThreadMessages",
		isActive: true,
	},
]);
console.log(permission);
