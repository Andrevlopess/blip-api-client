import { AppError } from "./AppError.js";

export class CommandError extends AppError {
	constructor(message: string = "Failed to send command to BLIP") {
		super(message, {
			code: "COMMAND_ERROR",
			status: 400,
		});
	}
}
