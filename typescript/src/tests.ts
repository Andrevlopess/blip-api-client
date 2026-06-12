import { BlipClient } from "./clients/BlipClient.js";
import { jsonLog } from "./utils/jsonLog.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: "dGVzdGVpYTE1NzpVbUEzN2p5WDA2Zk9ZS2dHRUJkUQ==",
});

const res = await client.buckets.delete("roulette_attendants" );
// const res = await client.buckets.setDocument("roulette_attendants",{
//     type: 'application/json',
//     content: {
//         "teste": "fazoeli"
//     }
// } );


jsonLog(res);
