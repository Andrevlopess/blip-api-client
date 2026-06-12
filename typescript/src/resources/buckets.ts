import type { BlipTransport } from "@/clients/BlipTransport.js";
import { DocumentKeySchema, DocumentSchema, type Document } from "@/schemas/BucketSchemas.js";
import { type IBlipCollectionResponse, type IBlipSuccessfulResponse } from "../types/BlipCommands.js";


export class BucketsResource {
	constructor(private readonly transport: BlipTransport) {}

	async findDocumentCollection(): Promise<string[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<string>>({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/buckets`,
		});

		return resource.items;
	}

	async findDocument(documentKey: string): Promise<any | null> {
		const key = DocumentKeySchema.parse(documentKey);

		return await this.transport.sendCommand({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/buckets/${key}`,
		});
	}

	async setDocument(documentKey: string, document: Document): Promise<IBlipSuccessfulResponse> {
		const key = DocumentKeySchema.parse(documentKey);
		const doc = DocumentSchema.parse(document);

		return await this.transport.sendCommand({
			method: "set",
			to: "postmaster@msging.net",
			uri: `/buckets/${key}`,
			type: doc.type,
			resource: doc.content,
		});
	}

	async deleteDocument(documentKey: string): Promise<IBlipSuccessfulResponse> {
		const key = DocumentKeySchema.parse(documentKey);

		return await this.transport.sendCommand({
			method: "delete",
			to: "postmaster@msging.net",
			uri: `/buckets/${key}`,
		});
	}
}
