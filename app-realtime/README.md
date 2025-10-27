# App Realtime

Serviço de colaboração em tempo real usando PartyKit (Cloudflare Workers + Durable Objects).

## 📁 Estrutura

```
app-realtime/
├── partykit/              # Servidor PartyKit
│   ├── src/
│   │   └── canvas.ts      # Party para colaboração no canvas
│   ├── partykit.json      # Configuração PartyKit
│   ├── package.json       # Dependências
│   └── tsconfig.json      # TypeScript config
└── README.md
```

## 🚀 Como funciona

- **PartyKit**: Roda em Cloudflare Workers com Durable Objects
- **WebSocket**: Conexões persistentes de baixa latência
- **Rooms**: Cada canvas é uma "room" isolada
- **Broadcast**: Mensagens são enviadas para todos os usuários na mesma room

## 🛠️ Desenvolvimento

### Pré-requisitos
```bash
npm install -g partykit
```

### Rodar localmente
```bash
cd partykit
npm install
npm run dev
```

Servidor estará em `http://localhost:1999`

### Deploy
```bash
npm run deploy
```

## 📡 API do Canvas Party

### Mensagens do Cliente → Servidor

#### Cursor Update
```json
{
  "type": "cursor",
  "userId": "user-123",
  "name": "Pedro",
  "avatar": "https://...",
  "x": 50.5,
  "y": 30.2,
  "color": "#3b82f6"
}
```

#### User Presence
```json
{
  "type": "presence",
  "userId": "user-123",
  "name": "Pedro",
  "avatar": "https://...",
  "color": "#3b82f6"
}
```

### Mensagens do Servidor → Cliente

#### Sync (ao conectar)
```json
{
  "type": "sync",
  "users": 3
}
```

#### User Left
```json
{
  "type": "user-left",
  "userId": "user-123"
}
```

## 🔗 Integração com app-web

No Next.js, usar `partysocket`:

```typescript
import usePartySocket from "partysocket/react";

const socket = usePartySocket({
  host: process.env.NEXT_PUBLIC_PARTYKIT_URL,
  room: "canvas-123",
});

// Enviar cursor
socket.send(JSON.stringify({
  type: "cursor",
  userId: "1",
  x: 50,
  y: 50,
}));

// Receber mensagens
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  // Atualizar UI
});
```

## 💰 Custos

- **Free tier**: 100GB de dados/mês
- **Depois**: $0.20 por GB adicional
- Sem custos fixos!

## 🔐 Autenticação (Futuro)

Para adicionar auth, implementar `onBeforeConnect`:

```typescript
async onBeforeConnect(request: Party.Request) {
  const token = new URL(request.url).searchParams.get("token");
  // Validar token com app-web
  // Retornar 401 se inválido
}
```
