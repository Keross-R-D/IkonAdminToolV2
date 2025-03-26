"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap,
  Controls,
  NodeResizer,
  MarkerType,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';

import { Circle, Square, XSquare, Pause, Split, Merge, CircleDot } from "lucide-react";

import TaskNode from '@/components/nodes/taskNode';
import StartNode from '@/components/nodes/startNode';
import XORNode from '@/components/nodes/xorNode';
import EndNode from '@/components/nodes/endNode';
import JoinNode from '@/components/nodes/joinNode';
import WaitNode from '@/components/nodes/waitNode';
import ForkNode from '@/components/nodes/forkNode';

import AppHeader from "@/components/appheader";
import SelfConnecting from '@/components/edges/selfConnecting';

import { v4 as uuidv4 } from 'uuid';
import { genNodeColor } from '@/lib/utils';
import getEdgeHeightManager from '@/hooks/edgeHeightManager';
import EdgeTransitionCategory from '@/enums/edgeTransitionType';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Chat from '@/components/generic/chat';

import ELK, {ElkNode} from 'elkjs';
import useLayoutedElements from '@/hooks/autolayout';
import { useNavbar } from '@/context/NavbarContext';

interface Node {
    id: string,
    type: string,
    data: {
        id: string,
        label: string
    },
    position: {
        x: number,
        y: number
    }
}

interface Edge {
    id: string,
    source: string,
    target: string,
    type: string,
    animated: boolean,
    label: string,
    markerEnd: {
        type: MarkerType
    },
    deleteAble: boolean,
    data: {
        deleteEdge: any,
        edgeColor: string,
        height: number,
        edgeTransitionCategory: EdgeTransitionCategory,
        edgeAdditionalInfo: any
    }
}

function getEdgeTransitionCategory(sourceType:string) {
    if (sourceType === "xor") {
        return EdgeTransitionCategory.XOR_TYPE
    }
    else if (sourceType === "fork" || sourceType === "join"){
        return EdgeTransitionCategory.FORK_JOIN_TYPE
    }
    else {
        return EdgeTransitionCategory.GENERIC_TYPE
    }
}


const AppCanvas = () => {

    const nodeTypes = {
        task: (props: any) => <TaskNode {...props} updateNodeLabel={updateNodeLabel} />,
        start: StartNode,
        xor: XORNode,
        join: JoinNode,
        fork: ForkNode,
        wait: WaitNode,
        end: EndNode,
    }

    const edgeTypes = {
        'selfConnecting': SelfConnecting
    }

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const {getLayoutedElements} = useLayoutedElements();

    const { screenToFlowPosition } = useReactFlow();

    const [getNextHeight,removeEdge] = getEdgeHeightManager(150,10);

    // interface App {
    //     id: string;
    //     // Add other properties if needed
    // }
    
   const { selectedApp,setSelectedApp } = useNavbar();

   const readProcessModel = async (folderId: string) => {
    try {
      const response = await fetch("/api/read_processModal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Error:", data.error);
        alert(`❌ Error: ${data.error}`);
        return null;
      }
  
      console.log("Process Model Data:", data.data);
      return data.data;
    } catch (error) {
      console.error("Request failed:", error);
    }
  };
  
  useEffect(() => {
    if (!selectedApp[0]?.id) return;

    const fetchProcessModel = async () => {
            const data = await readProcessModel(selectedApp[0].id);
            if (data) {
                data.nodes.forEach((node:any) => node.data.deleteNode = deleteNode);
                setNodes(data.nodes);
                setEdges(data.edges);
            }
        };

        fetchProcessModel();
    }, [selectedApp[0]?.id]);
  

    const updateNodeLabel = (nodeId: string, newLabel: string) => {
        debugger;
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
            )
        );
    };

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => {

            const label = "Testing ..."
            const animated = true
            const markerEnd = {
                type: MarkerType.ArrowClosed,
            }
            
            const sourceType = params.source.split('_')[0];

            const id = uuidv4()
            const data = {
                deleteEdge: deleteEdge,
                height: getNextHeight(params.source,params.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {}
            }

            const deleteAble=true
            const type = "selfConnecting";
            // const type = "smoothstep";
            const modifiedParams = {...params,type,label,animated,markerEnd,deleteAble,data,id}

            // return addEdge(modifiedParams, eds)
            return [...eds,modifiedParams]
        }),
        [setEdges],
    );

    const getCurrentTheme = (): 'light' | 'dark' | 'system' | undefined => {
        const { theme } = useTheme();
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            return theme;
        }
        return 'dark';
    }

    interface DropEvent extends React.DragEvent<HTMLDivElement> {
        dataTransfer: DataTransfer & {
            getData: (format: string) => string;
        };
    }

    const getEdgeSpecificModifyCallback = (edgeId: string) => {
        const modifyEdgeInfo = (edgeInfo: { [key:string]: any }) => {
            setEdges((eds) => {
                
                const modifiedEdges = eds.map(e => {
                    if (e.id === edgeId){
                        e.label = edgeInfo.edgeLabel

                        e.data.edgeAdditionalInfo = edgeInfo
                    }

                    return e;
                })

                return modifiedEdges
            })
        }

        return modifyEdgeInfo;
    }
    

    const onDrop = (event: DropEvent) => {
        event.preventDefault();
        const type: string = event.dataTransfer.getData('type');

        if(!type){
            return;
        }

        const newNodeId: string = `${type}_${uuidv4()}`;
        
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        })

        console.log(nodes);
        setNodes((nodes) => [
            ...nodes,
            {
                id: newNodeId,
                type,
                position,
                data: {
                    'id': newNodeId,
                    'deleteNode': deleteNode,
                    'label': 'New Node',
                }
            },
        ]);
    } 

    const deleteNode = (nodeId:string) => {
        setNodes((nodes) => {
            debugger;
            const newNodesList = nodes.filter(e => e.id !== nodeId)
            return newNodesList;
        })
    }

    const deleteEdge = (edgeId:string) => {
        setEdges((edges) => {
            const newEdgesList = edges.filter(e => e.id !== edgeId)
            return newEdgesList;
        })
    }

    const setProcessModel = ({nodes,edges}:{nodes: any, edges: any}) => {

        nodes.forEach((node:any) => node.data.deleteNode = deleteNode);
        edges.forEach((edge:any) => {
            
            const sourceType = edge.source.split('_')[0];
            edge.data = {
                deleteEdge,
                height: getNextHeight(edge.source,edge.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(edge.id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {}
            }
        });

        setNodes(nodes);
        setEdges(edges);
    }

    const downloadProcessModel = () => {
        const downloadData = {
            nodes: nodes,
            edges: edges
        }

        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(downloadData,null,4)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = 'process_model.json';
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    const saveProcessModel = async ({folderId}:{folderId: any}) => {
        debugger;
        const saveData = {
            nodes: nodes,
            edges: edges
        }
        console.log("Save Data for: ", selectedApp);
        
        try {
            const response = await fetch("/api/update_processModal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ folderId, newData: saveData }),
            });
        
            const result = await response.json();
        
            if (!response.ok) {
              throw new Error(result.error || "Failed to update process_model.json");
            }
        
            console.log("✅ Success:", result.message);
            return result;
          } catch (error) {
            console.error("❌ Error updating process_model.json:", error);
            return { error: (error as Error).message };
          }
    }

    const setWorkflow = ({nodes,edges}: {nodes:any[],edges:any[]}) => {
        console.log({nodes,edges});

        nodes.forEach((node:any) => node.data.deleteNode = deleteNode);
        edges.forEach((edge:any) => {
            
            const sourceType = edge.source.split('_')[0];
            edge.data = {
                deleteEdge,
                height: getNextHeight(edge.source,edge.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(edge.id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {}
            }
        });

        setNodes(nodes);
        setEdges(edges);

        // auto layout
        setTimeout(()=>{
            getLayoutedElements({});
        },100)
    }

    const theme = getCurrentTheme();

    
    return (

        <ResizablePanelGroup direction='horizontal' className='' style={{height: "calc(-3.59rem + 100vh)"}}>
            <ResizablePanel defaultSize={50}>
                <div className='h-full flex flex-col'>
                    <AppHeader  setProcessModel={setProcessModel} downloadProcessModel={downloadProcessModel} getLayoutedElements={getLayoutedElements} saveProcessModel={() => saveProcessModel({ folderId: selectedApp[0]?.id })}/>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';            
                        }}
                        onDrop={onDrop}
                        colorMode={theme}
                        className='flex-1'
                    >
                        <Controls />
                        <MiniMap 
                    nodeColor={(node) => String(node.style?.background) || "#ccc"}
                    maskColor="rgba(240, 240, 240, 0.6)"
                    nodeStrokeColor="#000"
                    nodeBorderRadius={2}
                    pannable
                    zoomable
                    className="bg-white shadow-md border border-gray-300 rounded-md"
                />
                        <Background variant={BackgroundVariant.Dots} gap={24} size={2} />
                        <NodeResizer />
                    </ReactFlow>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle  className='h-80'/>
            <ResizablePanel defaultSize={25}  className='h-full'>
                <Chat setWorkflow={setWorkflow}/>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export default AppCanvas;