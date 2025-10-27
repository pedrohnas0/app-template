import { cn } from "~/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface CursorProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export const Cursor = ({ children, className, ...props }: CursorProps) => {
  return (
    <div className={cn("flex items-start gap-1", className)} {...props}>
      {children}
    </div>
  );
};

interface CursorPointerProps extends ComponentPropsWithoutRef<"svg"> {}

export const CursorPointer = ({
  className,
  ...props
}: CursorPointerProps) => {
  return (
    <svg
      className={cn("size-6 fill-current", className)}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
    </svg>
  );
};

interface CursorBodyProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export const CursorBody = ({
  children,
  className,
  ...props
}: CursorBodyProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-start rounded-md text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CursorNameProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
}

export const CursorName = ({
  children,
  className,
  ...props
}: CursorNameProps) => {
  return (
    <span className={cn("whitespace-nowrap", className)} {...props}>
      {children}
    </span>
  );
};

interface CursorMessageProps extends ComponentPropsWithoutRef<"p"> {
  children: ReactNode;
}

export const CursorMessage = ({
  children,
  className,
  ...props
}: CursorMessageProps) => {
  return (
    <p className={cn("text-xs", className)} {...props}>
      {children}
    </p>
  );
};
