import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

const res = await client.media.getUploadUrl()

const res2 = await client.media.refreshExpiredUrl(res)

console.log(res, res2);
