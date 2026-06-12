// export interface Contact {
// 	identity: string
// 	group: string
// 	name:  string
// 	extras: string
// 	email: string
// 	phoneNumber: string
// 	source: string
// 	taxDocument: string
// 	tenantId: string
// 	isGroupEnabled: string
// }

// export type CreateAttendantInput = Pick<Attendant, "email"> & {
// 	agentSlots?: number | null;
// 	teams?: string[];
// };
// export interface AttendantPermission {
// 	id: number;
// 	ownerIdentity: string;
// 	agentIdentity: string;
// 	name: string;
// 	isActive: boolean;
// }

// export type CreateAttendantPermission = Pick<AttendantPermission, "isActive" | "name" | "ownerIdentity">