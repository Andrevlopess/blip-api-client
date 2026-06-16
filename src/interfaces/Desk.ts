
export type AttendantStatus =  "Online" | "Offline" | "Away" | "Invisible"

export interface AttendantMetric {
	identity: string;
	status: AttendantStatus;

	isEnabled: boolean;

	agentName: string;

	openedTickets: number;
	closedTickets: number;
	ticketsCount: number;

	breakDurationInSeconds: number;

	currentStatusDateTime: string;

	averageAttendanceTime: string;
	averageResponseTime: string;
}

export interface QueuesMetrics {
	name: string;

	waitingTickets: number;
	openedTickets: number;
	closedTickets: number;
	ticketsCount: number;

	averageAttendanceTime: string;
	averageResponseTime: string;
}
export interface TagsMetrics {
	averageAttendanceTime: string;
	closedTickets: number;
	name: string;
}
