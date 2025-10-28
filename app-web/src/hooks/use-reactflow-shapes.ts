import { useCallback, useMemo } from "react";
import type { Node, NodeChange, OnNodesChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import {
	useYjsShapes,
	type ShapeWithoutId,
	type UseYjsShapesOptions,
} from "./use-yjs-shapes";
import type { ShapeNodeData } from "~/components/kibo-ui/shape-node";

/**
 * Hook que adapta shapes colaborativas do Yjs para nodes do React Flow
 *
 * ⚠️ NOVA API (Plan 02): Requer conexão PartyKit externa
 *
 * Integra useYjsShapes com React Flow, convertendo shapes em nodes
 * e sincronizando mudanças de posição (drag & drop) de volta para o Yjs.
 * A conexão WebSocket deve ser gerenciada externamente.
 *
 * @param options - Configurações do hook
 * @param options.send - Função para enviar Yjs updates (de usePartyKit)
 * @param options.onYjsUpdate - Callback para registrar handler de updates remotos
 * @returns Objeto contendo nodes, handlers e funções CRUD
 *
 * @example
 * ```tsx
 * function CanvasPage() {
 *   // 1. Criar conexão PartyKit única
 *   const { send } = usePartyKit({
 *     room: "canvas-123",
 *     onMessage: (data) => {
 *       if (data instanceof ArrayBuffer) {
 *         // Processar Yjs update
 *       } else {
 *         // Processar cursor/outro
 *       }
 *     }
 *   });
 *
 *   // 2. Usar hook com conexão externa
 *   const { nodes, onNodesChange, addShape } = useReactFlowShapes({
 *     send,
 *     onYjsUpdate: (handler) => {
 *       // Registrar handler
 *       return () => {}; // cleanup
 *     }
 *   });
 *
 *   return (
 *     <ReactFlow
 *       nodes={nodes}
 *       nodeTypes={{ shapeNode: ShapeNode }}
 *       onNodesChange={onNodesChange}
 *     >
 *       <button onClick={() => addShape({ type: "rect", ... })}>
 *         Add Rectangle
 *       </button>
 *     </ReactFlow>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Converte automaticamente shapes Yjs → React Flow nodes
 * - Sincroniza posição no drag & drop
 * - Usa defaultValues inteligentes para dimensões
 * - Compatible com React Flow 12+
 * - Requer conexão PartyKit EXTERNA (previne múltiplas conexões)
 */
export function useReactFlowShapes(options: UseYjsShapesOptions) {
	// Hook de shapes colaborativas (Yjs, sem conexão interna)
	const { shapes, addShape, updateShape, deleteShape } = useYjsShapes(options);

	/**
	 * Converte shapes Yjs em nodes do React Flow
	 */
	const nodes: Node<ShapeNodeData>[] = useMemo(() => {
		return shapes.map((shape) => ({
			id: shape.id,
			type: "shapeNode",
			position: { x: shape.x, y: shape.y },
			data: { shape },
			// Nodes sempre selecionáveis e draggable
			selectable: true,
			draggable: true,
		}));
	}, [shapes]);

	/**
	 * Handler para mudanças nos nodes (drag, select, etc)
	 *
	 * Sincroniza mudanças de posição de volta para o Yjs
	 */
	const onNodesChange: OnNodesChange<Node<ShapeNodeData>> = useCallback(
		(changes: NodeChange<Node<ShapeNodeData>>[]) => {
			// Processar mudanças de posição
			changes.forEach((change) => {
				if (change.type === "position" && change.dragging === false) {
					// Drag concluído - atualizar posição no Yjs
					const { id, position } = change;
					if (position) {
						updateShape(id, {
							x: position.x,
							y: position.y,
						});
					}
				}
			});
		},
		[updateShape],
	);

	/**
	 * Wrapper para addShape com valores padrão inteligentes
	 */
	const addShapeWithDefaults = useCallback(
		(shape: ShapeWithoutId) => {
			// Adicionar valores padrão baseados no tipo
			const shapeWithDefaults: ShapeWithoutId = {
				...shape,
				// Adicionar defaults específicos por tipo se necessário
			};

			addShape(shapeWithDefaults);
		},
		[addShape],
	);

	return {
		/**
		 * Nodes do React Flow (convertidos das shapes Yjs)
		 */
		nodes,

		/**
		 * Handler para mudanças nos nodes (drag, select, delete, etc)
		 */
		onNodesChange,

		/**
		 * Adiciona uma nova shape ao canvas
		 */
		addShape: addShapeWithDefaults,

		/**
		 * Atualiza uma shape existente
		 */
		updateShape,

		/**
		 * Deleta uma shape
		 */
		deleteShape,

		/**
		 * Shapes originais (útil para debug ou lógica custom)
		 */
		shapes,
	};
}
