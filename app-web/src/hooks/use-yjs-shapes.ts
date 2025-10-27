import { useEffect, useState } from "react";
import * as Y from "yjs";
import { usePartyKit } from "./use-partykit";

/**
 * Hook para gerenciar shapes colaborativas usando Yjs CRDT
 *
 * Integra Yjs com PartyKit para sincronização em tempo real de shapes
 * em um canvas colaborativo. Usa Y.Array para garantir convergência eventual
 * sem conflitos.
 */

/**
 * Tipo base para todas as shapes
 */
type BaseShape = {
	id: string;
	x: number;
	y: number;
	fill: string;
};

/**
 * Shape retângulo
 */
export type RectShape = BaseShape & {
	type: "rect";
	width: number;
	height: number;
};

/**
 * Shape círculo
 */
export type CircleShape = BaseShape & {
	type: "circle";
	radius: number;
};

/**
 * Shape texto
 */
export type TextShape = BaseShape & {
	type: "text";
	text: string;
	fontSize?: number;
};

/**
 * Shape linha
 */
export type LineShape = Omit<BaseShape, "fill"> & {
	type: "line";
	x2: number;
	y2: number;
	stroke: string;
	strokeWidth?: number;
};

/**
 * União de todos os tipos de shapes
 */
export type Shape = RectShape | CircleShape | TextShape | LineShape;

/**
 * Shape sem ID (usado ao criar novas shapes)
 */
export type ShapeWithoutId = Omit<Shape, "id">;

/**
 * Retorno do hook useYjsShapes
 */
export type UseYjsShapesReturn = {
	/** Array de shapes sincronizadas */
	shapes: Shape[];

	/**
	 * Adiciona uma nova shape ao canvas
	 * @param shape - Shape sem ID (ID é gerado automaticamente)
	 */
	addShape: (shape: ShapeWithoutId) => void;

	/**
	 * Atualiza uma shape existente
	 * @param id - ID da shape a atualizar
	 * @param updates - Campos a atualizar (partial)
	 */
	updateShape: (id: string, updates: Partial<Shape>) => void;

	/**
	 * Deleta uma shape
	 * @param id - ID da shape a deletar
	 */
	deleteShape: (id: string) => void;
};

/**
 * Hook customizado para gerenciar shapes colaborativas com Yjs
 *
 * @param room - ID da room do PartyKit para sincronização
 * @returns Objeto contendo shapes e funções CRUD
 *
 * @example
 * ```tsx
 * const { shapes, addShape, updateShape, deleteShape } = useYjsShapes("canvas-123");
 *
 * // Adicionar shape
 * addShape({
 *   type: "rect",
 *   x: 100,
 *   y: 100,
 *   width: 50,
 *   height: 50,
 *   fill: "#ff0000"
 * });
 *
 * // Atualizar shape
 * updateShape(shapeId, { x: 150, y: 150 });
 *
 * // Deletar shape
 * deleteShape(shapeId);
 * ```
 *
 * @remarks
 * - Usa Yjs CRDT para garantir convergência eventual
 * - Sincroniza automaticamente através do PartyKit
 * - Mudanças locais e remotas são aplicadas sem conflitos
 * - Cleanup automático ao desmontar
 */
export function useYjsShapes(room: string): UseYjsShapesReturn {
	// Estado React das shapes
	const [shapes, setShapes] = useState<Shape[]>([]);

	// Criar Yjs document (apenas uma vez)
	const [doc] = useState(() => new Y.Doc());

	// Obter Y.Array de shapes do documento
	const shapesArray = doc.getArray<Shape>("shapes");

	// Conectar ao PartyKit para sincronização
	const { send } = usePartyKit({
		room,
		onMessage: (data) => {
			// Aplicar updates remotos do Yjs
			if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
				Y.applyUpdate(doc, new Uint8Array(data));
			}
			// Ignorar mensagens que não são Yjs updates (ex: cursores)
		},
	});

	// Observer para mudanças no Yjs array
	useEffect(() => {
		// Callback chamado quando o array muda
		const observer = () => {
			setShapes(shapesArray.toArray());
		};

		// Registrar observer
		shapesArray.observe(observer);

		// Chamar observer inicial para sincronizar estado
		observer();

		// Cleanup: remover observer
		return () => {
			shapesArray.unobserve(observer);
		};
	}, [shapesArray]);

	// Observer para enviar updates locais ao PartyKit
	useEffect(() => {
		const updateHandler = (update: Uint8Array) => {
			// Enviar update para outros clientes via PartyKit
			send(update);
		};

		// Registrar handler para updates locais
		doc.on("update", updateHandler);

		// Cleanup: remover handler
		return () => {
			doc.off("update", updateHandler);
		};
	}, [doc, send]);

	/**
	 * Adiciona uma nova shape ao array Yjs
	 */
	const addShape = (shape: ShapeWithoutId) => {
		const newShape: Shape = {
			...shape,
			id: crypto.randomUUID(),
		} as Shape;

		shapesArray.push([newShape]);
	};

	/**
	 * Atualiza uma shape existente no array Yjs
	 */
	const updateShape = (id: string, updates: Partial<Shape>) => {
		const index = shapes.findIndex((s) => s.id === id);

		if (index === -1) {
			// Shape não encontrada - não fazer nada
			return;
		}

		const current = shapesArray.get(index);

		// Deletar shape antiga e inserir shape atualizada
		shapesArray.delete(index, 1);
		shapesArray.insert(index, [{ ...current, ...updates } as Shape]);
	};

	/**
	 * Deleta uma shape do array Yjs
	 */
	const deleteShape = (id: string) => {
		const index = shapes.findIndex((s) => s.id === id);

		if (index === -1) {
			// Shape não encontrada - não fazer nada
			return;
		}

		shapesArray.delete(index, 1);
	};

	return {
		shapes,
		addShape,
		updateShape,
		deleteShape,
	};
}
