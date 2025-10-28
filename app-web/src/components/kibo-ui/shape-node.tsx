import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "~/lib/utils";
import type { Shape } from "~/hooks/use-yjs-shapes";

/**
 * Data do node customizado
 */
export type ShapeNodeData = {
	/** Shape a ser renderizada */
	shape: Shape;
};

/**
 * Custom Node Component para React Flow
 *
 * Renderiza shapes colaborativas como nodes do React Flow.
 * Suporta drag & drop, seleção e estilos shadcn/ui.
 *
 * @example
 * ```tsx
 * const nodeTypes = {
 *   shapeNode: ShapeNode
 * };
 *
 * <ReactFlow nodes={nodes} nodeTypes={nodeTypes} />
 * ```
 *
 * @remarks
 * - Usa HTML/CSS para renderização (compatível com shadcn/ui)
 * - Handles invisíveis (React Flow requirement)
 * - Transições suaves
 * - Selected state via React Flow
 */
export function ShapeNode({ data, selected }: any) {
	// Cast data para ShapeNodeData para type safety
	const shapeData = data as ShapeNodeData;
	const { shape } = shapeData;

	// Classes base para todas as shapes
	const baseClasses = cn(
		"transition-all duration-200 cursor-move",
		"border border-border bg-background/90 backdrop-blur-sm",
		selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
	);

	// Renderizar baseado no tipo
	const renderShape = () => {
		switch (shape.type) {
			case "rect":
				return (
					<div
						data-testid={`shape-${shape.id}`}
						className={cn(baseClasses, "rounded-md shadow-md")}
						style={{
							width: `${shape.width}px`,
							height: `${shape.height}px`,
							backgroundColor: shape.fill,
						}}
					/>
				);

			case "circle":
				return (
					<div
						data-testid={`shape-${shape.id}`}
						className={cn(baseClasses, "rounded-full shadow-md")}
						style={{
							width: `${shape.radius * 2}px`,
							height: `${shape.radius * 2}px`,
							backgroundColor: shape.fill,
						}}
					/>
				);

			case "text":
				return (
					<div
						data-testid={`shape-${shape.id}`}
						className={cn(
							baseClasses,
							"rounded-md px-3 py-2 shadow-md font-medium",
						)}
						style={{
							color: shape.fill,
							fontSize: `${shape.fontSize ?? 16}px`,
						}}
					>
						{shape.text}
					</div>
				);

			case "line":
				// Lines são mais complexas - renderizar como div com border
				return (
					<div
						data-testid={`shape-${shape.id}`}
						className={cn("transition-all duration-200")}
						style={{
							width: `${Math.abs(shape.x2 - shape.x)}px`,
							height: `${shape.strokeWidth ?? 2}px`,
							backgroundColor: shape.stroke,
							transform: `rotate(${Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x)}rad)`,
							transformOrigin: "0 0",
						}}
					/>
				);

			default:
				// TypeScript exhaustiveness check
				const _exhaustive: never = shape;
				return null;
		}
	};

	return (
		<>
			{/* Handles invisíveis (required by React Flow) */}
			<Handle
				type="target"
				position={Position.Top}
				className="opacity-0"
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				className="opacity-0"
			/>

			{/* Shape content */}
			{renderShape()}
		</>
	);
}
