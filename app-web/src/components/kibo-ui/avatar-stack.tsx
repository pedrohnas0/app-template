import { cn } from "~/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface AvatarStackProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  size?: number;
  animate?: boolean;
}

export const AvatarStack = ({
  children,
  className,
  size = 40,
  animate = false,
  ...props
}: AvatarStackProps) => {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={cn(
            "relative rounded-full ring-2 ring-background",
            animate && "transition-transform hover:scale-110 hover:z-10"
          )}
          style={{
            width: size,
            height: size,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
