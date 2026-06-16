# Resources Overview

## Queues

```ts
client.queues
```

| Method | Description |
|----------|-------------|
| findAll | Retrieve all attendance queues |
| set | Create a new attendance queue |
| update | Update an existing attendance queue |
| delete | Delete an attendance queue |

### Queue Tags

```ts
client.queues.tags
```

| Method | Description |
|----------|-------------|
| findQueueTags | Retrieve all tags associated with a queue |
| setQueueTags | Replace all tags associated with a queue |

### Queue Rules

```ts
client.queues.rules
```

| Method | Description |
|----------|-------------|
| findAll | Retrieve routing rules for a queue |
| set | Create or update a routing rule |
| delete | Delete a routing rule |

---

## Attendants

```ts
client.attendants
```

| Method | Description |
|----------|-------------|
| findAll | Retrieve all attendants |
| findByEmail | Retrieve an attendant by email |
| createOrUpdate | Create or update an attendant |
| delete | Delete an attendant |
| findPermissions | Retrieve an attendant's permissions |
| setPermissions | Assign permissions to an attendant |
| setQueuesByEmail | Assign queues to an attendant |

---

## Contacts

```ts
client.contacts
```

| Method | Description |
|----------|-------------|
| findAll | Retrieve contacts with pagination and filtering |
| findByIdentity | Retrieve a contact by identity |
| createOrUpdate | Create or update a contact |
| delete | Delete a contact |

---

## Messages

```ts
client.messages
```

| Method | Description |
|----------|-------------|
| sendMessage | Send a message to a destination |
| sendEmail | Send an email |
| getThreads | Retrieve conversation messages from a contact thread |

---

## WhatsApp Flows

```ts
client.flows
```

| Method | Description |
|----------|-------------|
| findAll | Retrieve all WhatsApp Flows |
| findById | Retrieve a WhatsApp Flow by ID |
| create | Create a new WhatsApp Flow |
| updateMetadata | Update Flow metadata |
| getFlowJson | Retrieve a Flow JSON definition |
| updateFlowJson | Update a Flow JSON definition |
| publish | Publish a WhatsApp Flow |
| deprecate | Deprecate a WhatsApp Flow |
| uploadPublicKey | Upload a Flow public key |
| getUploadedPublicKey | Retrieve the uploaded public key |

---

## Buckets

```ts
client.buckets
```

| Method | Description |
|----------|-------------|
| findDocumentCollection | Retrieve all stored bucket document keys |
| findDocument | Retrieve a document by key |
| setDocument | Create or update a document |
| deleteDocument | Delete a document |
```

# Queues

```ts
client.queues
```

Manage Desk attendance queues.

The `QueuesResources` class provides methods for creating, updating, listing, and deleting attendance queues. It also exposes nested resources for queue rules and tags.

## Nested Resources

### Rules

```ts
client.queues.rules
```

Manage queue routing rules.

### Tags

```ts
client.queues.tags
```

Manage queue tags.

---

# findAll

Retrieve all attendance queues.

## Usage

```ts
const queues = await client.queues.findAll();
```

With pagination:

```ts
const queues = await client.queues.findAll({
  pagination: {
    skip: 0,
    take: 50,
  },
});
```

## Signature

```ts
findAll(
  params?: {
    pagination?: Partial<Pagination>;
  }
): Promise<Queue[]>
```

## Parameters

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |

## Validation

The pagination object is validated using:

```ts
PaginationSchema
```

Default values:

```ts
{
  skip: 0,
  take: 9999
}
```

## Returns

```ts
Promise<Queue[]>
```

## Underlying Request

```http
GET /attendance-queues?ascending=true
```

With pagination:

```http
GET /attendance-queues?ascending=true&$skip=0&$take=50
```

## Description

Returns all attendance queues available in the Desk account.

---

# set

Create a new attendance queue.

## Usage

```ts
const queue = await client.queues.set({
  name: "Support",
  isActive: true,
});
```

## Signature

```ts
set(data: CreateQueueData): Promise<Queue>
```

## Parameters

### data

| Property | Type | Required |
|----------|------|----------|
| Depends on `CreateQueueData` | CreateQueueData | Yes |

## Validation

The payload is validated using:

```ts
CreateQueueSchema
```

## Returns

```ts
Promise<Queue>
```

## Underlying Request

```http
SET /attendance-queues
```

## Content Type

```http
application/vnd.iris.desk.attendancequeue+json
```

## Description

Creates a new attendance queue and returns the created queue resource.

---

# update

Update an existing attendance queue.

## Usage

```ts
const queue = await client.queues.update({
  id: "queue-id",
  name: "Premium Support",
  isActive: true,
});
```

## Signature

```ts
update(data: UpdateQueueData): Promise<Queue>
```

## Parameters

### data

| Property | Type | Required |
|----------|------|----------|
| Depends on `UpdateQueueData` | UpdateQueueData | Yes |

## Validation

The payload is validated using:

```ts
UpdateQueueSchema
```

The queue identifier is mapped internally to:

```ts
{
  uniqueId: data.id
}
```

## Returns

```ts
Promise<Queue>
```

## Underlying Request

```http
SET /attendance-queues
```

## Content Type

```http
application/vnd.iris.desk.attendancequeue+json
```

## Description

Updates an existing attendance queue and returns the updated queue resource.

---

# delete

Delete an attendance queue.

## Usage

```ts
await client.queues.delete("queue-id");
```

## Signature

```ts
delete(queueId: string): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| queueId | string | Yes | Queue identifier |

## Validation

The queue identifier is validated using:

```ts
QueueIdSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## Underlying Request

```http
DELETE /attendance-queues/:id
```

Example:

```http
DELETE /attendance-queues/123456
```

## Description

Deletes an attendance queue by its identifier.

# Queue Rules

```ts
client.queues.rules
```

Manage attendance queue routing rules.

Routing rules determine how conversations are automatically routed to queues.

---

# findAll

Retrieve all routing rules associated with a queue.

## Usage

```ts
const rules = await client.queues.rules.findAll("Support");
```

With pagination:

```ts
const rules = await client.queues.rules.findAll("Support", {
  pagination: {
    skip: 0,
    take: 50,
  },
});
```

## Signature

```ts
findAll(
  queueName: string,
  params?: {
    pagination?: Partial<Pagination>;
    ascending?: boolean;
  }
): Promise<IQueueTag[]>
```

## Parameters

### queueName

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Queue name |

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |
| ascending | boolean | No | Currently ignored by the implementation |

## Validation

Pagination parameters are validated using:

```ts
PaginationSchema
```

Default values:

```ts
{
  skip: 0,
  take: 9999
}
```

## Returns

```ts
Promise<IQueueTag[]>
```

## Underlying Request

```http
GET /rules/queue/:queueName
```

Example:

```http
GET /rules/queue/Support
```

With pagination:

```http
GET /rules/queue/Support?$skip=0&$take=50
```

## Description

Returns all routing rules configured for the specified queue.

---

# set

Create or update a routing rule.

## Usage

Create a new rule:

```ts
await client.queues.rules.set({
  conditions: [...],
  action: {
    type: "redirect",
    queue: "Support",
  },
});
```

Update an existing rule:

```ts
await client.queues.rules.set({
  id: "a4d5df07-b28e-4b5c-b8f6-7eb8e8ef8b4c",
  conditions: [...],
  action: {
    type: "redirect",
    queue: "Premium Support",
  },
});
```

## Signature

```ts
set(rule: RoutingRule): Promise<IBlipSuccessfulResponse>
```

## Parameters

### rule

| Type | Required |
|------|----------|
| RoutingRule | Yes |

## Validation

The payload is validated using:

```ts
RoutingRuleSchema
```

If no rule identifier is provided, one is generated automatically:

```ts
{
  id: crypto.randomUUID()
}
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## Underlying Request

```http
SET /rules
```

## Content Type

```http
application/vnd.iris.desk.rule+json
```

## Description

Creates a new routing rule or updates an existing one.

---

# delete

Delete a routing rule.

## Usage

```ts
await client.queues.rules.delete(
  "a4d5df07-b28e-4b5c-b8f6-7eb8e8ef8b4c"
);
```

## Signature

```ts
delete(ruleId: string): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| ruleId | string | Yes | Routing rule identifier |

## Validation

The identifier is validated as a UUID:

```ts
z.uuid()
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## Underlying Request

```http
DELETE /rules/:id
```

## Description

Deletes a routing rule by its identifier.

# Queue Tags

```ts
client.queues.tags
```

Manage attendance queue tags.

Tags can be used to categorize queues and support routing, reporting, and filtering scenarios.

---

# findQueueTags

Retrieve all tags associated with a queue.

## Usage

```ts
const tags = await client.queues.tags.findQueueTags(
  "queue-id"
);
```

With pagination:

```ts
const tags = await client.queues.tags.findQueueTags(
  "queue-id",
  {
    pagination: {
      skip: 0,
      take: 50,
    },
  }
);
```

## Signature

```ts
findQueueTags(
  queueId: string,
  params?: {
    pagination?: Partial<Pagination>;
  }
): Promise<IQueueTag[]>
```

## Parameters

### queueId

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Queue identifier |

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |

## Validation

The queue identifier is validated using:

```ts
QueueIdSchema
```

Pagination parameters are validated using:

```ts
PaginationSchema
```

Default values:

```ts
{
  skip: 0,
  take: 9999
}
```

## Returns

```ts
Promise<IQueueTag[]>
```

## Underlying Request

```http
GET /attendance-queues/:id/tags
```

## Description

Returns all tags associated with the specified attendance queue.

---

# setQueueTags

Replace all tags associated with a queue.

## Usage

```ts
await client.queues.tags.setQueueTags(
  "queue-id",
  [
    "support",
    "premium",
    "billing",
  ]
);
```

## Signature

```ts
setQueueTags(
  queueId: string,
  tags: string[]
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### queueId

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Queue identifier |

### tags

| Type | Required | Description |
|------|----------|-------------|
| string[] | Yes | List of tags to associate with the queue |

## Validation

The queue identifier is validated using:

```ts
QueueIdSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## Underlying Request

```http
SET /attendance-queues/:id/tags
```

## Description

Replaces the queue's current tag collection with the provided tags.

# Attendants

```ts
client.attendants
```

Manage Desk attendants, permissions, and queue assignments.

Attendants are the agents responsible for handling conversations in Desk.

---

# findAll

Retrieve all attendants.

## Usage

```ts
const attendants = await client.attendants.findAll();
```

Filter by teams:

```ts
const attendants = await client.attendants.findAll({
  teams: ["Support", "Sales"],
});
```

With pagination:

```ts
const attendants = await client.attendants.findAll({
  pagination: {
    skip: 0,
    take: 100,
  },
});
```

## Signature

```ts
findAll(
  params?: {
    pagination?: Partial<Pagination>;
    teams?: string[];
  }
): Promise<Attendant[]>
```

## Parameters

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |
| teams | string[] | No | Filter attendants by teams |

## Validation

Pagination parameters are validated using:

```ts
PaginationSchema
```

## Returns

```ts
Promise<Attendant[]>
```

## URI

```http
/agents/v2
```

## Description

Returns all attendants, optionally filtered by teams.

---

# findByEmail

Retrieve an attendant by email.

## Usage

```ts
const attendant = await client.attendants.findByEmail(
  "john.doe@gmail.com"
);
```

## Signature

```ts
findByEmail(
  attendantEmail: string
): Promise<Attendant | null>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| attendantEmail | string | Yes | Attendant email without the `@blip.ai` suffix |

## Validation

Validated using:

```ts
AttendantEmailSchema
```

## Returns

```ts
Promise<Attendant | null>
```

## URI

```http
/attendants
```

## Description

Searches for an attendant by email and returns the first matching result.

---

# createOrUpdate

Create a new attendant or update an existing one.

## Usage

```ts
await client.attendants.createOrUpdate({
  email: "john.doe@gmail.com",
  fullName: "John Doe",
});
```

## Signature

```ts
createOrUpdate(
  data: CreateOrUpdateAttendantData
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### data

| Type | Required |
|------|----------|
| CreateOrUpdateAttendantData | Yes |

## Validation

Validated using:

```ts
CreateOrUpdateAttendantSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/attendants
```

## Description

Creates a new attendant or updates an existing attendant.

---

# delete

Delete an attendant.

## Usage

```ts
await client.attendants.delete("john.doe@gmail.com");
```

## Signature

```ts
delete(
  attendantEmail: string
): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| attendantEmail | string | Yes | Attendant email without the `@blip.ai` suffix |

## Validation

Validated using:

```ts
AttendantEmailSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/attendants/:identity
```

## Description

Deletes an attendant by email.

---

# findPermissions

Retrieve an attendant's permissions.

## Usage

```ts
const permissions =
  await client.attendants.findPermissions(
    "john.doe"
  );
```

## Signature

```ts
findPermissions(
  attendantEmail: string
): Promise<AttendantPermission[]>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| attendantEmail | string | Yes | Attendant email without the `@blip.ai` suffix |

## Validation

Validated using:

```ts
AttendantEmailSchema
```

## Returns

```ts
Promise<AttendantPermission[]>
```

## URI

```http
/agent/:identity/permission
```

## Description

Returns all permissions assigned to an attendant.

---

# setPermissions

Assign permissions to an attendant.

## Usage

```ts
await client.attendants.setPermissions(
  "john.doe@gmail.com",
  [
    {
      type: "TransferAttendance",
      isAllowed: true,
    },
  ]
);
```

## Signature

```ts
setPermissions(
  attendantEmail: string,
  permissions: CreateAttendantPermission[]
): Promise<
  IBlipSuccessfulResponse<
    IBlipCollectionResponse<AttendantPermission>
  >
>
```

## Parameters

### attendantEmail

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Attendant email without the `@blip.ai` suffix |

### permissions

| Type | Required | Description |
|------|----------|-------------|
| CreateAttendantPermission[] | Yes | Permissions to assign |

## Validation

The email is validated using:

```ts
AttendantEmailSchema
```

Permissions are validated using:

```ts
z.array(AttendantPermissionSchema)
```

## Returns

```ts
Promise<
  IBlipSuccessfulResponse<
    IBlipCollectionResponse<AttendantPermission>
  >
>
```

## URI

```http
/agent/permissions
```

## Description

Assigns one or more permissions to an attendant.

---

# setQueuesByEmail

Assign queues to an attendant.

## Usage

```ts
await client.attendants.setQueuesByEmail(
  "john.doe",
  [
    "Support",
    "Sales",
  ]
);
```

## Signature

```ts
setQueuesByEmail(
  attendantEmail: string,
  queues: string[]
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### attendantEmail

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Attendant email without the `@blip.ai` suffix |

### queues

| Type | Required | Description |
|------|----------|-------------|
| string[] | Yes | Queue names |

## Validation

The email is validated using:

```ts
AttendantEmailSchema
```

Queue assignments are validated using:

```ts
AttendantQueuesSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/attendants
```

## Description

Assigns one or more queues to an attendant.

# WhatsApp Flows

```ts
client.flows
```

Manage WhatsApp Flows.

WhatsApp Flows allow you to build interactive experiences that can be presented directly inside WhatsApp conversations.

---

# findAll

Retrieve all WhatsApp Flows.

## Usage

```ts
const flows = await client.flows.findAll();
```

## Signature

```ts
findAll(): Promise<Flows[]>
```

## Returns

```ts
Promise<Flows[]>
```

## URI

```http
/whatsapp-flows
```

## Description

Returns all WhatsApp Flows available in the current WhatsApp Business Account.

---

# findById

Retrieve a WhatsApp Flow by its identifier.

## Usage

```ts
const flow = await client.flows.findById(
  "1538437607759409"
);
```

## Signature

```ts
findById(
  flowId: string
): Promise<DetailedFlows>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| flowId | string | Yes | WhatsApp Flow identifier |

## Validation

Validated using:

```ts
FlowIdSchema
```

## Returns

```ts
Promise<DetailedFlows>
```

## URI

```http
/whatsapp-flows/:id
```

## Description

Returns detailed information about a WhatsApp Flow.

---

# create

Create a new WhatsApp Flow.

## Usage

```ts
const flow = await client.flows.create({
  name: "Lead Capture",
  categories: ["LEAD_GENERATION"],
});
```

## Signature

```ts
create(
  input: CreateFlowInput
): Promise<{ id: string }>
```

## Parameters

### input

| Type | Required |
|------|----------|
| CreateFlowInput | Yes |

## Validation

Validated using:

```ts
CreateFlowSchema
```

## Returns

```ts
Promise<{
  id: string;
}>
```

## URI

```http
/whatsapp-flows
```

## Description

Creates a new WhatsApp Flow and returns its identifier.

---

# updateMetadata

Update a WhatsApp Flow's metadata.

## Usage

```ts
await client.flows.updateMetadata(
  "1538437607759409",
  {
    name: "Updated Flow Name",
  }
);
```

## Signature

```ts
updateMetadata(
  flowId: string,
  input: UpdateFlowMetadataInput
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### flowId

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | WhatsApp Flow identifier |

### input

| Type | Required |
|------|----------|
| UpdateFlowMetadataInput | Yes |

## Validation

The flow identifier is validated using:

```ts
FlowIdSchema
```

The payload is validated using:

```ts
UpdateFlowMetadataSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/whatsapp-flows/:id
```

## Description

Updates metadata such as name, categories, and endpoint configuration.

---

# getFlowJson

Retrieve a Flow JSON definition.

## Usage

```ts
const flowJson =
  await client.flows.getFlowJson(
    "1538437607759409"
  );
```

## Signature

```ts
getFlowJson(
  flowId: string
): Promise<FlowsJsonResponse | undefined>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| flowId | string | Yes | WhatsApp Flow identifier |

## Validation

Validated using:

```ts
FlowIdSchema
```

## Returns

```ts
Promise<FlowsJsonResponse | undefined>
```

## URI

```http
/whatsapp-flows/assets/:id
```

## Description

Returns the JSON definition currently associated with a WhatsApp Flow.

---

# updateFlowJson

Update a Flow JSON definition.

## Usage

```ts
await client.flows.updateFlowJson(
  "1538437607759409",
  {
    version: "7.1",
    screens: [],
  }
);
```

## Signature

```ts
updateFlowJson(
  flowId: string,
  flowJson: FlowJsonInput
): Promise<IHeadersResponse>
```

## Parameters

### flowId

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | WhatsApp Flow identifier |

### flowJson

| Type | Required |
|------|----------|
| FlowJsonInput | Yes |

## Validation

The flow identifier is validated using:

```ts
FlowIdSchema
```

The Flow JSON is validated using:

```ts
FlowJsonSchema
```

## Returns

```ts
Promise<IHeadersResponse>
```

## URI

```http
/whatsapp-flows/flow-json/:id
```

## Description

Uploads a new Flow JSON definition to a WhatsApp Flow.

---

# publish

Publish a WhatsApp Flow.

## Usage

```ts
await client.flows.publish(
  "1538437607759409"
);
```

## Signature

```ts
publish(
  flowId: string
): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| flowId | string | Yes | WhatsApp Flow identifier |

## Validation

Validated using:

```ts
FlowIdSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/whatsapp-flows/publish/:id
```

## Description

Publishes a WhatsApp Flow, making it available for use.

---

# deprecate

Deprecate a WhatsApp Flow.

## Usage

```ts
await client.flows.deprecate(
  "1538437607759409"
);
```

## Signature

```ts
deprecate(
  flowId: string
): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| flowId | string | Yes | WhatsApp Flow identifier |

## Validation

Validated using:

```ts
FlowIdSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/whatsapp-flows/deprecate/:id
```

## Description

Marks a WhatsApp Flow as deprecated.

---

# uploadPublicKey

Upload a business public key.

## Usage

```ts
await client.flows.uploadPublicKey({
  businessPublicKey:
    "-----BEGIN PUBLIC KEY-----..."
});
```

## Signature

```ts
uploadPublicKey(
  input: UploadPublicKeyInput
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### input

| Type | Required |
|------|----------|
| UploadPublicKeyInput | Yes |

## Validation

Validated using:

```ts
UploadPublicKeySchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/whatsapp-flows/public-key/upload
```

## Description

Uploads the public key used for Flow endpoint encryption.

---

# getUploadedPublicKey

Retrieve the currently uploaded public key.

## Usage

```ts
const publicKey =
  await client.flows.getUploadedPublicKey();
```

## Signature

```ts
getUploadedPublicKey(): Promise<unknown>
```

## Returns

```ts
Promise<unknown>
```

## URI

```http
/whatsapp-flows/public-key/upload
```

## Description

Returns the public key currently associated with the WhatsApp Business Account.

# Contacts

```ts
client.contacts
```

Manage CRM contacts.

Contacts represent end users and store profile information such as name, email, phone number, and custom extras.

---

# findAll

Retrieve contacts.

## Usage

Retrieve the first page:

```ts
const contacts = await client.contacts.findAll();
```

With pagination:

```ts
const contacts = await client.contacts.findAll({
  pagination: {
    skip: 0,
    take: 50,
  },
});
```

Filter contacts:

```ts
const contacts = await client.contacts.findAll({
  filter: {
    key: "name",
    comparator: "startsWith",
    value: "John",
  },
});
```

## Signature

```ts
findAll(
  params?: {
    pagination?: Partial<Pagination>;
    filter?: ContactFilter;
  }
): Promise<IBlipCursorCollectionResponse<Contact>>
```

## Parameters

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |
| filter | ContactFilter | No | Contact filtering criteria |

## Validation

Pagination parameters are validated using:

```ts
PaginationSchema
```

Filters are validated using:

```ts
ContactFilterSchema
```

Default values:

```ts
{
  skip: 0,
  take: 20
}
```

## Returns

```ts
Promise<
  IBlipCursorCollectionResponse<Contact>
>
```

## URI

```http
/contacts-cursor
```

## Description

Returns a paginated collection of contacts. Supports filtering by contact properties.

---

# findByIdentity

Retrieve a contact by identity.

## Usage

```ts
const contact =
  await client.contacts.findByIdentity(
    "5511999999999@wa.gw.msging.net"
  );
```

## Signature

```ts
findByIdentity(
  contactIdentity: string
): Promise<Contact | null>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| contactIdentity | string | Yes | Contact identity |

## Validation

Validated using:

```ts
ContactIdentitySchema
```

## Returns

```ts
Promise<Contact | null>
```

## URI

```http
/contacts/:identity
```

## Description

Returns a contact by its identity.

---

# createOrUpdate

Create a new contact or update an existing one.

## Usage

```ts
await client.contacts.createOrUpdate({
  identity:
    "5511999999999@wa.gw.msging.net",
  name: "John Doe",
});
```

## Signature

```ts
createOrUpdate(
  data: Contact
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### data

| Type | Required |
|------|----------|
| Contact | Yes |

## Validation

Validated using:

```ts
ContactSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/contacts
```

## Description

Creates a new contact or updates an existing contact.

---

# delete

Delete a contact.

## Usage

```ts
await client.contacts.delete(
  "5511999999999@wa.gw.msging.net"
);
```

## Signature

```ts
delete(
  contactIdentity: string
): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| contactIdentity | string | Yes | Contact identity |

## Validation

Validated using:

```ts
ContactIdentitySchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/contacts/:identity
```

## Description

Deletes a contact by its identity.

# Messages

```ts
client.messages
```

Send messages, send emails, and retrieve conversation threads.

This resource provides utilities for interacting with contacts through BLiP messaging channels and email gateways.

---

# sendMessage

Send a message to a destination.

## Usage

```ts
await client.messages.sendMessage({
  to: "5511999999999@wa.gw.msging.net",
  type: "text/plain",
  content: "Hello!",
});
```

## Signature

```ts
sendMessage(
  data: SendMessageData
): Promise<void>
```

## Parameters

### data

| Type | Required |
|------|----------|
| SendMessageData | Yes |

## Validation

Validated using:

```ts
SendMessageSchema
```

## Returns

```ts
Promise<void>
```

## Description

Sends a message to the specified destination.

---

# sendEmail

Send an email.

## Usage

Single recipient:

```ts
await client.messages.sendEmail({
  to: "john@example.com",
  subject: "Welcome",
  type: "text/plain",
  content: "Welcome to our platform!",
});
```

Multiple recipients:

```ts
await client.messages.sendEmail({
  to: [
    "john@example.com",
    "jane@example.com",
  ],
  subject: "Announcement",
  type: "text/plain",
  content: "Important update",
});
```

## Signature

```ts
sendEmail(
  data: SendEmailData
): Promise<void>
```

## Parameters

### data

| Type | Required |
|------|----------|
| SendEmailData | Yes |

## Validation

Validated using:

```ts
SendEmailSchema
```

## Returns

```ts
Promise<void>
```

## Description

Sends an email through BLiP's Mailgun gateway.

---

# getThreads

Retrieve conversation messages from a contact thread.

## Usage

```ts
const messages =
  await client.messages.getThreads(
    "5511999999999@wa.gw.msging.net"
  );
```

With pagination:

```ts
const messages =
  await client.messages.getThreads(
    "5511999999999@wa.gw.msging.net",
    {
      pagination: {
        skip: 0,
        take: 100,
      },
    }
  );
```

## Signature

```ts
getThreads(
  contactIdentity: string,
  params?: {
    pagination: Partial<Pagination>;
  }
): Promise<ThreadMessage[]>
```

## Parameters

### contactIdentity

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Contact identity |

### params

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pagination.skip | number | No | Number of records to skip |
| pagination.take | number | No | Number of records to return |

## Validation

The contact identity is validated using:

```ts
ContactIdentitySchema
```

Pagination parameters are validated using:

```ts
PaginationSchema
```

Default values:

```ts
{
  skip: 0,
  take: 9999
}
```

## Returns

```ts
Promise<ThreadMessage[]>
```

## URI

```http
/threads/:identity
```

## Description

Returns the messages exchanged with a contact in chronological order.

# Buckets

```ts
client.buckets
```

Manage documents stored in BLiP Buckets.

Buckets provide a simple key-value storage mechanism for persisting structured or unstructured data associated with a bot.

---

# findDocumentCollection

Retrieve all document keys stored in buckets.

## Usage

```ts
const keys =
  await client.buckets.findDocumentCollection();
```

## Signature

```ts
findDocumentCollection(): Promise<string[]>
```

## Returns

```ts
Promise<string[]>
```

## URI

```http
/buckets
```

## Description

Returns a collection containing all document keys currently stored in buckets.

---

# findDocument

Retrieve a document by its key.

## Usage

```ts
const settings =
  await client.buckets.findDocument<Settings>(
    "app-settings"
  );
```

## Signature

```ts
findDocument<T>(
  documentKey: string
): Promise<T>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| documentKey | string | Yes | Document identifier |

## Validation

Validated using:

```ts
DocumentKeySchema
```

## Returns

```ts
Promise<T>
```

## URI

```http
/buckets/:key
```

## Description

Returns the document stored under the specified key.

---

# setDocument

Create or update a document.

## Usage

```ts
await client.buckets.setDocument(
  "app-settings",
  {
    type: "application/json",
    content: {
      language: "en",
      timezone: "UTC",
    },
  }
);
```

## Signature

```ts
setDocument(
  documentKey: string,
  document: Document
): Promise<IBlipSuccessfulResponse>
```

## Parameters

### documentKey

| Type | Required | Description |
|------|----------|-------------|
| string | Yes | Document identifier |

### document

| Type | Required |
|------|----------|
| Document | Yes |

## Validation

The document key is validated using:

```ts
DocumentKeySchema
```

The document payload is validated using:

```ts
DocumentSchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/buckets/:key
```

## Description

Creates a new document or replaces the existing document associated with the specified key.

---

# deleteDocument

Delete a document.

## Usage

```ts
await client.buckets.deleteDocument(
  "app-settings"
);
```

## Signature

```ts
deleteDocument(
  documentKey: string
): Promise<IBlipSuccessfulResponse>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| documentKey | string | Yes | Document identifier |

## Validation

Validated using:

```ts
DocumentKeySchema
```

## Returns

```ts
Promise<IBlipSuccessfulResponse>
```

## URI

```http
/buckets/:key
```

## Description

Deletes the document associated with the specified key.