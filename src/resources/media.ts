import type { BlipTransport } from "../clients/BlipTransport.js";


/**
 * Provides access to Blip Media resources for managing media uploads and URL operations.
 * Access via {@link BlipClient.media} — do not instantiate directly.
 *
 * @category Resources
 */
export class MediaResources {
	constructor(private readonly transport: BlipTransport) {}

	/**
	 * Generates a pre-signed secure upload URL for media storage.
	 *
	 * @returns A promise that resolves to a secure upload URL string.
	 *
	 * @example
	 * ```typescript
	 * const uploadUrl = await client.media.getUploadUrl();
	 * // => "https://media.msging.net/media/..."
	 * ```
	 */
	async getUploadUrl(): Promise<string> {
		const searchParams: Record<string, unknown> = { secure: true };

		const { resource } = await this.transport.sendCommand<string>({
			to: "postmaster@media.msging.net",
			method: "get",
			uri: `/upload-media-uri${this.transport.buildSearchParams(searchParams)}`,
		});

		return resource;
	}

	/**
	 * Refreshes an expired media URL, returning a new valid one.
	 *
	 * @param url - The expired media URL to be refreshed.
	 * @returns A promise that resolves to a new, valid media URL string.
	 *
	 * @example
	 * ```typescript
	 * const newUrl = await client.media.refreshExpiredUrl("https://media.msging.net/expired-url");
	 * // => "https://media.msging.net/media/..."
	 * ```
	 */
	async refreshExpiredUrl(url: string): Promise<string> {
		const { resource } = await this.transport.sendCommand<string>({
			to: "postmaster@media.msging.net",
			method: "set",
			uri: "/refresh-media-uri",
			type: "text/plain",
			resource: url,
		});

		return resource;
	}
}
