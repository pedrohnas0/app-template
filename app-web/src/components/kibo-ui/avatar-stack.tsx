import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "~/lib/utils";

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
		<div className={cn("-space-x-2 flex", className)} {...props}>
			{childrenArray.map((child, index) => (
				<div
					key={index}
					className={cn(
						"relative rounded-full ring-2 ring-background",
						animate && "transition-transform hover:z-10 hover:scale-110",
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
