
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/appsidebar";
import AppCanvas from "@/components/appCanvas";
import AppHeader from "@/components/appheader";

import { Circle, Square, XSquare, Pause, Split, Merge, CircleDot } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nodeTypes = [
  {
    type : "start",
    displayName : "Start Node",
    displayIcon : <Circle/>,
  },
  {
    type : "task",
    displayName: "Task Node",
    displayIcon : <Square/>,
  },
  {
    type : "wait",
    displayName: "Wait Node",
    displayIcon : <Pause/>,
  },
  {
    type : "xor",
    displayName: "XOR Node",
    displayIcon : <XSquare/>,
  },
  {
    type : "fork",
    displayName: "Fork Node",
    displayIcon : <Split/>,
  },
  {
    type : "join",
    displayName: "Join Node",
    displayIcon : <Merge/>,
  },
  {
    type : "end",
    displayName: "End Node",
    displayIcon : <CircleDot/>,
  },
]


export default function Workflow() {
  
  return (
    <div className="mx-auto  flex" style={{ position: 'sticky', paddingTop: "1px"}}>
       
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
