"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JSX } from 'react/jsx-runtime';
import { cn } from '@/lib/utils'; // Utility for merging class names
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

interface AppSidebarProps {
    className?: string;
    nodeTypes: { 
        type: string;
        displayName: string;
        displayIcon: JSX.Element;
    }[];
}

const AppSidebar = ({ nodeTypes,className }: AppSidebarProps) => {
    
    return (
        <>
            <Sidebar className={cn("h-full overflow-auto sidebar w-[4rem]! rounded-sm border ", className)} style={{ position: 'sticky'}}> 
                <SidebarHeader>
                    <div className='flex flex-row gap-2  justify-center items-center'>
                        <div className="flex items-center aspect-square size-9 justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground " >
                            <Code className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none sidebarHeader hidden">
                            <span className="font-semibold">Workflow Maker</span>
                            <span className="">v1.0.0</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu className='items-center'>
                            {
                                nodeTypes.map((nodeType) => (
                                    <SidebarMenuItem key={nodeType.type}>
                                        <SidebarMenuButton asChild>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                    variant={'outline'} 
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("type", nodeType.type);
                                                        e.dataTransfer.effectAllowed = "move";
                                                    }}
                                                >
                                                    {nodeType.displayIcon}
                                                    
                                                </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" align="center">
                                                <p>{nodeType.displayName}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                            
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                            
                        
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <Separator orientation='vertical'/>
        </>
    )

}

export default AppSidebar;