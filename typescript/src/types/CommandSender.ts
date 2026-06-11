import type { IBlipCommandBody, IBlipSuccessfullResponse, IBlipMessageBody } from "./BlipCommands.js";

export interface ICommandSender {
	sendCommand<T>(body: IBlipCommandBody): Promise<IBlipSuccessfullResponse<T>>;
	sendMessage(body: IBlipMessageBody): Promise<void>;
}
