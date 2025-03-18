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
            <Sidebar className={cn("h-full overflow-auto ", className)} style={{ position: 'sticky'}}> 
                <SidebarHeader>
                    <div className='flex flex-row gap-2 m-2'>
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Code className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Workflow Maker</span>
                            <span className="">v1.0.0</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {
                                nodeTypes.map((nodeType) => (
                                    <SidebarMenuItem key={nodeType.type}>
                                        <SidebarMenuButton asChild>
                                            <Button 
                                                variant={'outline'} 
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData("type", nodeType.type);
                                                    e.dataTransfer.effectAllowed = "move";
                                                }}
                                            >
                                                {nodeType.displayIcon}
                                                {nodeType.displayName}
                                            </Button>
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