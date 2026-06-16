export abstract class AppError extends Error {
	public readonly code: string;
	public readonly status: number;
	public override readonly cause?: unknown;
	public readonly isCritical?: boolean;

	protected constructor(
		message: string,
		options: {
			code: string;
			status?: number;
			cause?: unknown;
			isCritical?: boolean;
		},
	) {
		super(message);
		this.code = options.code;
		this.status = options.status ?? 500;
		this.cause = options.cause;
		this.isCritical = options.isCritical ?? false;
	}
}
