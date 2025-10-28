import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";

/**
 * Hook para conectar ao PartyKit WebSocket
 *
 * Gerencia conexão, mensagens e estado do WebSocket de forma declarativa.
 * Suporta tanto JSON quanto ArrayBuffer (para Yjs CRDT).
 *
 * @example
 * ```tsx
 * const { socket, isConnected, send } = usePartyKit({
 *   room: "my-canvas-123",
 *   onMessage: (data) => {
 *     if (data instanceof ArrayBuffer) {
 *       // Yjs update
 *       Y.applyUpdate(ydoc, new Uint8Array(data));
 *     } else {
 *       // JSON message
 *       console.log('Received:', data);
 *     }
 *   },
 *   onError: (error) => console.error('WebSocket error:', error)
 * });
 *
 * // Enviar JSON
 * send({ type: 'cursor', x: 100, y: 200 });
 *
 * // Enviar ArrayBuffer (Yjs)
 * send(Y.encodeStateAsUpdate(ydoc));
 * ```
 *
 * @remarks
 * - Reconecta automaticamente ao mudar a `room`
 * - Cleanup automático ao desmontar o componente
 * - Callbacks são estáveis via refs (evita re-renders)
 */

/**
 * Opções para configurar o hook usePartyKit
 */
export type UsePartyKitOptions = {
	/** ID da sala/room do PartyKit - muda a room reconecta automaticamente */
	room: string;

	/**
	 * Callback chamado quando uma mensagem é recebida
	 * @param data - Pode ser um objeto JSON parseado ou ArrayBuffer (Yjs)
	 */
	onMessage?: (data: unknown) => void;

	/**
	 * Callback chamado quando ocorre um erro
	 * @param error - Erro de conexão (ErrorEvent) ou parsing (Error)
	 */
	onError?: (error: ErrorEvent | Error) => void;
};

/**
 * Retorno do hook usePartyKit
 */
export type UsePartyKitReturn = {
	/** Instância do PartySocket - use para acessar propriedades low-level se necessário */
	socket: PartySocket | null;

	/** Estado da conexão - true quando conectado, false quando desconectado */
	isConnected: boolean;

	/**
	 * Envia uma mensagem pelo WebSocket
	 * @param data - Objeto (será JSON.stringify) ou ArrayBuffer (enviado diretamente)
	 */
	send: (data: unknown) => void;
};

/**
 * Hook customizado para gerenciar conexão PartyKit WebSocket
 *
 * @param options - Configurações do hook
 * @returns Objeto contendo socket, estado de conexão e função send
 *
 * @see {@link UsePartyKitOptions} para opções disponíveis
 * @see {@link UsePartyKitReturn} para valores retornados
 */
export function usePartyKit({
	room,
	onMessage,
	onError,
}: UsePartyKitOptions): UsePartyKitReturn {
	const [socket, setSocket] = useState<PartySocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	// Refs para callbacks (evitar re-renders desnecessários quando callbacks mudam)
	const onMessageRef = useRef(onMessage);
	const onErrorRef = useRef(onError);

	// Sincronizar refs com callbacks mais recentes
	useEffect(() => {
		onMessageRef.current = onMessage;
		onErrorRef.current = onError;
	}, [onMessage, onError]);

	// Efeito principal: criar e gerenciar conexão WebSocket
	useEffect(() => {
		// Criar conexão PartySocket
		console.log("🔌 [PARTYKIT] Conectando ao host:", process.env.NEXT_PUBLIC_PARTYKIT_HOST);
		const partySocket = new PartySocket({
			host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
			room,
		});

		// Handler: conexão aberta
		const handleOpen = () => {
			setIsConnected(true);
		};

		// Handler: mensagem recebida
		const handleMessage = (event: MessageEvent) => {
			try {
				// Se for ArrayBuffer, passar direto (usado pelo Yjs para sync CRDT)
				if (event.data instanceof ArrayBuffer) {
					console.log("📥 [PARTYKIT] Recebeu ArrayBuffer:", event.data.byteLength, "bytes");
					onMessageRef.current?.(event.data);
					return;
				}

				// Se for Blob, converter para ArrayBuffer
				if (event.data instanceof Blob) {
					console.log("📥 [PARTYKIT] Recebeu Blob:", event.data.size, "bytes - convertendo para ArrayBuffer");
					event.data.arrayBuffer().then((buffer) => {
						console.log("✅ [PARTYKIT] Blob convertido para ArrayBuffer:", buffer.byteLength, "bytes");
						onMessageRef.current?.(buffer);
					});
					return;
				}

				// Se for string, tentar parsear JSON
				if (typeof event.data === "string") {
					const parsed = JSON.parse(event.data);
					console.log("📥 [PARTYKIT] Recebeu JSON:", parsed.type || "unknown");
					onMessageRef.current?.(parsed);
					return;
				}

				// Outros tipos, logar detalhes
				console.log("📥 [PARTYKIT] Recebeu tipo desconhecido:", {
					type: typeof event.data,
					constructor: event.data?.constructor?.name,
					data: event.data
				});
				onMessageRef.current?.(event.data);
			} catch (error) {
				// Erro ao parsear JSON - notificar via onError
				console.error("❌ [PARTYKIT] Erro ao processar mensagem:", error);
				onErrorRef.current?.(
					error instanceof Error ? error : new Error(String(error)),
				);
			}
		};

		// Handler: conexão fechada
		const handleClose = () => {
			setIsConnected(false);
		};

		// Handler: erro de conexão
		const handleError = (event: Event) => {
			onErrorRef.current?.(event as ErrorEvent);
		};

		// Registrar event listeners
		partySocket.addEventListener("open", handleOpen);
		partySocket.addEventListener("message", handleMessage);
		partySocket.addEventListener("close", handleClose);
		partySocket.addEventListener("error", handleError as EventListener);

		setSocket(partySocket);

		// Cleanup: fechar conexão ao desmontar ou quando room mudar
		return () => {
			partySocket.close();
		};
	}, [room]); // Re-conectar se room mudar

	/**
	 * Envia dados pelo WebSocket
	 * - ArrayBuffer: enviado diretamente (para Yjs)
	 * - Outros: convertidos para JSON
	 */
	const send = (data: unknown) => {
		// Guard: não enviar se socket não estiver disponível
		if (!socket) {
			console.warn("⚠️ [PARTYKIT] Tentou enviar mas socket não disponível");
			return;
		}

		// Se for ArrayBuffer ou Uint8Array, enviar direto (Yjs sync)
		if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
			const size = data instanceof ArrayBuffer ? data.byteLength : data.length;
			console.log("📡 [PARTYKIT] Enviando ArrayBuffer/Uint8Array:", size, "bytes");
			socket.send(data);
			return;
		}

		// Caso contrário, stringify JSON
		console.log("📡 [PARTYKIT] Enviando JSON:", data);
		socket.send(JSON.stringify(data));
	};

	return {
		socket,
		isConnected,
		send,
	};
}
