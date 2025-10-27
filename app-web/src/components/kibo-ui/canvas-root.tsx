"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { useYjsShapes } from "~/hooks/use-yjs-shapes";
import { ShapeRenderer } from "./shape-renderer";

/**
 * Props para o componente CanvasRoot
 */
export type CanvasRootProps = {
	/** ID da room do PartyKit para colaboração */
	room: string;

	/** Largura do canvas em pixels (opcional, padrão fullscreen) */
	width?: number;

	/** Altura do canvas em pixels (opcional, padrão fullscreen) */
	height?: number;

	/** Classes CSS adicionais para o container */
	className?: string;

	/** Mostrar background com dots pattern */
	showBackground?: boolean;
};

/**
 * Container principal do canvas colaborativo
 *
 * Renderiza um canvas SVG com shapes colaborativas sincronizadas via Yjs.
 * Gerencia seleção de shapes e interações do usuário.
 * Segue o design system shadcn/ui com glass morphism e gradientes.
 *
 * @example
 * ```tsx
 * <CanvasRoot
 *   room="canvas-123"
 *   showBackground={true}
 * />
 * ```
 *
 * @remarks
 * - Usa useYjsShapes para sincronização em tempo real
 * - Fullscreen por padrão
 * - Suporta seleção de shapes
 * - Background pattern com dots (opcional)
 * - Segue padrão visual da demo em /app/canvas/page.tsx
 */
export function CanvasRoot({
	room,
	width,
	height,
	className,
	showBackground = true,
}: CanvasRootProps) {
	// Hook de shapes colaborativas
	const { shapes } = useYjsShapes(room);

	// Estado de seleção
	const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

	// Handler para click em shape
	const handleShapeClick = (shapeId: string) => {
		setSelectedShapeId(shapeId);
	};

	// Handler para click no background (deselecionar)
	const handleBackgroundClick = (e: React.MouseEvent) => {
		// Só deselecionar se clicar diretamente no background
		if (e.target === e.currentTarget) {
			setSelectedShapeId(null);
		}
	};

	// Dimensões finais
	const finalWidth = width ?? "100%";
	const finalHeight = height ?? "100%";

	return (
		<div
			className={cn(
				"relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20",
				!width && !height && "h-screen w-screen",
				className,
			)}
			style={
				width || height
					? { width: typeof width === "number" ? `${width}px` : width, height: typeof height === "number" ? `${height}px` : height }
					: undefined
			}
		>
			{/* Background Pattern - Dots */}
			{showBackground && (
				<svg
					className="absolute inset-0 opacity-30"
					width="100%"
					height="100%"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<pattern
							id="dots-pattern"
							x="0"
							y="0"
							width="16"
							height="16"
							patternUnits="userSpaceOnUse"
						>
							<circle cx="1" cy="1" r="1" className="fill-muted-foreground" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#dots-pattern)" />
				</svg>
			)}

			{/* Canvas SVG para shapes */}
			<svg
				className="absolute inset-0 pointer-events-auto"
				width={finalWidth}
				height={finalHeight}
				role="img"
				aria-label="Collaborative canvas"
				onClick={handleBackgroundClick}
			>
				{/* Background transparente para capturar cliques */}
				<rect
					x={0}
					y={0}
					width="100%"
					height="100%"
					fill="transparent"
					onClick={(e) => {
						e.stopPropagation();
						setSelectedShapeId(null);
					}}
				/>

				{/* Render todas as shapes */}
				{shapes.map((shape) => (
					<g
						key={shape.id}
						onClick={(e) => {
							e.stopPropagation();
							handleShapeClick(shape.id);
						}}
					>
						<ShapeRenderer
							shape={shape}
							isSelected={shape.id === selectedShapeId}
						/>
					</g>
				))}
			</svg>
		</div>
	);
}
