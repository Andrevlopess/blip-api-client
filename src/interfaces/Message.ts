export interface ThreadMessage {
	id: string;
	direction: "sent" | "received";
	type: string;
	content: string;
	date: string;
	status: string;
	metadata: Record<string, unknown>;
}
