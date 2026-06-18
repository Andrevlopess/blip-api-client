export type Direction = "sent" | "received";

export type ThreadMessage = {
	id: string;
	direction: Direction;
	type: string;
	content: string;
	date: string;
	status: string;
	metadata: Record<string, unknown>;
}
export type TicketThreadMessage = {
	id: string;
	direction: Direction;
	type: string;
	content: {
		sequentialId: number;
		id: string;
		ownerIdentity: string;
		customerIdentity: string;
		customerDomain: string;
		provider: string;
		status: string;
		storageDate: string;
		externalId: string;
		rating: number;
		team: string;
		unreadMessages: number;
		closed: false;
		customerInput: {
			type: string;
			value: string;
		};
		priority: number;
	};
	date: string;
}

export type MergedThreadMessage = ThreadMessage | TicketThreadMessage;