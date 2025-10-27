import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
	shapeBatchUpdateSchema,
	shapeCreateSchema,
	shapeIdSchema,
	shapeListByCanvasSchema,
	shapeUpdateSchema,
} from "~/server/api/validators/shape";

/**
 * Shape router - CRUD operations for shapes on canvases
 */
export const shapeRouter = createTRPCRouter({
	/**
	 * Create a new shape
	 */
	create: publicProcedure
		.input(shapeCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.create({
				data: {
					...input,
					data: input.data as any, // Prisma Json type workaround
				},
			});
		}),

	/**
	 * Get shape by ID
	 */
	getById: publicProcedure
		.input(shapeIdSchema)
		.query(async ({ ctx, input }) => {
			return ctx.db.shape.findUniqueOrThrow({
				where: { id: input.id },
			});
		}),

	/**
	 * List all shapes in a canvas (ordered by zIndex)
	 */
	listByCanvas: publicProcedure
		.input(shapeListByCanvasSchema)
		.query(async ({ ctx, input }) => {
			return ctx.db.shape.findMany({
				where: { canvasId: input.canvasId },
				orderBy: { zIndex: "asc" },
			});
		}),

	/**
	 * Update shape
	 */
	update: publicProcedure
		.input(shapeUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data: shapeData, ...restData } = input;

			return ctx.db.shape.update({
				where: { id },
				data: {
					...restData,
					...(shapeData && { data: shapeData as any }), // Prisma Json type workaround
				},
			});
		}),

	/**
	 * Delete shape
	 */
	delete: publicProcedure
		.input(shapeIdSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.shape.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Batch update multiple shapes
	 * Useful for CRDT synchronization
	 */
	batchUpdate: publicProcedure
		.input(shapeBatchUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// Update each shape individually
			// Using Promise.allSettled to continue even if some shapes don't exist
			const results = await Promise.allSettled(
				input.updates.map(({ id, data: shapeData, ...restData }) =>
					ctx.db.shape.update({
						where: { id },
						data: {
							...restData,
							...(shapeData && { data: shapeData as any }), // Prisma Json type workaround
						},
					}),
				),
			);

			// Return only successful updates
			return results
				.filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
				.map((result) => result.value);
		}),
});
