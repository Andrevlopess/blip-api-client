export type { BlipTransportConfig } from "./BlipTransportConfig.js";

// resources
export type { Contact, ContactFilter, ContactIdentity } from "../schemas/ContactSchemas.js";
export type {
	GetTicketsHistoryFilters,
	TicketCommentInput,
	TicketId,
	CloseTicketStatus,
	CreateTicketInput,
	CreateAttendanceTicket,
	TransferTicket,
	CloseTicketInput,
	AddTicketTags,
	FinishTicket,
	TicketHistoryParams,
	UserTicketHistory,
} from "../schemas/TicketSchemas.js";

export type { Pagination } from "../schemas/PaginationSchema.js";
export type { SendMessageInput, SendEmailInput } from "../schemas/MessagesSchemas.js";
export type { DocumentInput } from "../schemas/BucketSchemas.js";
export type {
	FlowCategory,
	CreateFlowInput,
	UpdateFlowMetadataInput,
	UploadPublicKeyInput,
	FlowJsonInput,
} from "../schemas/FlowsSchemas.js";

export type { CreateOrUpdateAttendantInput, AttendantPermissionInput } from "../schemas/AttendantSchemas.js";
export type { RoutingRuleInput, CreateQueueInput, UpdateQueueInput } from "../schemas/QueueSchemas.js";
export type { CreateTrackingInput, EventCounter, EventCountersFilters } from "../schemas/TrackingSchemas.js";
export type { ThreadMessage, MergedThreadMessage, TicketThreadMessage } from "../interfaces/Message.js";
