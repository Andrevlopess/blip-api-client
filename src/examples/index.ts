import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "uniasselvi",
	apiKey: "dml0cnVsZWFkczpOTENyVzlEakJnVGJVMnBPMElucg==",
	maxConcurrentRequests: 5,
});

const permissions = await client.sendCustomCommand({
	to: "postmaster@portal.blip.ai",
	method: "get",
	uri: `/applications/vitruleads@msging.net/permissions?$skip=0&$take=9999`,
	metadata: {
		"blip_portal.email": "andre.lopes@skeps.com.br",
	},
});

console.log(permissions.resource);
