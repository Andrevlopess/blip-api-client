import type { BlipTransport } from "../clients/BlipTransport.js";
import { DocumentKeySchema, DocumentSchema, type DocumentInput } from "../schemas/BucketSchemas.js";
import {
	type IBlipCollectionResponse,
	type IBlipGetResponse,
	type IBlipSuccessfulResponse,
} from "../types/BlipCommands.js";

/**
 * Provides access to the Blip key-value bucket storage.
 * Access via {@link BlipClient.buckets} — do not instantiate directly.
 *
 * @hideconstructor 
 */
export class BucketsResource {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Lists all document keys in the bucket.
	 * @returns Array of document key strings.
	 */
	async getDocumentCollection(): Promise<string[]> {
		const { resource } = await this.transport.sendCommand<IBlipCollectionResponse<string>>({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/buckets`,
		});

		return resource.items;
	}

	/**
	 * Retrieves a document by key.
	 * @param documentKey - The bucket key to look up.
	 * @typeParam T - The expected shape of the document content.
	 */
	async getDocument<T>(documentKey: string): Promise<T> {
		const key = DocumentKeySchema.parse(documentKey);

		const { resource } = (await this.transport.sendCommand<T>({
			method: "get",
			to: "postmaster@msging.net",
			uri: `/buckets/${key}`,
		})) as IBlipGetResponse<T>;

		return resource;
	}

	/**
	 * Creates or replaces a document.
	 * @param documentKey - The bucket key to write to.
	 * @param document - The document payload.
	 */
	async setDocument(documentKey: string, document: DocumentInput): Promise<IBlipSuccessfulResponse> {
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

	/**
	 * Deletes a document by key.
	 * @param documentKey - The bucket key to delete.
	 */
	async deleteDocument(documentKey: string): Promise<IBlipSuccessfulResponse> {
		const key = DocumentKeySchema.parse(documentKey);

		return await this.transport.sendCommand({
			method: "delete",
			to: "postmaster@msging.net",
			uri: `/buckets/${key}`,
		});
	}
}
