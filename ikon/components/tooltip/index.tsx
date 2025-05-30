import { Tooltip as TooltipComp, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shadcn/ui/tooltip";

export function Tooltip({ tooltipContent, side, children }: { tooltipContent: string | React.ReactNode, side: "top" | "right" | "bottom" | "left", children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <TooltipComp>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} >
                    {tooltipContent}
                </TooltipContent>
            </TooltipComp>
        </TooltipProvider>
    );
}