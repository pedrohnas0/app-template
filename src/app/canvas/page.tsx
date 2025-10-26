"use client";

import { AvatarStack } from "~/components/kibo-ui/avatar-stack";
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from "~/components/kibo-ui/cursor";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Position = {
  x: number;
  y: number;
};

type User = {
  id: number;
  name: string;
  avatar: string;
  isCurrentUser?: boolean;
  message?: string;
};

type UserWithPosition = User & {
  position: Position;
};

type Color = {
  foreground: string;
  background: string;
};

const users: User[] = [
  {
    id: 0,
    name: "Pedro Nascimento",
    avatar: "https://github.com/pedrohnas0.png",
    isCurrentUser: true,
  },
  {
    id: 1,
    name: "Hayden Bleasel",
    avatar: "https://github.com/haydenbleasel.png",
  },
  {
    id: 2,
    name: "shadcn",
    avatar: "https://github.com/shadcn.png",
    message: "Can we adjust the color?",
  },
  {
    id: 3,
    name: "Lee Robinson",
    avatar: "https://github.com/leerob.png",
  },
];

const colors: Color[] = [
  {
    foreground: "text-blue-800",
    background: "bg-blue-50",
  },
  {
    foreground: "text-emerald-800",
    background: "bg-emerald-50",
  },
  {
    foreground: "text-rose-800",
    background: "bg-rose-50",
  },
  {
    foreground: "text-sky-800",
    background: "bg-sky-50",
  },
] as const;

// Helper function to generate random position
const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
  y: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
});

// Helper function to get color safely
const getColor = (index: number): Color => {
  return colors[index % colors.length]!;
};

export default function CollaborativeCanvasPage() {
  const [myPosition, setMyPosition] = useState<Position>({ x: 50, y: 50 });
  const [user1Position, setUser1Position] = useState<Position>({
    x: 10,
    y: 8,
  });
  const [user2Position, setUser2Position] = useState<Position>({
    x: 30,
    y: 40,
  });
  const [user3Position, setUser3Position] = useState<Position>({
    x: 70,
    y: 50,
  });

  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  // Track mouse movement with requestAnimationFrame for better performance
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;

    // Cancel previous frame if still pending
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update for next frame
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const bounds = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - bounds.left) / bounds.width) * 100;
      const y = ((e.clientY - bounds.top) / bounds.height) * 100;

      // Clamp values to prevent cursor going outside bounds
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      setMyPosition({ x: clampedX, y: clampedY });
    });
  }, []);

  // Prevent context menu
  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

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

  // Store all user positions in a single array for easier access
  const userPositions = [myPosition, user1Position, user2Position, user3Position];

  // Create separate useEffects for each user to move at different intervals
  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser1Position(getRandomPosition());
      },
      Math.random() * 3000 + 2000
    ); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser2Position(getRandomPosition());
      },
      Math.random() * 4000 + 3000
    ); // Random interval between 3-7 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser3Position(getRandomPosition());
      },
      Math.random() * 2500 + 1500
    ); // Random interval between 1.5-4 seconds

    return () => clearInterval(interval);
  }, []);

  // Assign positions to users
  const usersWithPositions: UserWithPosition[] = users.map((user, index) => ({
    ...user,
    position: userPositions[index]!,
  }));

  return (
    <main
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(var(--color-secondary),transparent_1px)] [background-size:16px_16px] cursor-none select-none"
    >
      {/* Header */}
      <div className="absolute top-8 left-8 z-10 pointer-events-auto cursor-auto">
        <h1 className="text-3xl font-bold">Collaborative Canvas</h1>
        <p className="text-muted-foreground">
          Watch the cursors move around in real-time!
        </p>
      </div>

      {/* Avatar Stack */}
      <div className="absolute top-8 right-8 z-10 pointer-events-none">
        <AvatarStack animate size={32}>
          {usersWithPositions.map((user) => (
            <Avatar key={user.id}>
              <AvatarImage className="mt-0 mb-0" src={user.avatar} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarStack>
      </div>

      {/* Cursors */}
      {usersWithPositions.map((user, index) => (
        <Cursor
          className={cn(
            "absolute pointer-events-none",
            index === 0 ? "transition-none" : "transition-all duration-1000"
          )}
          key={user.id}
          style={{
            top: `${user.position.y}%`,
            left: `${user.position.x}%`,
          }}
        >
          <CursorPointer
            className={cn(getColor(index).foreground)}
          />
          <CursorBody
            className={cn(
              getColor(index).background,
              getColor(index).foreground,
              "gap-1 px-3 py-2"
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
      ))}
    </main>
  );
}
