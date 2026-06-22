export type CommandMethod = "set" | "get" | "merge" | "delete";
export type CommandStatus = "success" | "failure";

export type IBlipMutationResponse = BlipBaseResponse & { method: Omit<CommandMethod, "get"> };

export type IBlipGetResponse<T> = BlipBaseResponse & { type: string; resource: T };

export type IBlipSuccessfulResponse<T = never> = [T] extends [never] ? IBlipMutationResponse : IBlipGetResponse<T>;

export interface BlipBaseResponse {
	method: CommandMethod;
	status: "success";
	id: string;
	from: string;
	to: string;
	metadata: Record<string, any>;
}
export interface IBlipErrorResponsedata {
	method: CommandMethod;
	status: "failure";
	reason: {
		code: number;
		description: string;
	};
	id: string;
	from: string;
	to: string;
	metadata: Record<string, any>;
}

export interface IBlipCollectionResponse<T> {
	total: number;
	itemType: string;
	items: T[];
}
export interface IBlipCursorCollectionResponse<T> {
	hasMore: boolean;
	total: number;
	itemType: string;
	items: T[];
	nextCursor?: string
}

export type BlipCommandResponse<T> = IBlipSuccessfulResponse<T> | IBlipErrorResponsedata; 

export interface IBlipReadCommandBody {
	to: string;
	method: Extract<CommandMethod, "get">;
	uri: string;
}

export interface IBlipDeleteCommandBody {
	to: string;
	method: Extract<CommandMethod, "delete">;
	uri: string;
}

export interface IBlipWriteCommandBody {
	to: string;
	method: Extract<CommandMethod, "set" | "merge">;
	type: string;
	resource: Record<string, any> | string | Resource;
	uri: string;
}

export interface IBlipMessageBody {
	to: string;
	content: Record<string, any> | string;
	type: string;
	metadata?: Record<string, any>;
}

export type IBlipCommandBody = IBlipWriteCommandBody | IBlipReadCommandBody | IBlipDeleteCommandBody;

export type IBlipCustomCommandBody = IBlipCommandBody & {
	metadata?: Record<string, string>
}

export interface Resource {
	itemType: string,
	items: Record<string, any>[]
}