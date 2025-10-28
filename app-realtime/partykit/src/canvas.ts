import type * as Party from "partykit/server";
import * as Y from "yjs";

type CursorMessage = {
  type: "cursor";
  userId: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
  color: string;
};

type PresenceMessage = {
  type: "presence";
  userId: string;
  name: string;
  avatar: string;
  color: string;
};

type Message = CursorMessage | PresenceMessage;

/**
 * Canvas Party - Gerencia colaboração em tempo real no canvas
 * Cada "room" (canvas) é uma instância deste servidor
 */
export default class CanvasParty implements Party.Server {
  // Yjs document (shared state)
  doc: Y.Doc;

  constructor(readonly room: Party.Room) {
    this.doc = new Y.Doc();
  }

  /**
   * Quando um usuário conecta
   */
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `User ${conn.id} connected to room ${this.room.id}`
    );

    // Enviar estado atual do Yjs
    const state = Y.encodeStateAsUpdate(this.doc);
    conn.send(state);

    // Envia lista de usuários conectados para o novo usuário
    const connections = [...this.room.getConnections()];
    conn.send(
      JSON.stringify({
        type: "sync",
        users: connections.length,
      })
    );
  }

  /**
   * Quando recebe mensagem de um usuário
   */
  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    console.log("📨 [SERVER] Recebeu mensagem de", sender.id, "- Tipo:", message instanceof ArrayBuffer ? "ArrayBuffer" : "JSON");

    if (message instanceof ArrayBuffer) {
      // É um update do Yjs
      console.log("📦 [SERVER] ArrayBuffer recebido:", message.byteLength, "bytes");
      Y.applyUpdate(this.doc, new Uint8Array(message));

      // Broadcast para outros
      console.log("📡 [SERVER] Broadcasting ArrayBuffer para outros clientes");
      this.room.broadcast(message, [sender.id]);
    } else {
      // Mensagem normal (cursor, etc)
      try {
        const data: Message = JSON.parse(message);
        console.log("💬 [SERVER] JSON recebido:", data.type);

        // Broadcast para todos exceto o remetente
        this.room.broadcast(message, [sender.id]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    }
  }

  /**
   * Quando um usuário desconecta
   */
  onClose(conn: Party.Connection) {
    console.log(`User ${conn.id} disconnected from room ${this.room.id}`);

    // Notifica outros usuários
    this.room.broadcast(
      JSON.stringify({
        type: "user-left",
        userId: conn.id,
      }),
      [conn.id]
    );
  }

  /**
   * onError é chamado quando há erro na conexão
   */
  onError(conn: Party.Connection, error: Error) {
    console.error(`Error for user ${conn.id}:`, error);
  }
}

CanvasParty satisfies Party.Worker;
