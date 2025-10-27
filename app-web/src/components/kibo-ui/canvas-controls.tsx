"use client";

import { useReactFlow } from "@xyflow/react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export const CanvasControls = () => {
	const { zoomIn, zoomOut, fitView } = useReactFlow();

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-border bg-background/80 p-2 shadow-lg backdrop-blur-sm">
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => zoomIn()}
				className="h-8 w-8"
				title="Zoom In"
			>
				<Plus className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => zoomOut()}
				className="h-8 w-8"
				title="Zoom Out"
			>
				<Minus className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => fitView()}
				className="h-8 w-8"
				title="Fit View"
			>
				<Maximize2 className="h-4 w-4" />
			</Button>
		</div>
	);
};
