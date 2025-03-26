"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/appsidebar";
import AppCanvas from "@/components/appCanvas";
import AppHeader from "@/components/appheader";

import { Circle, Square, XSquare, Pause, Split, Merge, CircleDot } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavbar } from "@/context/NavbarContext";
import { set } from "react-hook-form";

const nodeTypes = [
  {
    type : "start",
    displayName : "Start",
    displayIcon : <Circle/>,
  },
  {
    type : "task",
    displayName: "Task",
    displayIcon : <Square/>,
  },
  {
    type : "wait",
    displayName: "Wait",
    displayIcon : <Pause/>,
  },
  {
    type : "xor",
    displayName: "XOR",
    displayIcon : <XSquare/>,
  },
  {
    type : "fork",
    displayName: "Fork",
    displayIcon : <Split/>,
  },
  {
    type : "join",
    displayName: "Join",
    displayIcon : <Merge/>,
  },
  {
    type : "end",
    displayName: "End",
    displayIcon : <CircleDot/>,
  },
]


export default function Workflow() {
  const { selectedApp, setSelectedApp } = useNavbar();

  useEffect(() => {
    if (selectedApp.length > 1) {
      setSelectedApp([selectedApp[0]]); // Keep only the first app
    }
  }, []);

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
