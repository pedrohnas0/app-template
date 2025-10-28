"use client";

import Image from "next/image";
import { cn } from "~/lib/utils";
import {
	Cursor,
	CursorBody,
	CursorMessage,
	CursorName,
	CursorPointer,
} from "./cursor";

/**
 * Tipo de usuário com cursor
 */
export type CollaborativeUser = {
	/** ID único do usuário */
	id: string;

	/** Nome do usuário */
	name: string;

	/** URL do avatar */
	avatar: string;

	/** Posição X (pixels absolutos) */
	x: number;

	/** Posição Y (pixels absolutos) */
	y: number;

	/** Mensagem opcional */
	message?: string;

	/** Se é o usuário atual (não aplica transição) */
	isCurrentUser?: boolean;
};

/**
 * Props para o componente CollaborativeCursors
 */
export type CollaborativeCursorsProps = {
	/** Lista de usuários com cursores */
	users: CollaborativeUser[];

	/** Classes CSS adicionais para o container */
	className?: string;
};

/**
 * Definição de cores para cursores
 */
type Color = {
	foreground: string;
	background: string;
};

/**
 * Cores disponíveis (cicla após 4 usuários)
 */
const colors: Color[] = [
	{
		foreground: "text-blue-600",
		background: "bg-blue-100 dark:bg-blue-950",
	},
	{
		foreground: "text-emerald-600",
		background: "bg-emerald-100 dark:bg-emerald-950",
	},
	{
		foreground: "text-rose-600",
		background: "bg-rose-100 dark:bg-rose-950",
	},
	{
		foreground: "text-violet-600",
		background: "bg-violet-100 dark:bg-violet-950",
	},
] as const;

/**
 * Função helper para obter cor por índice
 */
const getColor = (index: number): Color => {
	return colors[index % colors.length]!;
};

/**
 * Cursores colaborativos em tempo real
 *
 * Renderiza cursores de múltiplos usuários com cores únicas,
 * transições suaves e informações do usuário (nome, avatar, mensagem).
 * Segue o design system shadcn/ui.
 *
 * @example
 * ```tsx
 * <CollaborativeCursors
 *   users={[
 *     {
 *       id: "user-1",
 *       name: "Pedro",
 *       avatar: "https://github.com/pedro.png",
 *       x: 50,
 *       y: 50,
 *       message: "Hello!",
 *     }
 *   ]}
 * />
 * ```
 *
 * @remarks
 * - Cores rotativas: blue, emerald, rose, violet (cicla após 4)
 * - Transição suave de 1s para outros usuários
 * - Sem transição para usuário atual
 * - Posicionamento absoluto com percentagens
 * - Usa componentes Cursor existentes
 * - Segue padrão visual de /app/canvas/page.tsx
 */
export function CollaborativeCursors({
	users,
	className,
}: CollaborativeCursorsProps) {
	return (
		<div className={cn(className)}>
			{users.map((user, index) => {
				const color = getColor(index);
				const isCurrentUser = user.isCurrentUser ?? false;

				return (
					<Cursor
						key={user.id}
						data-testid={`cursor-${user.id}`}
						className={cn(
							"pointer-events-none absolute",
							isCurrentUser ? "transition-none" : "transition-all duration-150 ease-out",
						)}
						style={{
							top: `${user.y}px`,
							left: `${user.x}px`,
						}}
					>
						<CursorPointer className={cn(color.foreground)} />
						<CursorBody
							className={cn(
								color.background,
								color.foreground,
								"gap-1 border border-border/50 px-3 py-2 shadow-md",
							)}
						>
							<div className="flex items-center gap-2 opacity-100!">
								<Image
									alt={user.name}
									className="mt-0 mb-0 size-4 rounded-full"
									height={16}
									src={user.avatar}
									unoptimized
									width={16}
								/>
								<CursorName>{user.name}</CursorName>
							</div>
							{user.message && <CursorMessage>{user.message}</CursorMessage>}
						</CursorBody>
					</Cursor>
				);
			})}
		</div>
	);
}
