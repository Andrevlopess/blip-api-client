export interface Queue {
	id: string;
	ownerIdentity: string;
	name: string;
	isActive: true;
	storageDate: string;
	Priority: number;
	uniqueId: string;
}
export interface IQueueTag {
	attendanceQueueId: string;
	id: string;
	ownerIdentity: string;
	tag: string;
}
