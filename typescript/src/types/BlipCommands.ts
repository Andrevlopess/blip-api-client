export type Method = "set" | "get" | "merge" | "delete";
export type Status = "success" | "failure";

export type IBlipSuccessfulResponse<T = never> = [T] extends [never]
	? BlipBaseResponse & { method: Omit<Method, "get"> }
	: BlipBaseResponse & { type: string; resource: T };

interface BlipBaseResponse {
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

export interface IPagination {
	take: number;
	skip: number;
}

export interface Resource {
	itemType: string,
	items: Record<string, any>[]
}