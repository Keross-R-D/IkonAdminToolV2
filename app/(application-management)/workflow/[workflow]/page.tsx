"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/appsidebar";
import AppCanvas from "@/components/appCanvas";

import { Circle, Square, XSquare, Pause, Split, Merge, CircleDot } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";


const nodeTypes = [
  {
    type: "Start",
    displayName: "Start",
    displayIcon: <Circle />,
  },
  {
    type: "Task",
    displayName: "Task",
    displayIcon: <Square />,
  },
  {
    type: "Wait",
    displayName: "Wait",
    displayIcon: <Pause />,
  },
  {
    type: "XOR",
    displayName: "XOR",
    displayIcon: <XSquare />,
  },
  {
    type: "Fork",
    displayName: "Fork",
    displayIcon: <Split />,
  },
  {
    type: "Join",
    displayName: "Join",
    displayIcon: <Merge />,
  },
  {
    type: "End",
    displayName: "End",
    displayIcon: <CircleDot />,
  },
]


export default function Workflow() {
  


  return (
    <div className="flex h-full" style={{ position: 'sticky', paddingTop: "1px" }}>
      
      <SidebarProvider >
        <AppSidebar className="w-64" nodeTypes={nodeTypes} /> {/*Sidebar width set */}
        <SidebarInset className="">
          <ReactFlowProvider>
            <AppCanvas />
          </ReactFlowProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>

  );
}
