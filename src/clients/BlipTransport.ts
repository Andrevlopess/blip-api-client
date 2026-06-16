import type { BlipTransportConfig } from "@/types/BlipTransportConfig.js";
import pLimit, { type LimitFunction } from "p-limit";
import { CommandError } from "../errors/CommandError.js";
import { api } from "../lib/api.js";
import type {
	BlipCommandResponse,
	IBlipCommandBody,
	IBlipMessageBody,
	IBlipSuccessfulResponse,
} from "../types/BlipCommands.js";

export class BlipTransport {
	private tenant: string;
	private apiKey: string;
	private maxConcurrentRequests: number;
	private limit: LimitFunction;

	constructor({ apiKey, tenant, maxConcurrentRequests = 10 }: BlipTransportConfig) {
		this.tenant = tenant;
		this.apiKey = apiKey.startsWith("Key ") ? apiKey : `Key ${apiKey}`;
		this.maxConcurrentRequests = maxConcurrentRequests;

		this.limit = pLimit(this.maxConcurrentRequests);

		api.defaults.headers.common["Authorization"] = this.apiKey;
		api.defaults.headers.common["Content-Type"] = "application/json";
	}

	setConfig({ tenant, apiKey, maxConcurrentRequests }: Partial<BlipTransportConfig>) {
		if (tenant) this.tenant = tenant;
		if (apiKey) {
			this.apiKey = apiKey.startsWith("Key ") ? apiKey : `Key ${apiKey}`;
			api.defaults.headers.common["Authorization"] = this.apiKey;
		}
		if (maxConcurrentRequests) {
			this.maxConcurrentRequests = maxConcurrentRequests;
			this.limit = pLimit(this.maxConcurrentRequests);
		}
	}

	async sendCommand<T = never>(body: IBlipCommandBody): Promise<IBlipSuccessfulResponse<T>> {
		try {
			const id = crypto.randomUUID();

			return this.limit(async () => {
				console.log(`${body.method} command to ${body.uri}`);

				if (body.method !== "get") {
					console.log("body: ", body);
				}

				const { data } = await api.post<BlipCommandResponse<T>>(`https://${this.tenant}.http.msging.net/commands`, {
					id,
					...body,
				});

				if (data.status === "failure") {
					throw new CommandError(`BLIP command failed: ${data.reason.description} (${data.reason.code})`);
				}

				return data;
			});
		} catch (error) {
			if (error instanceof CommandError) throw error;
			throw new CommandError(error instanceof Error ? error.message : undefined);
		}
	}

	async sendMessage(body: IBlipMessageBody): Promise<void> {
		const id = crypto.randomUUID();

		return this.limit(async () => {
			const { status } = await api.post(`https://${this.tenant}.http.msging.net/messages`, { id, ...body });

			if (status !== 202) {
				throw new CommandError("Failed to send message");
			}
		});
	}

	buildSearchParams(params: string | string[][] | Record<string, string> | URLSearchParams) {
		if (!Object.keys(params).length) return "";
		return `?${new URLSearchParams(params).toString().replace(/\+/g, "%20")}`;
	}
}
