"use client";

import { useState } from "react";
import { useYjsShapes } from "~/hooks/use-yjs-shapes";
import { ShapeRenderer } from "./shape-renderer";

/**
 * Props para o componente CanvasRoot
 */
export type CanvasRootProps = {
	/** ID da room do PartyKit para colaboração */
	room: string;

	/** Largura do canvas em pixels */
	width?: number;

	/** Altura do canvas em pixels */
	height?: number;
};

/**
 * Container principal do canvas colaborativo
 *
 * Renderiza um canvas SVG com shapes colaborativas sincronizadas via Yjs.
 * Gerencia seleção de shapes e interações do usuário.
 *
 * @example
 * ```tsx
 * <CanvasRoot
 *   room="canvas-123"
 *   width={1200}
 *   height={800}
 * />
 * ```
 *
 * @remarks
 * - Usa useYjsShapes para sincronização em tempo real
 * - Dimensões padrão: 800x600
 * - Suporta seleção de shapes
 */
export function CanvasRoot({
	room,
	width = 800,
	height = 600,
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

	return (
		<svg
			width={width}
			height={height}
			role="img"
			aria-label="Collaborative canvas"
			onClick={handleBackgroundClick}
		>
			{/* Background */}
			<rect
				x={0}
				y={0}
				width={width}
				height={height}
				fill="white"
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
	);
}
