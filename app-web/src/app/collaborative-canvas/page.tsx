"use client";

import {
	Background,
	BackgroundVariant,
	type Edge,
	Panel,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { AvatarStack } from "~/components/kibo-ui/avatar-stack";
import { CanvasControls } from "~/components/kibo-ui/canvas-controls";
import { CanvasToolbar, type ToolType } from "~/components/kibo-ui/canvas-toolbar";
import {
	CollaborativeCursors,
	type CollaborativeUser,
} from "~/components/kibo-ui/collaborative-cursors";
import { ShapeNode } from "~/components/kibo-ui/shape-node";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { usePartyKit } from "~/hooks/use-partykit";
import { useReactFlowShapes } from "~/hooks/use-reactflow-shapes";
import "@xyflow/react/dist/style.css";

/**
 * Cores disponíveis para usuários (cicla)
 */
const userColors = ["blue", "emerald", "rose", "violet"] as const;

/**
 * Tipo de cor do usuário
 */
type UserColor = (typeof userColors)[number];

/**
 * Usuário mock para demo (será substituído por auth real)
 */
const currentUser = {
	id: crypto.randomUUID(),
	name: "Você",
	avatar: "https://github.com/pedrohnas0.png",
	color: userColors[0],
};

/**
 * Página de Canvas Colaborativo
 *
 * Demonstra colaboração em tempo real usando:
 * - PartyKit (WebSocket)
 * - React Flow para canvas
 * - Cursores em tempo real
 * - Design shadcn/ui com glass morphism
 *
 * @remarks
 * Para testar colaboração:
 * 1. Abra esta página em 2+ navegadores
 * 2. Mova o mouse - verá cursores dos outros
 */
export default function CollaborativeCanvasPage() {
	// Room ID (pode vir da URL no futuro)
	const roomId = "demo-canvas";

	// Estado local
	const [myPosition, setMyPosition] = useState({ x: 50, y: 50 });
	const [otherUsers, setOtherUsers] = useState<CollaborativeUser[]>([]);
	const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
	const [edges] = useState<Edge[]>([]);
	const containerRef = useRef<HTMLElement>(null);
	const rafRef = useRef<number | null>(null);
	const lastSendTimeRef = useRef<number>(0);

	// Hook para shapes colaborativas (React Flow + Yjs)
	const { nodes, onNodesChange, addShape } = useReactFlowShapes(roomId);

	// Node types para React Flow
	const nodeTypes = useMemo(() => ({ shapeNode: ShapeNode }), []);

	// Hook PartyKit
	const { send, isConnected } = usePartyKit({
		room: roomId,
		onMessage: (data: any) => {
			// Handler para mensagens do servidor
			if (data.type === "cursor") {
				// Atualizar posição do cursor de outro usuário
				setOtherUsers((users) => {
					const existing = users.find((u) => u.id === data.userId);
					if (existing) {
						return users.map((u) =>
							u.id === data.userId
								? { ...u, x: data.x, y: data.y }
								: u,
						);
					} else {
						// Novo usuário
						return [
							...users,
							{
								id: data.userId,
								name: data.name,
								avatar: data.avatar,
								x: data.x,
								y: data.y,
								color: data.color,
							},
						];
					}
				});
			} else if (data.type === "user-left") {
				// Remover usuário que saiu
				setOtherUsers((users) => users.filter((u) => u.id !== data.userId));
			}
		},
	});

	// Track mouse movement com requestAnimationFrame
	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			if (!containerRef.current || !isConnected) return;

			// Cancel previous frame
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}

			// Schedule update for next frame
			rafRef.current = requestAnimationFrame(() => {
				if (!containerRef.current) return;

				const bounds = containerRef.current.getBoundingClientRect();
				const x = ((e.clientX - bounds.left) / bounds.width) * 100;
				const y = ((e.clientY - bounds.top) / bounds.height) * 100;

				// Clamp values
				const clampedX = Math.max(0, Math.min(100, x));
				const clampedY = Math.max(0, Math.min(100, y));

				setMyPosition({ x: clampedX, y: clampedY });

				// Throttle: só envia se passou pelo menos 50ms desde o último envio
				const now = Date.now();
				if (now - lastSendTimeRef.current >= 50) {
					lastSendTimeRef.current = now;

					// Broadcast posição do cursor
					send({
						type: "cursor",
						userId: currentUser.id,
						name: currentUser.name,
						avatar: currentUser.avatar,
						x: clampedX,
						y: clampedY,
						color: currentUser.color,
					});
				}
			});
		},
		[isConnected, send],
	);

	// Prevent context menu
	const handleContextMenu = useCallback((e: Event) => {
		e.preventDefault();
	}, []);

	// Handler para clicar no canvas e criar shape
	const handlePaneClick = useCallback(
		(event: React.MouseEvent) => {
			if (!selectedTool) return;

			// Pegar posição do clique no canvas
			const canvasElement = event.currentTarget as HTMLElement;
			const bounds = canvasElement.getBoundingClientRect();
			const x = event.clientX - bounds.left;
			const y = event.clientY - bounds.top;

			// Criar shape baseado na ferramenta selecionada
			switch (selectedTool) {
				case "rect":
					addShape({
						type: "rect",
						x,
						y,
						width: 100,
						height: 80,
						fill: "#3b82f6", // blue-500
					});
					break;

				case "circle":
					addShape({
						type: "circle",
						x,
						y,
						radius: 50,
						fill: "#10b981", // emerald-500
					});
					break;

				case "text":
					addShape({
						type: "text",
						x,
						y,
						text: "Texto",
						fill: "#ef4444", // red-500
						fontSize: 16,
					});
					break;

				case "line":
					addShape({
						type: "line",
						x,
						y,
						x2: x + 100,
						y2: y,
						stroke: "#8b5cf6", // violet-500
						strokeWidth: 2,
					});
					break;
			}

			// Desselecionar ferramenta após criar shape
			setSelectedTool(null);
		},
		[selectedTool, addShape],
	);

	// Setup pointer events
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("pointermove", handlePointerMove);
		container.addEventListener("contextmenu", handleContextMenu);

		return () => {
			container.removeEventListener("pointermove", handlePointerMove);
			container.removeEventListener("contextmenu", handleContextMenu);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, [handlePointerMove, handleContextMenu]);


	// Todos os usuários (eu + outros)
	const allUsers: CollaborativeUser[] = [
		{
			id: currentUser.id,
			name: currentUser.name,
			avatar: currentUser.avatar,
			x: myPosition.x,
			y: myPosition.y,
			isCurrentUser: true,
		},
		...otherUsers,
	];

	return (
		<main
			ref={containerRef}
			className="relative h-screen w-screen cursor-none select-none overflow-hidden bg-background"
		>
			{/* React Flow Canvas */}
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onPaneClick={handlePaneClick}
				fitView
				proOptions={{ hideAttribution: true }}
				className="[&_.react-flow__background]:opacity-30"
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={16}
					size={1}
					className="opacity-30"
				/>
				<Panel
					position="bottom-left"
					className="pointer-events-auto cursor-auto"
				>
					<CanvasControls />
				</Panel>
				<Panel
					position="top-left"
					className="pointer-events-auto cursor-auto"
				>
					<CanvasToolbar
						selectedTool={selectedTool ?? undefined}
						onToolSelect={setSelectedTool}
					/>
				</Panel>
			</ReactFlow>

			{/* Header */}
			<div className="pointer-events-auto absolute top-8 left-56 z-10 cursor-auto">
				<div className="rounded-lg border border-border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
					<h1 className="font-bold text-3xl tracking-tight">
						Collaborative Canvas
					</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						{isConnected ? (
							<>
								Connected • {otherUsers.length + 1} user
								{otherUsers.length !== 0 ? "s" : ""} online
							</>
						) : (
							"Connecting..."
						)}
					</p>
				</div>
			</div>

			{/* Avatar Stack */}
			<div className="pointer-events-auto absolute top-8 right-8 z-10 cursor-auto">
				<div className="rounded-lg border border-border bg-background/80 p-4 shadow-lg backdrop-blur-sm">
					<AvatarStack animate size={32}>
						{allUsers.map((user) => (
							<Avatar key={user.id}>
								<AvatarImage className="mt-0 mb-0" src={user.avatar} />
								<AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
							</Avatar>
						))}
					</AvatarStack>
				</div>
			</div>

			{/* Cursores Colaborativos */}
			<CollaborativeCursors users={allUsers} />
		</main>
	);
}
