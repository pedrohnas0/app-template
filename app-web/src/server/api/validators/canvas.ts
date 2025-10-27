import { z } from "zod";

/**
 * Validation schemas for Canvas operations
 */

export const canvasCreateSchema = z.object({
	name: z
		.string()
		.min(1, "Canvas name is required")
		.max(100, "Canvas name must be 100 characters or less"),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
});

export const canvasIdSchema = z.object({
	id: z.string().cuid("Invalid canvas ID format"),
});

export const canvasUpdateSchema = z.object({
	id: z.string().cuid("Invalid canvas ID format"),
	name: z
		.string()
		.min(1, "Canvas name is required")
		.max(100, "Canvas name must be 100 characters or less")
		.optional(),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
});

export type CanvasCreateInput = z.infer<typeof canvasCreateSchema>;
export type CanvasIdInput = z.infer<typeof canvasIdSchema>;
export type CanvasUpdateInput = z.infer<typeof canvasUpdateSchema>;
