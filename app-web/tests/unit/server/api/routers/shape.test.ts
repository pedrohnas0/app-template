import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "../../../../helpers/trpc-caller";
import { db } from "~/server/db";

describe.sequential("shape router", () => {
	let canvasId: string;

	beforeEach(async () => {
		// Limpar DB de teste (ordem importa por causa de foreign keys)
		await db.shape.deleteMany();
		await db.canvas.deleteMany();

		// Criar um canvas para usar nos testes
		const canvas = await db.canvas.create({
			data: { name: "Test Canvas" },
		});
		canvasId = canvas.id;
	});

	describe("create", () => {
		it("should create a shape in canvas", async () => {
			const caller = createCaller();

			const shape = await caller.shape.create({
				canvasId,
				type: "rect",
				data: { label: "Rectangle" },
				x: 100,
				y: 200,
			});

			expect(shape).toMatchObject({
				id: expect.any(String),
				canvasId,
				type: "rect",
				x: 100,
				y: 200,
			});
		});

		it("should create shape with optional fields", async () => {
			const caller = createCaller();

			const shape = await caller.shape.create({
				canvasId,
				type: "circle",
				data: { radius: 50 },
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				rotation: 45,
				fill: "#FF0000",
				stroke: "#000000",
				opacity: 0.5,
				zIndex: 10,
			});

			expect(shape).toMatchObject({
				type: "circle",
				width: 100,
				height: 100,
				rotation: 45,
				fill: "#FF0000",
				stroke: "#000000",
				opacity: 0.5,
				zIndex: 10,
			});
		});

		it("should reject invalid canvas ID", async () => {
			const caller = createCaller();

			await expect(
				caller.shape.create({
					canvasId: "invalid-id",
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				}),
			).rejects.toThrow();
		});

		it("should reject invalid shape type", async () => {
			const caller = createCaller();

			await expect(
				caller.shape.create({
					canvasId,
					type: "",
					data: {},
					x: 0,
					y: 0,
				}),
			).rejects.toThrow();
		});
	});

	describe("getById", () => {
		it("should return shape by id", async () => {
			// Setup
			const created = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: { label: "Test" },
					x: 10,
					y: 20,
				},
			});

			// Test
			const caller = createCaller();
			const shape = await caller.shape.getById({ id: created.id });

			expect(shape).toMatchObject({
				id: created.id,
				type: "rect",
				x: 10,
				y: 20,
			});
		});

		it("should throw error for non-existent shape", async () => {
			const caller = createCaller();

			await expect(
				caller.shape.getById({ id: "non-existent" }),
			).rejects.toThrow();
		});
	});

	describe("listByCanvas", () => {
		it("should return empty array when canvas has no shapes", async () => {
			const caller = createCaller();

			const shapes = await caller.shape.listByCanvas({ canvasId });

			expect(shapes).toEqual([]);
		});

		it("should return all shapes in canvas ordered by zIndex", async () => {
			// Setup: criar múltiplas shapes
			await db.shape.createMany({
				data: [
					{
						canvasId,
						type: "rect",
						data: {},
						x: 0,
						y: 0,
						zIndex: 3,
					},
					{
						canvasId,
						type: "circle",
						data: {},
						x: 100,
						y: 100,
						zIndex: 1,
					},
					{
						canvasId,
						type: "text",
						data: {},
						x: 200,
						y: 200,
						zIndex: 2,
					},
				],
			});

			// Test
			const caller = createCaller();
			const shapes = await caller.shape.listByCanvas({ canvasId });

			expect(shapes).toHaveLength(3);
			expect(shapes[0]?.type).toBe("circle"); // zIndex 1
			expect(shapes[1]?.type).toBe("text"); // zIndex 2
			expect(shapes[2]?.type).toBe("rect"); // zIndex 3
		});

		it("should only return shapes from specified canvas", async () => {
			// Setup: criar outro canvas com shapes
			const otherCanvas = await db.canvas.create({
				data: { name: "Other Canvas" },
			});

			await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			await db.shape.create({
				data: {
					canvasId: otherCanvas.id,
					type: "circle",
					data: {},
					x: 0,
					y: 0,
				},
			});

			// Test
			const caller = createCaller();
			const shapes = await caller.shape.listByCanvas({ canvasId });

			expect(shapes).toHaveLength(1);
			expect(shapes[0]?.type).toBe("rect");
		});
	});

	describe("update", () => {
		it("should update shape position", async () => {
			// Setup
			const created = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			// Test
			const caller = createCaller();
			const updated = await caller.shape.update({
				id: created.id,
				x: 100,
				y: 200,
			});

			expect(updated.x).toBe(100);
			expect(updated.y).toBe(200);
		});

		it("should update shape style", async () => {
			// Setup
			const created = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			// Test
			const caller = createCaller();
			const updated = await caller.shape.update({
				id: created.id,
				fill: "#FF0000",
				stroke: "#000000",
				opacity: 0.5,
			});

			expect(updated.fill).toBe("#FF0000");
			expect(updated.stroke).toBe("#000000");
			expect(updated.opacity).toBe(0.5);
		});

		it("should update shape zIndex", async () => {
			// Setup
			const created = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
					zIndex: 1,
				},
			});

			// Test
			const caller = createCaller();
			const updated = await caller.shape.update({
				id: created.id,
				zIndex: 10,
			});

			expect(updated.zIndex).toBe(10);
		});

		it("should throw error for non-existent shape", async () => {
			const caller = createCaller();

			await expect(
				caller.shape.update({
					id: "non-existent",
					x: 100,
				}),
			).rejects.toThrow();
		});
	});

	describe("delete", () => {
		it("should delete shape", async () => {
			// Setup
			const created = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			// Test
			const caller = createCaller();
			const deleted = await caller.shape.delete({ id: created.id });

			expect(deleted.id).toBe(created.id);

			// Verify it's gone
			const shapes = await db.shape.findMany();
			expect(shapes).toHaveLength(0);
		});

		it("should throw error for non-existent shape", async () => {
			const caller = createCaller();

			await expect(
				caller.shape.delete({ id: "non-existent" }),
			).rejects.toThrow();
		});
	});

	describe("batchUpdate", () => {
		it("should update multiple shapes at once", async () => {
			// Setup: criar múltiplas shapes
			const shape1 = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			const shape2 = await db.shape.create({
				data: {
					canvasId,
					type: "circle",
					data: {},
					x: 100,
					y: 100,
				},
			});

			// Test
			const caller = createCaller();
			const results = await caller.shape.batchUpdate({
				updates: [
					{ id: shape1.id, x: 50, y: 50 },
					{ id: shape2.id, x: 150, y: 150 },
				],
			});

			expect(results).toHaveLength(2);
			expect(results[0]?.x).toBe(50);
			expect(results[0]?.y).toBe(50);
			expect(results[1]?.x).toBe(150);
			expect(results[1]?.y).toBe(150);
		});

		it("should skip non-existent shapes in batch", async () => {
			// Setup
			const shape1 = await db.shape.create({
				data: {
					canvasId,
					type: "rect",
					data: {},
					x: 0,
					y: 0,
				},
			});

			// Test: tentar atualizar shape existente e não-existente
			const caller = createCaller();
			const results = await caller.shape.batchUpdate({
				updates: [
					{ id: shape1.id, x: 50 },
					{ id: "non-existent", x: 100 },
				],
			});

			// Deve retornar apenas a shape que existe
			expect(results).toHaveLength(1);
			expect(results[0]?.id).toBe(shape1.id);
		});
	});
});
