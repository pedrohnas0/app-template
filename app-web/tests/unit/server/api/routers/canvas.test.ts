import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "../../../../helpers/trpc-caller";
import { db } from "~/server/db";

describe.sequential("canvas router", () => {
	beforeEach(async () => {
		// Limpar DB de teste
		await db.shape.deleteMany(); // Shapes primeiro por causa de foreign key
		await db.canvas.deleteMany();
	});

	describe("create", () => {
		it("should create a new canvas", async () => {
			const caller = createCaller();

			const canvas = await caller.canvas.create({
				name: "Test Canvas",
				description: "A test canvas",
			});

			expect(canvas).toMatchObject({
				id: expect.any(String),
				name: "Test Canvas",
				description: "A test canvas",
			});
		});

		it("should create canvas without description", async () => {
			const caller = createCaller();

			const canvas = await caller.canvas.create({
				name: "Simple Canvas",
			});

			expect(canvas).toMatchObject({
				id: expect.any(String),
				name: "Simple Canvas",
				description: null,
			});
		});

		it("should reject empty name", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.create({ name: "" }),
			).rejects.toThrow();
		});

		it("should reject name longer than 100 chars", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.create({ name: "a".repeat(101) }),
			).rejects.toThrow();
		});

		it("should reject description longer than 500 chars", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.create({
					name: "Test",
					description: "a".repeat(501),
				}),
			).rejects.toThrow();
		});
	});

	describe("getById", () => {
		it("should return canvas by id", async () => {
			// Setup: criar canvas
			const created = await db.canvas.create({
				data: {
					name: "Test Canvas",
					description: "Test",
				},
			});

			// Test
			const caller = createCaller();
			const canvas = await caller.canvas.getById({ id: created.id });

			expect(canvas).toMatchObject({
				id: created.id,
				name: "Test Canvas",
				description: "Test",
			});
		});

		it("should return canvas with shapes", async () => {
			// Setup: criar canvas e shapes
			const created = await db.canvas.create({
				data: {
					name: "Test",
					shapes: {
						create: [
							{
								type: "rect",
								data: { label: "Rectangle" },
								x: 0,
								y: 0,
							},
							{
								type: "circle",
								data: { radius: 50 },
								x: 100,
								y: 100,
							},
						],
					},
				},
				include: { shapes: true },
			});

			// Test
			const caller = createCaller();
			const canvas = await caller.canvas.getById({ id: created.id });

			expect(canvas.shapes).toHaveLength(2);
			expect(canvas.shapes[0]).toMatchObject({
				type: "rect",
				x: 0,
				y: 0,
			});
			expect(canvas.shapes[1]).toMatchObject({
				type: "circle",
				x: 100,
				y: 100,
			});
		});

		it("should throw error for non-existent canvas", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.getById({ id: "non-existent" }),
			).rejects.toThrow();
		});
	});

	describe("list", () => {
		it("should return empty array when no canvases exist", async () => {
			const caller = createCaller();

			const canvases = await caller.canvas.list();

			expect(canvases).toEqual([]);
		});

		it("should return all canvases ordered by updatedAt desc", async () => {
			// Setup: criar múltiplos canvas
			await db.canvas.create({
				data: { name: "Canvas 1" },
			});

			// Delay para garantir updatedAt diferente
			await new Promise((resolve) => setTimeout(resolve, 10));

			await db.canvas.create({
				data: { name: "Canvas 2" },
			});

			await new Promise((resolve) => setTimeout(resolve, 10));

			await db.canvas.create({
				data: { name: "Canvas 3" },
			});

			// Test
			const caller = createCaller();
			const canvases = await caller.canvas.list();

			expect(canvases).toHaveLength(3);
			expect(canvases[0]?.name).toBe("Canvas 3");
			expect(canvases[1]?.name).toBe("Canvas 2");
			expect(canvases[2]?.name).toBe("Canvas 1");
		});

		it("should limit results to 50 canvases", async () => {
			// Setup: criar 60 canvas em lotes para evitar esgotar o connection pool
			const batchSize = 5; // Respeita o limite de 5 conexões do Prisma
			const totalCanvases = 60;

			for (let i = 0; i < totalCanvases; i += batchSize) {
				const batch = Array.from(
					{ length: Math.min(batchSize, totalCanvases - i) },
					(_, j) =>
						db.canvas.create({
							data: { name: `Canvas ${i + j}` },
						}),
				);
				await Promise.all(batch);
			}

			// Test
			const caller = createCaller();
			const canvases = await caller.canvas.list();

			expect(canvases).toHaveLength(50);
		});
	});

	describe("update", () => {
		it("should update canvas name", async () => {
			// Setup
			const created = await db.canvas.create({
				data: { name: "Original Name" },
			});

			// Test
			const caller = createCaller();
			const updated = await caller.canvas.update({
				id: created.id,
				name: "Updated Name",
			});

			expect(updated.name).toBe("Updated Name");
		});

		it("should update canvas description", async () => {
			// Setup
			const created = await db.canvas.create({
				data: { name: "Test" },
			});

			// Test
			const caller = createCaller();
			const updated = await caller.canvas.update({
				id: created.id,
				description: "New description",
			});

			expect(updated.description).toBe("New description");
		});

		it("should throw error for non-existent canvas", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.update({
					id: "non-existent",
					name: "New Name",
				}),
			).rejects.toThrow();
		});
	});

	describe("delete", () => {
		it("should delete canvas", async () => {
			// Setup
			const created = await db.canvas.create({
				data: { name: "To Delete" },
			});

			// Test
			const caller = createCaller();
			const deleted = await caller.canvas.delete({ id: created.id });

			expect(deleted.id).toBe(created.id);

			// Verify it's gone
			const canvases = await db.canvas.findMany();
			expect(canvases).toHaveLength(0);
		});

		it("should cascade delete shapes", async () => {
			// Setup: canvas com shapes
			const created = await db.canvas.create({
				data: {
					name: "Test",
					shapes: {
						create: [
							{ type: "rect", data: {}, x: 0, y: 0 },
						],
					},
				},
			});

			// Test
			const caller = createCaller();
			await caller.canvas.delete({ id: created.id });

			// Verify shapes are gone too
			const shapes = await db.shape.findMany();
			expect(shapes).toHaveLength(0);
		});

		it("should throw error for non-existent canvas", async () => {
			const caller = createCaller();

			await expect(
				caller.canvas.delete({ id: "non-existent" }),
			).rejects.toThrow();
		});
	});
});
