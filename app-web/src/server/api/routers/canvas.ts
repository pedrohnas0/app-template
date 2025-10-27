import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
	canvasCreateSchema,
	canvasIdSchema,
	canvasUpdateSchema,
} from "~/server/api/validators/canvas";

/**
 * Canvas router - CRUD operations for collaborative canvases
 */
export const canvasRouter = createTRPCRouter({
	/**
	 * Create a new canvas
	 */
	create: publicProcedure
		.input(canvasCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.canvas.create({
				data: input,
			});
		}),

	/**
	 * Get canvas by ID with shapes
	 */
	getById: publicProcedure
		.input(canvasIdSchema)
		.query(async ({ ctx, input }) => {
			return ctx.db.canvas.findUniqueOrThrow({
				where: { id: input.id },
				include: { shapes: true },
			});
		}),

	/**
	 * List all canvases (limited to 50, ordered by updatedAt desc)
	 */
	list: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.canvas.findMany({
			orderBy: { updatedAt: "desc" },
			take: 50,
		});
	}),

	/**
	 * Update canvas
	 */
	update: publicProcedure
		.input(canvasUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			return ctx.db.canvas.update({
				where: { id },
				data,
			});
		}),

	/**
	 * Delete canvas (cascade deletes shapes)
	 */
	delete: publicProcedure
		.input(canvasIdSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.canvas.delete({
				where: { id: input.id },
			});
		}),
});
