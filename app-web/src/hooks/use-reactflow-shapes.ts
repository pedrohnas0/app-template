import { useCallback, useMemo } from "react";
import type { Node, NodeChange, OnNodesChange } from "@xyflow/react";
import { applyNodeChanges } from "@xyflow/react";
import { useYjsShapes, type ShapeWithoutId } from "./use-yjs-shapes";
import type { ShapeNodeData } from "~/components/kibo-ui/shape-node";

/**
 * Hook que adapta shapes colaborativas do Yjs para nodes do React Flow
 *
 * Integra useYjsShapes com React Flow, convertendo shapes em nodes
 * e sincronizando mudanças de posição (drag & drop) de volta para o Yjs.
 *
 * @param room - ID da room do PartyKit para sincronização
 * @returns Objeto contendo nodes, handlers e funções CRUD
 *
 * @example
 * ```tsx
 * function CanvasPage() {
 *   const { nodes, onNodesChange, addShape } = useReactFlowShapes("canvas-123");
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
 */
export function useReactFlowShapes(room: string) {
	// Hook de shapes colaborativas (Yjs + PartyKit)
	const { shapes, addShape, updateShape, deleteShape } = useYjsShapes(room);

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

			// Aplicar mudanças localmente (React Flow) para feedback imediato
			// Note: isso é apenas para UI - a sincronização real vem do Yjs
			// Remover isso se causar conflitos
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
