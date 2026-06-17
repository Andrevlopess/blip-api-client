import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { BlipTransport } from "../src/clients/BlipTransport";
import { AttendantsResources } from "../src/resources/attendants";
import { AttendantPermissionInput } from "../src/schemas/AttendantSchemas";

describe("AttendantsResources", () => {
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

	const email = "john.doe@gmail.com";
	const identity = `${encodeURIComponent(email)}@blip.ai`;

	describe("getAll", () => {
		it("should fetch attendants", async () => {
			const attendants = [
				{
					identity,
				},
			];

			sendCommand.mockResolvedValue({
				resource: {
					items: attendants,
				},
			});

			const resource = new AttendantsResources(transport);

			const result = await resource.getAll();

			expect(buildSearchParams).toHaveBeenCalledWith({
				includeStatus: "false",
			});

			expect(sendCommand).toHaveBeenCalledWith({
				method: "get",
				to: "postmaster@desk.msging.net",
				uri: "/agents/v2",
			});

			expect(result).toEqual(attendants);
		});

		it("should apply pagination and teams filters", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			buildSearchParams.mockReturnValue("?includeStatus=false&$skip=10&$take=20&teams=sales,support");

			const resource = new AttendantsResources(transport);

			await resource.getAll({
				pagination: {
					skip: 10,
					take: 20,
				},
				teams: ["sales", "support"],
			});

			expect(buildSearchParams).toHaveBeenCalledWith({
				includeStatus: "false",
				$skip: "10",
				$take: "20",
				teams: "sales,support",
			});
		});
	});

	describe("getByEmail", () => {
		it("should return attendant", async () => {
			const attendant = {
				identity: "john.doe@blip.ai",
			};

			sendCommand.mockResolvedValue({
				resource: {
					items: [attendant],
				},
			});

			const resource = new AttendantsResources(transport);

			const result = await resource.getByEmail(email);

			expect(result).toEqual(attendant);
		});

		it("should return null when attendant is not found", async () => {
			sendCommand.mockResolvedValue({
				resource: {
					items: [],
				},
			});

			const resource = new AttendantsResources(transport);

			const result = await resource.getByEmail(email);

			expect(result).toBeNull();
		});

		it("should throw when email is invalid", async () => {
			const resource = new AttendantsResources(transport);

			await expect(resource.getByEmail("invalid email")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("createOrUpdate", () => {
		it("should create or update attendant", async () => {
			sendCommand.mockResolvedValue({
				status: "success",
			});

			buildSearchParams.mockReturnValue("?userCulture=pt");

			const resource = new AttendantsResources(transport);

			const input = {
				email,
				fullName: "John Doe",
			};

			await resource.createOrUpdate(input);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/attendants?userCulture=pt",
				type: "application/vnd.lime.collection+json",
				resource: {
					itemType: "application/vnd.iris.desk.attendant+json",
					items: [
						expect.objectContaining({
							email,
							identity
						}),
					],
				},
			});
		});

		it("should throw when payload is invalid", async () => {
			const resource = new AttendantsResources(transport);

			await expect(resource.createOrUpdate({email: 'test'})).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete attendant", async () => {
			sendCommand.mockResolvedValue({
				status: "success",
			});

			const resource = new AttendantsResources(transport);

			await resource.delete(email);
			
			expect(sendCommand).toHaveBeenCalledWith({
				method: "delete",
				to: "postmaster@desk.msging.net",
				uri: `/attendants/${encodeURIComponent(encodeURIComponent(email))}@blip.ai`,
			});
		});

		it("should throw when email is invalid", async () => {
			const resource = new AttendantsResources(transport);

			await expect(resource.delete("invalid email")).rejects.toBeInstanceOf(ZodError);

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("getPermissions", () => {
		it("should return permissions", async () => {
			const permissions = [
				{
					permissionType: "TransferAttendance",
				},
			];

			sendCommand.mockResolvedValue({
				resource: {
					items: permissions,
				},
			});

			const resource = new AttendantsResources(transport);

			const result = await resource.getPermissions(email);

			expect(result).toEqual(permissions);
		});

		it("should return empty array when no permissions exist", async () => {
			sendCommand.mockResolvedValue({
				resource: {},
			});

			const resource = new AttendantsResources(transport);

			const result = await resource.getPermissions(email);

			expect(result).toEqual([]);
		});
	});

	describe("setPermissions", () => {
		it("should set permissions", async () => {
			sendCommand.mockResolvedValue({
				status: "success",
			});

			const permissions: AttendantPermissionInput[] = [
				{
					isActive: true,
					name: "test",
					ownerIdentity: "test",
				},
			];

			const resource = new AttendantsResources(transport);

			await resource.setPermissions(email, permissions);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/agent/permissions",
				type: "application/vnd.lime.collection+json",
				resource: {
					itemType: "application/vnd.iris.desk.agentspermissions+json",
					items: [
						{
							agents: [identity],
							permissions,
						},
					],
				},
			});
		});

		it("should throw when permissions are invalid", async () => {
			const resource = new AttendantsResources(transport);

			await expect(resource.setPermissions(email, [{}] as any)).rejects.toThrow();

			expect(sendCommand).not.toHaveBeenCalled();
		});
	});

	describe("setQueuesByEmail", () => {
		it("should set attendant queues", async () => {
			sendCommand.mockResolvedValue({
				status: "success",
			});

			buildSearchParams.mockReturnValue("?userCulture=pt");

			const resource = new AttendantsResources(transport);

			await resource.setQueuesByEmail(email, ["sales", "support"]);

			expect(sendCommand).toHaveBeenCalledWith({
				method: "set",
				to: "postmaster@desk.msging.net",
				uri: "/attendants?userCulture=pt",
				type: "application/vnd.lime.collection+json",
				resource: {
					itemType: "application/vnd.iris.desk.attendant+json",
					items: [
						{
							identity,
							teams: ["sales", "support"],
						},
					],
				},
			});
		});
	});
});
