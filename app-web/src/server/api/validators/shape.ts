import { z } from "zod";

/**
 * Base shape properties schema
 */
const shapePropertiesSchema = z.object({
	type: z.string().min(1),
	data: z.record(z.unknown()),
	x: z.number(),
	y: z.number(),
	width: z.number().optional(),
	height: z.number().optional(),
	rotation: z.number().default(0),
	fill: z.string().optional(),
	stroke: z.string().optional(),
	opacity: z.number().min(0).max(1).default(1),
	zIndex: z.number().int().default(0),
});

/**
 * Schema for creating a new shape
 */
export const shapeCreateSchema = z.object({
	canvasId: z.string(),
	...shapePropertiesSchema.shape,
});

/**
 * Schema for shape ID parameter
 */
export const shapeIdSchema = z.object({
	id: z.string(),
});

/**
 * Schema for listing shapes by canvas
 */
export const shapeListByCanvasSchema = z.object({
	canvasId: z.string(),
});

/**
 * Schema for updating a shape
 */
export const shapeUpdateSchema = z.object({
	id: z.string(),
	type: z.string().min(1).optional(),
	data: z.record(z.unknown()).optional(),
	x: z.number().optional(),
	y: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	rotation: z.number().optional(),
	fill: z.string().optional(),
	stroke: z.string().optional(),
	opacity: z.number().min(0).max(1).optional(),
	zIndex: z.number().int().optional(),
});

/**
 * Schema for batch updating multiple shapes
 */
export const shapeBatchUpdateSchema = z.object({
	updates: z.array(shapeUpdateSchema.omit({ id: true }).extend({ id: z.string() })),
});

/**
 * Type exports for use in components
 */
export type ShapeCreateInput = z.infer<typeof shapeCreateSchema>;
export type ShapeIdInput = z.infer<typeof shapeIdSchema>;
export type ShapeListByCanvasInput = z.infer<typeof shapeListByCanvasSchema>;
export type ShapeUpdateInput = z.infer<typeof shapeUpdateSchema>;
export type ShapeBatchUpdateInput = z.infer<typeof shapeBatchUpdateSchema>;
