import { cn } from "~/lib/utils";
import type { Shape } from "~/hooks/use-yjs-shapes";

/**
 * Props para o componente ShapeRenderer
 */
export type ShapeRendererProps = {
	/** Shape a ser renderizada */
	shape: Shape;

	/** Callback quando a shape é clicada */
	onClick?: (shapeId: string) => void;

	/** Se a shape está selecionada (aplica estilo de seleção) */
	isSelected?: boolean;
};

/**
 * Componente que renderiza uma shape no canvas SVG
 *
 * Suporta renderização de shapes com transições suaves e estilos shadcn/ui:
 * - Retângulos (rect)
 * - Círculos (circle)
 * - Texto (text)
 * - Linhas (line)
 *
 * @example
 * ```tsx
 * <ShapeRenderer
 *   shape={{
 *     id: "1",
 *     type: "rect",
 *     x: 100,
 *     y: 100,
 *     width: 50,
 *     height: 50,
 *     fill: "#ff0000"
 *   }}
 *   onClick={(id) => console.log('Clicked:', id)}
 *   isSelected={true}
 * />
 * ```
 *
 * @remarks
 * - Usa variáveis CSS do shadcn/ui para cores (--primary)
 * - Transições suaves em hover e seleção
 * - Drop shadow quando selecionado
 * - Cursor pointer quando clicável
 */
export function ShapeRenderer({
	shape,
	onClick,
	isSelected = false,
}: ShapeRendererProps) {
	// Handler para click
	const handleClick = () => {
		onClick?.(shape.id);
	};

	// Classes comuns para transições
	const transitionClasses = "transition-all duration-200";

	// Estilos comuns
	const commonProps = {
		"data-shape-id": shape.id,
		onClick: handleClick,
		className: cn(
			transitionClasses,
			onClick && "cursor-pointer hover:opacity-90",
			isSelected && "drop-shadow-lg",
		),
		// Estilo de seleção - usa variável CSS do shadcn
		...(isSelected && {
			stroke: "hsl(var(--primary))",
			strokeWidth: 2,
		}),
	};

	// Renderizar baseado no tipo
	switch (shape.type) {
		case "rect":
			return (
				<rect
					{...commonProps}
					x={shape.x}
					y={shape.y}
					width={shape.width}
					height={shape.height}
					fill={shape.fill}
				/>
			);

		case "circle":
			return (
				<circle
					{...commonProps}
					cx={shape.x}
					cy={shape.y}
					r={shape.radius}
					fill={shape.fill}
				/>
			);

		case "line":
			return (
				<line
					{...commonProps}
					x1={shape.x}
					y1={shape.y}
					x2={shape.x2}
					y2={shape.y2}
					stroke={shape.stroke}
					strokeWidth={shape.strokeWidth ?? 2}
				/>
			);

		case "text":
			return (
				<text
					{...commonProps}
					x={shape.x}
					y={shape.y}
					fill={shape.fill}
					fontSize={shape.fontSize ?? 16}
				>
					{shape.text}
				</text>
			);

		default:
			// TypeScript exhaustiveness check
			const _exhaustive: never = shape;
			return null;
	}
}
