import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { Agent as HttpsAgent } from "https";

export const api = axios.create({
	httpsAgent: new HttpsAgent({
		keepAlive: true,
		keepAliveMsecs: 30000,
		maxSockets: 50,
		maxFreeSockets: 10,
	}),
	timeout: 20 * 1000,
} as AxiosRequestConfig);
