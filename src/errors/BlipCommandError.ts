/**
 * Thrown when a Blip command response contains a failure status.
 *
 * Blip commands return errors inline in the response body rather than via
 * HTTP status codes, so this error is thrown by the command layer after
 * inspecting the `status` field of the response.
 *
 * @example
 * ```ts
 * try {
 *   await client.queues.create({ name: 'support', ownerIdentity: 'agent@blip.ai' });
 * } catch (err) {
 *   if (err instanceof BlipCommandError) {
 *     console.error(err.description); // "Queue already exists"
 *     console.error(err.code);        // 60
 *   }
 * }
 * ```
 */
export class BlipCommandError extends Error {
	/**
	 * Blip's internal reason code from `body.reason.code`.
	 * Use this for programmatic branching — it's more stable than matching on `description`.
	 *
	 * @example
	 * ```ts
	 * if (err.code === 66) // This user does not have permission to perform this operation
	 * ```
	 */
	public readonly code: number;

	/**
	 * Human-readable error description from `body.reason.description`.
	 * Matches the value used as the error `message`.
	 */
	public readonly description: string;

	/**
	 * The raw response body from Blip, preserved for debugging.
	 * Avoid branching logic on this — prefer `code` or `description` instead.
	 */
	public readonly raw: unknown;

	/**
	 * @param body - The raw Blip command response body.
	 *               Expects `body.reason.code` and `body.reason.description`.
	 */
	constructor(body: any) {
		const description = body?.reason?.description ?? "Unknown error";
		super(description);

		this.name = "BlipCommandError";
		this.code = body?.reason?.code ?? 0;
		this.description = description;
		this.raw = body;

		// Required for `instanceof` checks to work correctly
		// when TypeScript compiles down to ES5.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
