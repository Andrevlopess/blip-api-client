import { CommandError } from "../errors/CommandError.js";
import { api } from "../lib/api.js";
import type {
	BlipCommandResponse,
	IBlipCommandBody,
	IBlipMessageBody,
	IBlipSuccessfullResponse,
} from "../types/BlipCommands.js";

export interface BlipTransportConfig {
	tenant: string;
	apiKey: string;
}

export class BlipTransport {
	private tenant: string;
	private apiKey: string;

	constructor(config: BlipTransportConfig) {
		this.tenant = config.tenant;
		this.apiKey = config.apiKey;
	}

	setConfig({ tenant, apiKey }: Partial<BlipTransportConfig>) {
		if (tenant) this.tenant = tenant;
		if (apiKey) this.apiKey = apiKey;
	}

	public async sendCommand<T>(body: IBlipCommandBody): Promise<IBlipSuccessfullResponse<T>> {
		try {
			const id = crypto.randomUUID();

			const { data } = await api.post<BlipCommandResponse<T>>(
				`https://${this.tenant}.http.msging.net/commands`,
				{
					id,
					...body,
				},
				{
					headers: {
						Authorization: `Key ${this.apiKey}`,
					},
				},
			);

			if (data.status === "failure") {
				throw new CommandError(`BLIP command failed: ${data.reason.description} (${data.reason.code})`);
			}

			return data;
		} catch (error) {
			throw new CommandError(error instanceof Error ? error.message : undefined);
		}
	}

	public async sendMessage(body: IBlipMessageBody): Promise<void> {
		const id = crypto.randomUUID();

		const { status } = await api.post(
			`https://${this.tenant}.http.msging.net/messages`,
			{ id, ...body },
			{
				headers: {
					Authorization: `Key ${this.apiKey}`,
				},
			},
		);

		if (status !== 202) {
			throw new CommandError("Failed to send message");
		}
	}
}
