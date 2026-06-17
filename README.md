# @andrevlopes/blip-api-client

A JavaScript/TypeScript client for the [Blip](https://blip.ai) platform APIs. Provides a typed, ergonomic interface for managing Blip resources such as attendance queues, tickets, and WhatsApp Flows.

## Installation

```bash
npm install @andrevlopes/blip-api-client
# or
pnpm add @andrevlopes/blip-api-client
```

## Getting Started

Create a client instance by providing your Blip **tenant** and **API key** (router or boy Key):

```typescript
import { BlipClient } from "@andrevlopes/blip-api-client";

const client = new BlipClient({
  tenant: "your-tenant",
  apiKey: "your-api-key", 
});
```

All resources are available directly on the client instance. Every method is fully typed and validates its inputs with [Zod](https://zod.dev) — invalid payloads throw a `ZodError` before any network request is made.


## Resources

- Buckets
- Tickets
- Messages
- Flows
- Attendants
- QueuesRules
- QueueTags
- Queues
- Desk
- Contacts
- Trackings
- Media
---

## Error Handling

All methods validate their inputs before sending any request. An invalid payload throws a `ZodError` synchronously, so you can catch it alongside network errors:

```typescript
import { ZodError } from "zod";

try {
  await client.queues.set({} as any);
} catch (err) {
  if (err instanceof ZodError) {
    console.error("Validation error:", err.issues);
  } else {
    console.error("Request failed:", err);
  }
}
```

---

## License

ISC © [Andre V Lopes](https://github.com/Andrevlopess)