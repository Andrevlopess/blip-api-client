import type { FlowCategory } from "@/schemas/FlowsSchemas.js";

export interface Flows {
	name: string;
	status: string;
	id: string;
	categories: FlowCategory[];
	validation_errors: FlowsError[];
}
export interface DetailedFlows extends Flows {
	json_version: string;
	preview: {
		preview_url: string;
		expires_at: string;
	};
	whatsapp_business_account: {
		id: string;
		name: string;
		currency: string;
		timezone_id: string;
		message_template_namespace: string;
	};
	application: {
		id: string;
		name: string;
		link: string;
	};
}

export interface FlowsJsonResponse {
	name: string;
	asset_type: string;
	download_url: string;
}
export interface GetFlowsJsonResponse {
	data: FlowsJsonResponse[];
}

export interface IHeadersResponse {
	headers: IHeader[];
}

export interface IHeader {
	key: string;
	value: string[];
}

export interface FlowsError {
	error: string;
	error_type: string;
	message: string;
	line_start: number;
	line_end: number;
	column_start: number;
	column_end: number;
}
