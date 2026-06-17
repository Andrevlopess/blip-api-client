import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlipTransport } from "../src/clients/BlipTransport.js";
import { MediaResources } from "../src/resources/media.js";

describe("MediaResources", () => {
	let transport: BlipTransport;
	let sendCommand: ReturnType<typeof vi.fn>;
	let buildSearchParams: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		sendCommand = vi.fn();
		buildSearchParams = vi.fn().mockReturnValue("");

		transport = {
			sendCommand,
			buildSearchParams,
		} as unknown as BlipTransport;
	});

	describe("getUploadUrl", () => {
		it("should return a secure upload URL", async () => {
			const fakeUrl = "https://media.msging.net/upload/secure-token";

			sendCommand.mockResolvedValue({ resource: fakeUrl });

			const resource = new MediaResources(transport);

			const result = await resource.getUploadUrl();

			expect(result).toBe(fakeUrl);
		});

		it("should send the command to the correct destination", async () => {
			sendCommand.mockResolvedValue({ resource: "https://url" });

			const resource = new MediaResources(transport);

			await resource.getUploadUrl();

			expect(sendCommand).toHaveBeenCalledWith({
				to: "postmaster@media.msging.net",
				method: "get",
				uri: "/upload-media-uri",
			});
		});

		it("should include secure=true in search params", async () => {
			sendCommand.mockResolvedValue({ resource: "https://url" });

			const resource = new MediaResources(transport);

			await resource.getUploadUrl();

			expect(buildSearchParams).toHaveBeenCalledWith({ secure: true });
		});

		it("should propagate transport errors", async () => {
			sendCommand.mockRejectedValue(new Error("Network error"));

			const resource = new MediaResources(transport);

			await expect(resource.getUploadUrl()).rejects.toThrow("Network error");
		});
	});

	describe("refreshExpiredUrl", () => {
		it("should return the refreshed URL", async () => {
			const expiredUrl = "https://media.msging.net/expired-token";
			const refreshedUrl = "https://media.msging.net/refreshed-token";

			sendCommand.mockResolvedValue({ resource: refreshedUrl });

			const resource = new MediaResources(transport);

			const result = await resource.refreshExpiredUrl(expiredUrl);

			expect(result).toBe(refreshedUrl);
		});

		it("should send the command with the correct payload", async () => {
			const expiredUrl = "https://media.msging.net/expired-token";

			sendCommand.mockResolvedValue({ resource: "https://refreshed" });

			const resource = new MediaResources(transport);

			await resource.refreshExpiredUrl(expiredUrl);

			expect(sendCommand).toHaveBeenCalledWith({
				to: "postmaster@media.msging.net",
				method: "set",
				uri: "/refresh-media-uri",
				type: "text/plain",
				resource: expiredUrl,
			});
		});

		it("should propagate transport errors", async () => {
			sendCommand.mockRejectedValue(new Error("Refresh failed"));

			const resource = new MediaResources(transport);

			await expect(resource.refreshExpiredUrl("https://expired")).rejects.toThrow("Refresh failed");
		});
	});
});
