/**
 * Configuration options for the Blip transport layer.
 *
 * @example
 * ```typescript
 * const config: BlipTransportConfig = {
 *   tenant: 'wlck',
 *   apiKey: 'your-api-key-here',
 *   maxConcurrentRequests: 5,
 * };
 * ```
 */
export interface BlipTransportConfig {
	/**
	 * The tenant identifier used to scope API requests.
	 *
	 * @example 'wlck'
	 */
	tenant: string;

	/**
	 * The router or bot key used to authenticate requests to the Blip API.
	 *
	 * @remarks
	 * Keep this value secret and avoid committing it to source control.
	 * Use environment variables or a secrets manager to inject it at runtime.
	 *
	 * @example 'your-api-key-here'
	 */
	apiKey: string;

	/**
	 * The maximum number of concurrent HTTP requests allowed at a time when using Promise.all, for example.
	 * Useful for rate-limiting and avoiding server overload.
	 *
	 * @default 10
	 * @example 5
	 */
	maxConcurrentRequests?: number | undefined;
}
