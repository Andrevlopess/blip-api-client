export type Method = "set" | "get" | "merge" | "delete";
export type Status = "success" | "failure";

export interface IBlipSuccessfullResponse<T> {
	type: string;
	resource: T;
	method: Method;
	status: "success";
	id: string;
	from: string;
	to: string;
	metadata: Record<string, any>;
}

export interface IBlipErrorResponsedata {
	method: Method;
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

export type BlipCommandResponse<T> = IBlipSuccessfullResponse<T> | IBlipErrorResponsedata;

export interface IBlipReadCommandBody {
	to: string;
	method: Extract<Method, "get">;
	uri: string;
}

export interface IBlipDeleteCommandBody {
	to: string;
	method: Extract<Method, "delete">;
	uri: string;
}

export interface IBlipWriteCommandBody {
	to: string;
	method: Extract<Method, "set">;
	type: string;
	resource: Record<string, any> | string;
	uri: string;
}

export interface IBlipMessageBody {
	to: string;
	content: Record<string, any> | string;
	type: string;
	metadata?: Record<string, any>;
}

export type IBlipCommandBody = IBlipWriteCommandBody | IBlipReadCommandBody | IBlipDeleteCommandBody;
