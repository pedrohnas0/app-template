import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Snap position to grid
 * Rounds x and y coordinates to the nearest multiple of gridSize
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param gridSize - Size of grid cells (default: 20)
 * @returns Object with snapped x and y coordinates
 *
 * @example
 * snapToGrid(127, 83, 20) // { x: 120, y: 80 }
 * snapToGrid(15, 25, 20) // { x: 20, y: 20 }
 */
export function snapToGrid(
	x: number,
	y: number,
	gridSize: number = 20,
): { x: number; y: number } {
	return {
		x: Math.round(x / gridSize) * gridSize,
		y: Math.round(y / gridSize) * gridSize,
	};
}
