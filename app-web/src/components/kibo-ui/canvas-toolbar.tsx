import { Circle, Minus, Square, Type } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Tipos de ferramentas disponíveis no canvas
 */
export type ToolType = "rect" | "circle" | "text" | "line";

/**
 * Props para o componente CanvasToolbar
 */
export type CanvasToolbarProps = {
	/** Callback quando uma ferramenta é selecionada */
	onToolSelect?: (tool: ToolType) => void;

	/** Ferramenta atualmente selecionada */
	selectedTool?: ToolType;

	/** Classes CSS adicionais para o container */
	className?: string;
};

/**
 * Barra de ferramentas do canvas com seleção de shapes
 *
 * Fornece botões para selecionar ferramentas de desenho no canvas colaborativo.
 * Segue o design system shadcn/ui com glass morphism.
 *
 * @example
 * ```tsx
 * <CanvasToolbar
 *   selectedTool="rect"
 *   onToolSelect={(tool) => console.log('Selected:', tool)}
 * />
 * ```
 *
 * @remarks
 * - Usa Button do shadcn/ui com variant ghost/default
 * - Glass morphism style (bg-background/80, backdrop-blur-sm)
 * - Layout vertical com gap-2
 * - Ícones lucide-react (h-4 w-4)
 * - Botões h-8 w-8
 * - Segue padrão visual de /app/canvas/page.tsx
 */
export function CanvasToolbar({
	onToolSelect,
	selectedTool,
	className,
}: CanvasToolbarProps) {
	/**
	 * Lista de ferramentas disponíveis
	 */
	const tools = [
		{ type: "rect" as const, icon: Square, title: "Rectangle" },
		{ type: "circle" as const, icon: Circle, title: "Circle" },
		{ type: "text" as const, icon: Type, title: "Text" },
		{ type: "line" as const, icon: Minus, title: "Line" },
	];

	return (
		<div
			role="toolbar"
			aria-label="Canvas drawing tools"
			className={cn(
				"flex flex-col gap-2 rounded-lg border border-border bg-background/80 p-2 shadow-lg backdrop-blur-sm",
				className,
			)}
		>
			{tools.map(({ type, icon: Icon, title }) => {
				const isSelected = selectedTool === type;

				return (
					<Button
						key={type}
						variant={isSelected ? "default" : "ghost"}
						size="icon"
						className="h-8 w-8"
						title={title}
						onClick={() => onToolSelect?.(type)}
						data-state={isSelected ? "selected" : undefined}
					>
						<Icon className="h-4 w-4" />
					</Button>
				);
			})}
		</div>
	);
}
