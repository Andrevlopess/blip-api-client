import pLimit, { type LimitFunction } from "p-limit";
import { CommandError } from "../errors/CommandError.js";
import { api } from "../lib/api.js";
import type { BlipTransportConfig } from "../types/BlipTransportConfig.js";
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
	private isProduction: boolean;

	constructor({ apiKey, tenant, maxConcurrentRequests = 10 }: BlipTransportConfig) {
		this.tenant = tenant;
		this.apiKey = apiKey.startsWith("Key ") ? apiKey : `Key ${apiKey}`;
		this.maxConcurrentRequests = maxConcurrentRequests;

		this.limit = pLimit(this.maxConcurrentRequests);

		api.defaults.headers.common["Authorization"] = this.apiKey;
		api.defaults.headers.common["Content-Type"] = "application/json";
		this.isProduction = process.env.NODE_ENV === "production";
	}

	async sendCommand<T = never>(body: IBlipCommandBody): Promise<IBlipSuccessfulResponse<T>> {
		try {
			const id = crypto.randomUUID();

			return this.limit(async () => {
				
				if (!this.isProduction) {
					console.log(`${body.method} command to ${body.uri}`);

					if (body.method !== "get") {
						console.log("body: ", body);
					}
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

	buildSearchParams(params: string | string[][] | Record<string, unknown> | URLSearchParams) {
		if (typeof params !== "object" || !Object.keys(params).length) {
			return "";
		}

		const searchParams = Object.fromEntries(
			Object.entries(params).map(([key, value]) => [
				key,
				value == null ? "" : Array.isArray(value) ? value.join(",") : String(value),
			]),
		);

		return `?${new URLSearchParams(searchParams).toString().replace(/\+/g, "%20")}`;
	}
}
