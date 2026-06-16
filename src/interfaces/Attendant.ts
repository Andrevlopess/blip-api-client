export interface Attendant {
	identity: string;
	fullName: string;
	email: string;
	teams: string[];
	agentSlots: number | null;
	isEnabled: boolean;
}

export type CreateAttendantInput = Pick<Attendant, "email"> & {
	agentSlots?: number | null;
	teams?: string[];
};
export interface AttendantPermission {
	id: number;
	ownerIdentity: string;
	agentIdentity: string;
	name: string;
	isActive: boolean;
}

export type CreateAttendantPermission = Pick<AttendantPermission, "isActive" | "name" | "ownerIdentity">