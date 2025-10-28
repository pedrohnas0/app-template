"use client";

import dynamic from "next/dynamic";
import {
	Background,
	BackgroundVariant,
	type Edge,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
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
const getCurrentUser = () => ({
	id: crypto.randomUUID(),
	name: "Você",
	avatar: "https://github.com/pedrohnas0.png",
	color: userColors[0],
});

/**
 * Componente interno que usa useReactFlow para conversão de coordenadas
 */
function CollaborativeCanvasInner() {
	// Room ID (pode vir da URL no futuro)
	const roomId = "demo-canvas";

	// Estado local
	const [currentUser] = useState(getCurrentUser);
	const [myPosition, setMyPosition] = useState({ x: 50, y: 50 });
	const [otherUsers, setOtherUsers] = useState<CollaborativeUser[]>([]);
	const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
	const [edges] = useState<Edge[]>([]);
	const containerRef = useRef<HTMLElement>(null);
	const rafRef = useRef<number | null>(null);
	const lastSendTimeRef = useRef<number>(0);

	// Ref para handler de Yjs updates remotos
	const yjsUpdateHandlerRef = useRef<((update: Uint8Array) => void) | null>(
		null,
	);

	// Node types para React Flow
	const nodeTypes = useMemo(() => ({ shapeNode: ShapeNode }), []);

	// React Flow instance para conversão de coordenadas
	const reactFlowInstance = useReactFlow();

	// Hook PartyKit - CONEXÃO ÚNICA para cursores E shapes
	const { send, isConnected } = usePartyKit({
		room: roomId,
		onMessage: (data: any) => {
			// ====== PROCESSAR ARRAYBUFFER (Yjs updates) ======
			if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
				console.log("📦 [PAGE] Recebeu ArrayBuffer:", data);
				// Converter ArrayBuffer para Uint8Array se necessário
				const update =
					data instanceof ArrayBuffer ? new Uint8Array(data) : data;

				// Aplicar update via handler registrado
				if (yjsUpdateHandlerRef.current) {
					console.log("✅ [PAGE] Handler registrado, aplicando update");
					yjsUpdateHandlerRef.current(update);
				} else {
					console.warn("⚠️ [PAGE] Handler NÃO registrado!");
				}
				return;
			}

			// ====== PROCESSAR JSON (cursores e outros) ======
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

	// Callback para registrar handler de Yjs updates
	const onYjsUpdate = useCallback(
		(handler: (update: Uint8Array) => void) => {
			console.log("🔧 [PAGE] Registrando handler de Yjs updates");
			yjsUpdateHandlerRef.current = handler;
			return () => {
				console.log("🧹 [PAGE] Limpando handler de Yjs updates");
				yjsUpdateHandlerRef.current = null;
			};
		},
		[],
	);

	// Hook para shapes colaborativas (React Flow + Yjs)
	const { nodes, onNodesChange, addShape } = useReactFlowShapes({
		send,
		onYjsUpdate,
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

				// Converter coordenadas de tela → canvas do React Flow (considerando zoom/pan)
				const flowPosition = reactFlowInstance.screenToFlowPosition({
					x: e.clientX,
					y: e.clientY,
				});

				setMyPosition(flowPosition);

				// Throttle: só envia se passou pelo menos 50ms desde o último envio
				const now = Date.now();
				if (now - lastSendTimeRef.current >= 50) {
					lastSendTimeRef.current = now;

					// Broadcast posição do cursor (já em coordenadas do canvas)
					send({
						type: "cursor",
						userId: currentUser.id,
						name: currentUser.name,
						avatar: currentUser.avatar,
						x: flowPosition.x,
						y: flowPosition.y,
						color: currentUser.color,
					});
				}
			});
		},
		[isConnected, send, reactFlowInstance],
	);

	// Prevent context menu
	const handleContextMenu = useCallback((e: Event) => {
		e.preventDefault();
	}, []);

	// Handler para clicar no canvas e criar shape
	const handlePaneClick = useCallback(
		(event: React.MouseEvent) => {
			if (!selectedTool) return;

			// Converter posição do clique para coordenadas do canvas (considerando zoom/pan)
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Criar shape baseado na ferramenta selecionada
			switch (selectedTool) {
				case "rect":
					addShape({
						type: "rect",
						x: flowPosition.x,
						y: flowPosition.y,
						width: 100,
						height: 80,
						fill: "#3b82f6", // blue-500
					} as Omit<import("~/hooks/use-yjs-shapes").RectShape, "id">);
					break;

				case "circle":
					addShape({
						type: "circle",
						x: flowPosition.x,
						y: flowPosition.y,
						radius: 50,
						fill: "#10b981", // emerald-500
					} as Omit<import("~/hooks/use-yjs-shapes").CircleShape, "id">);
					break;

				case "text":
					addShape({
						type: "text",
						x: flowPosition.x,
						y: flowPosition.y,
						text: "Texto",
						fill: "#ef4444", // red-500
						fontSize: 16,
					} as Omit<import("~/hooks/use-yjs-shapes").TextShape, "id">);
					break;

				case "line":
					addShape({
						type: "line",
						x: flowPosition.x,
						y: flowPosition.y,
						x2: flowPosition.x + 100,
						y2: flowPosition.y,
						stroke: "#8b5cf6", // violet-500
						strokeWidth: 2,
					} as Omit<import("~/hooks/use-yjs-shapes").LineShape, "id">);
					break;
			}

			// Desselecionar ferramenta após criar shape
			setSelectedTool(null);
		},
		[selectedTool, addShape, reactFlowInstance],
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
	// Converter coordenadas do canvas (flow) → tela (screen) para renderização
	const myScreenPosition = reactFlowInstance.flowToScreenPosition({
		x: myPosition.x,
		y: myPosition.y,
	});

	const allUsers: CollaborativeUser[] = [
		{
			id: currentUser.id,
			name: currentUser.name,
			avatar: currentUser.avatar,
			x: myScreenPosition.x,
			y: myScreenPosition.y,
			isCurrentUser: true,
		},
		...otherUsers.map((user) => {
			// Converter posição de cada usuário de flow → screen
			const screenPos = reactFlowInstance.flowToScreenPosition({
				x: user.x,
				y: user.y,
			});
			return {
				...user,
				x: screenPos.x,
				y: screenPos.y,
			};
		}),
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
	return (
		<ReactFlowProvider>
			<CollaborativeCanvasInner />
		</ReactFlowProvider>
	);
}
