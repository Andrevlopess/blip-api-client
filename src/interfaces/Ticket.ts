export interface CreatedTicket {
	id: string;
	sequentialId: number;
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
	closed: boolean;
	customerInput: Record<string, unknown>;
	priority: number;
}

export interface OpenTicket {
	agentIdentity: string;
	agentName: string;
	customerIdentity: string;
	customerName: string;
	firstResponseTime: string;
	hasFirstResponseTimeExceeded: boolean;
	hasQueueTimeExceeded: boolean;
	id: string;
	internalChatOpened: boolean;
	priority: number;
	queueTime: string;
	sequentialId: number;
	team: string;
	unreadInternalMessagesFromAgent: number;
}
export interface WaitingTicket {
	customerIdentity: string;
	customerName: string;
	hasQueueTimeExceeded: boolean;
	id: string;
	priority: number;
	queueTime: string;
	sequentialId: number;
	team: string;
}
export interface Ticket {
	id: string;
	sequentialId: number;
	ownerIdentity: string;
	customerIdentity: string;
	customerDomain: string;
	agentIdentity: string | null;
	provider: string;
	status: string;
	storageDate: string;
	openDate: string;
	statusDate: string;
	rating: number;
	team: string;
	unreadMessages: number;
	closed: boolean;
	parentSequentialId?: number;
	priority: number;
	isAutomaticDistribution: boolean;
	distributionType: string;
}

export interface TicketMonitoringSummary {
	waiting: number;
	open: number;
	closed: number;
	closedAttendant: number;
	closedClient: number;
	transferred: number;
	missed: number;
	inAttendance: number;
}
export interface AttendantStatusMetrics {
	invisible: number;
	offline: number;
	online: number;
	pause: number;
}

export interface TicketMetrics {
	maxQueueTime: string;
	maxFirstResponseTime: string;
	maxWithoutFirstResponseTime: string;

	avgQueueTime: string;
	avgFirstResponseTime: string;
	avgWaitTime: string;
	avgResponseTime: string;
	avgAttendanceTime: string;

	ticketsPerAttendant: string;
}
