import { useEffect, useState } from "react";
import * as Y from "yjs";

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
 * Opções para configurar o hook useYjsShapes (Nova API - Plan 02)
 */
export type UseYjsShapesOptions = {
	/**
	 * Função para enviar updates Yjs para o servidor
	 * (Deve vir de usePartyKit externo)
	 */
	send: (data: unknown) => void;

	/**
	 * Callback para registrar handler de Yjs updates remotos
	 * Retorna função de cleanup
	 */
	onYjsUpdate?: (handler: (update: Uint8Array) => void) => () => void;
};

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
 * ⚠️ NOVA API (Plan 02): Não cria conexão PartyKit interna
 *
 * Este hook gerencia APENAS a lógica Yjs (CRDT). A conexão WebSocket
 * deve ser gerenciada externamente para unificar com outras mensagens
 * (como cursores).
 *
 * @param options - Configurações do hook
 * @param options.send - Função para enviar Yjs updates (de usePartyKit)
 * @param options.onYjsUpdate - Callback para registrar handler de updates remotos
 * @returns Objeto contendo shapes e funções CRUD
 *
 * @example
 * ```tsx
 * // 1. Criar conexão PartyKit única
 * const { send } = usePartyKit({
 *   room: "canvas-123",
 *   onMessage: (data) => {
 *     if (data instanceof ArrayBuffer) {
 *       // Processar Yjs update
 *     } else {
 *       // Processar cursor/outro
 *     }
 *   }
 * });
 *
 * // 2. Usar hook com conexão externa
 * const { shapes, addShape } = useYjsShapes({
 *   send,
 *   onYjsUpdate: (handler) => {
 *     // Registrar handler que receberá ArrayBuffer
 *     return () => {}; // cleanup function
 *   }
 * });
 * ```
 *
 * @remarks
 * - Usa Yjs CRDT para garantir convergência eventual
 * - Requer conexão PartyKit EXTERNA (previne múltiplas conexões)
 * - Mudanças locais e remotas são aplicadas sem conflitos
 * - Cleanup automático ao desmontar
 */
export function useYjsShapes(options: UseYjsShapesOptions): UseYjsShapesReturn {
	const { send, onYjsUpdate } = options;

	// Estado React das shapes
	const [shapes, setShapes] = useState<Shape[]>([]);

	// Criar Yjs document (apenas uma vez)
	const [doc] = useState(() => new Y.Doc());

	// Obter Y.Array de shapes do documento
	const shapesArray = doc.getArray<Shape>("shapes");

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

	// Observer para enviar updates locais
	useEffect(() => {
		const updateHandler = (update: Uint8Array) => {
			// Enviar update para servidor via send externo
			console.log("📤 [YJS] Enviando update local:", update.length, "bytes");
			send(update);
		};

		// Registrar handler para updates locais
		doc.on("update", updateHandler);

		// Cleanup: remover handler
		return () => {
			doc.off("update", updateHandler);
		};
	}, [doc, send]);

	// Registrar handler para updates REMOTOS via callback
	useEffect(() => {
		if (!onYjsUpdate) return;

		// Handler que aplica updates remotos ao doc local
		const remoteUpdateHandler = (update: Uint8Array) => {
			console.log("📥 [YJS] Recebeu update remoto:", update.length, "bytes");
			Y.applyUpdate(doc, update);
			console.log("✅ [YJS] Update remoto aplicado");
		};

		// Registrar via callback (retorna cleanup)
		const cleanup = onYjsUpdate(remoteUpdateHandler);

		// Cleanup: desregistrar handler
		return cleanup;
	}, [doc, onYjsUpdate]);

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
