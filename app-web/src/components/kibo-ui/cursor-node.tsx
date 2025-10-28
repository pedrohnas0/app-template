"use client";

import { memo } from "react";
import { type NodeProps, useStore } from "@xyflow/react";
import {
	Cursor,
	CursorBody,
	CursorMessage,
	CursorName,
	CursorPointer,
} from "./cursor";
import { cn } from "~/lib/utils";
import Image from "next/image";

/**
 * Tipo de dados do CursorNode
 */
export type CursorData = {
	/** ID único do usuário */
	id: string;

	/** Nome do usuário */
	name: string;

	/** URL do avatar */
	avatar: string;

	/** Cor do cursor */
	color: "blue" | "emerald" | "rose" | "violet";

	/** Mensagem opcional (cursor chat) */
	message?: string;

	/** Se é o usuário atual (não renderiza) */
	isCurrentUser?: boolean;
};

/**
 * Mapeamento de cores para classes CSS
 */
const COLOR_MAP = {
	blue: {
		foreground: "text-blue-600",
		background: "bg-blue-100 dark:bg-blue-950",
	},
	emerald: {
		foreground: "text-emerald-600",
		background: "bg-emerald-100 dark:bg-emerald-950",
	},
	rose: {
		foreground: "text-rose-600",
		background: "bg-rose-100 dark:bg-rose-950",
	},
	violet: {
		foreground: "text-violet-600",
		background: "bg-violet-100 dark:bg-violet-950",
	},
} as const;

/**
 * React Flow Node para Cursor Colaborativo
 *
 * Renderiza cursores de outros usuários como React Flow Nodes,
 * garantindo sincronização perfeita com zoom/pan do canvas.
 *
 * Features:
 * - 🎯 Posição em canvas space (como shapes)
 * - 📏 Tamanho fixo (compensa zoom com scale)
 * - ⚡ GPU-accelerated (CSS transform3d)
 * - 🎨 Cores por usuário (blue, emerald, rose, violet)
 * - 💬 Cursor chat opcional
 * - 🚫 Não renderiza o próprio cursor
 *
 * @example
 * ```tsx
 * const cursorNodes = users.map(user => ({
 *   id: `cursor-${user.id}`,
 *   type: 'cursorNode',
 *   position: { x: user.x, y: user.y },  // Canvas coordinates
 *   data: {
 *     id: user.id,
 *     name: user.name,
 *     avatar: user.avatar,
 *     color: user.color,
 *     isCurrentUser: user.id === currentUserId,
 *   },
 *   selectable: false,
 *   draggable: false,
 *   zIndex: 9999,
 * }));
 *
 * <ReactFlow
 *   nodes={[...shapeNodes, ...cursorNodes]}
 *   nodeTypes={{ shapeNode: ShapeNode, cursorNode: CursorNode }}
 * />
 * ```
 *
 * @remarks
 * - Usa `useStore` do React Flow para obter zoom atual
 * - Aplica `scale(1/zoom)` para manter tamanho fixo
 * - `transform-origin: top-left` garante posição correta
 * - `pointer-events: none` evita bloquear interações
 * - Oculta cursor do usuário atual (já renderizado pelo browser)
 *
 * Baseado em:
 * - tldraw: Presence store pattern
 * - Figma/Miro: Fixed size scaling
 * - Excalidraw: Canvas-native rendering
 */
export const CursorNode = memo((({ data }: any) => {
	// Cast data para CursorData para type safety
	const cursorData = data as CursorData;

	// Não renderizar o próprio cursor (browser já mostra)
	if (cursorData.isCurrentUser) {
		return null;
	}

	// Obter zoom atual do React Flow para compensar tamanho
	const zoom = useStore((state) => state.transform[2]);

	// Obter cores para o usuário
	const colors = COLOR_MAP[cursorData.color];

	return (
		<div
			data-testid={`cursor-${cursorData.id}`}
			className="pointer-events-none"
			style={{
				// ✨ Magia: Compensa o zoom do React Flow
				// Zoom 2x → scale(0.5) → cursor mantém tamanho original
				transform: `scale(${1 / zoom})`,
				transformOrigin: "top left",
				// ✅ SEM transição - scale deve ser instantâneo durante zoom
			}}
		>
			<Cursor>
				<CursorPointer className={cn(colors.foreground)} />
				<CursorBody
					className={cn(
						colors.background,
						colors.foreground,
						"gap-1 border border-border/50 px-3 py-2 shadow-md",
					)}
				>
					<div className="flex items-center gap-2">
						<Image
							alt={cursorData.name}
							className="mt-0 mb-0 size-4 rounded-full"
							height={16}
							src={cursorData.avatar}
							unoptimized
							width={16}
						/>
						<CursorName>{cursorData.name}</CursorName>
					</div>
					{cursorData.message && <CursorMessage>{cursorData.message}</CursorMessage>}
				</CursorBody>
			</Cursor>
		</div>
	);
}) as any);

CursorNode.displayName = "CursorNode";
