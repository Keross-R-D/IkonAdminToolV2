"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

import {
  Circle,
  Square,
  XSquare,
  Pause,
  Split,
  Merge,
  CircleDot,
} from "lucide-react";

import TaskNode from "@/components/nodes/taskNode";
import StartNode from "@/components/nodes/startNode";
import XORNode from "@/components/nodes/xorNode";
import EndNode from "@/components/nodes/endNode";
import JoinNode from "@/components/nodes/joinNode";
import WaitNode from "@/components/nodes/waitNode";
import ForkNode from "@/components/nodes/forkNode";

import AppHeader from "@/components/appheader";
import SelfConnecting from "@/components/edges/selfConnecting";

import { v4 as uuidv4 } from "uuid";
import { genNodeColor } from "@/lib/utils";
import getEdgeHeightManager from "@/hooks/edgeHeightManager";
import EdgeTransitionCategory from "@/enums/edgeTransitionType";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Chat from "@/components/generic/chat";

import ELK, { ElkNode } from "elkjs";
import useLayoutedElements from "@/hooks/autolayout";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/ikon/components/loading-spinner";
import { toast } from "sonner";
import { useAppCanvas } from "./appcanvasContext";

interface Node {
    id: string,
    type: string,
    data: {
        nodeId: string,
        nodeName: string,
        nodeAdditionalInfo: any,
        deleteNode: any,
        nodeType: string,
    },
    position: {
        x: number,
        y: number
    }
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  label: string;
  markerEnd: {
    type: MarkerType;
  };
  deleteAble: boolean;
  data: {
    deleteEdge: any;
    edgeColor: string;
    height: number;
    edgeTransitionCategory: EdgeTransitionCategory;
    edgeAdditionalInfo: any;
  };
}

function getEdgeTransitionCategory(sourceType: string) {
  if (sourceType === "xor") {
    return EdgeTransitionCategory.XOR_TYPE;
  } else if (sourceType === "fork" || sourceType === "join") {
    return EdgeTransitionCategory.FORK_JOIN_TYPE;
  } else {
    return EdgeTransitionCategory.GENERIC_TYPE;
  }
}

const AppCanvas = () => {

    const nodeTypes = {
        Task: (props: any) => <TaskNode {...props} updateNodeLabel={updateNodeLabel} />,
        Start: StartNode,
        XOR: XORNode,
        Join: JoinNode,
        Fork: ForkNode,
        Wait: WaitNode,
        End: EndNode,
    }

  const edgeTypes = {
    selfConnecting: SelfConnecting,
  };

  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  debugger;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const {
    edgesAppCanvas,
    nodesAppCanvas,
    setEdgesAppCanvas,
    setNodesAppCanvas,
  } = useAppCanvas();

  const { getLayoutedElements } = useLayoutedElements();

  const { screenToFlowPosition } = useReactFlow();

  const [getNextHeight, removeEdge] = getEdgeHeightManager(150, 10);

  const [isLoading, setIsLoading] = useState(false);

  // interface App {
  //     id: string;
  //     // Add other properties if needed
  // }
  const params = useParams();

  const readProcessModel = async (folderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/read_processModal?folderId=${folderId}`
      );

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
    const fetchProcessModel = async () => {
      const data =
        typeof params?.workflow === "string"
          ? await readProcessModel(params.workflow)
          : null;
      setIsLoading(false);
      debugger;
      if (data) {
        data.nodes?.forEach((node: any) => {
          if (node?.data) {
            node.data.deleteNode = deleteNode;
            node.data.modifyNodeInfo = getNodeSpecificModifyCallback(node.id);
          }
        });
        data.edges?.forEach((edge: any) => {
          if (edge.data) {
            edge.data.deleteEdge = deleteEdge;
            edge.data.modifyEdgeInfo = getEdgeSpecificModifyCallback(edge.id);
          }
        });
        setNodes(data.nodes === undefined ? [] : data.nodes);
        setEdges(data.edges === undefined ? [] : data.edges);
        setNodesAppCanvas(data.nodes === undefined ? [] : data.nodes);
        setEdgesAppCanvas(data.edges === undefined ? [] : data.edges);
      }
    };

    fetchProcessModel();
  }, [params?.id]);

    const updateNodeLabel = (nodeId: string, newLabel: string) => {
        debugger;
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, nodeName: newLabel } } : node
            )
        );
    };

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) => {
        const label = "Transition";
        const animated = true;
        const markerEnd = {
          type: MarkerType.ArrowClosed,
        };

        const sourceType = params.source.split("_")[0];

            const id = uuidv4()
            const data = {
                deleteEdge: deleteEdge,
                height: getNextHeight(params.source,params.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {
                    sourceNodeId: params.source.split('_')[1],
                    targetNodeId: params.target.split('_')[1],
                    linkName: label,
                    linkId: id,
                    actionDefinition: {},
                    processJob: {},
                    isJobActive: false,
                    conditionId: null,
                }
            }

        const deleteAble = true;
        const type = "selfConnecting";
        // const type = "smoothstep";
        const modifiedParams = {
          ...params,
          type,
          label,
          animated,
          markerEnd,
          deleteAble,
          data,
          id,
        };

        // return addEdge(modifiedParams, eds)
        return [...eds, modifiedParams];
      }),
    [setEdges]
  );

  const getCurrentTheme = (): "light" | "dark" | "system" | undefined => {
    const { theme } = useTheme();
    if (theme === "light" || theme === "dark" || theme === "system") {
      return theme;
    }
    return "dark";
  };

  interface DropEvent extends React.DragEvent<HTMLDivElement> {
    dataTransfer: DataTransfer & {
      getData: (format: string) => string;
    };
  }

    const getEdgeSpecificModifyCallback = (edgeId: string) => {
        const modifyEdgeInfo = (edgeInfo: any ) => {
            setEdges((eds) => {
                
                const modifiedEdges = eds.map(e => {
                    if (e.id === edgeId){
                        e.label = edgeInfo.edgeLabel
                        e.data.edgeAdditionalInfo.linkName = edgeInfo.edgeLabel
                        e.data.edgeAdditionalInfo.actionDefinition = edgeInfo.actionDefinition
                        e.data.edgeAdditionalInfo.processJob = edgeInfo.processJob
                        e.data.edgeAdditionalInfo.isJobActive = edgeInfo.isJobActive
                        e.data.edgeAdditionalInfo.conditionId = edgeInfo.conditionId
                    }

          return e;
        });

        return modifiedEdges;
      });
    };
    debugger;
    return modifyEdgeInfo;
  };

    const getNodeSpecificModifyCallback = (nodeId: string) => {
        const modifyNodeInfo = (nodeInfo: { [key:string]: any }) => {
            setNodes((eds) => {
                
                const modifiedNode = eds.map(e => {
                    if ((e.data.nodeType +"_" + e.data.nodeId) === nodeId){
                        e.data.nodeName = nodeInfo.label

                        e.data.nodeAdditionalInfo = nodeInfo.nodeAdditionalInfo
                    }

                    return e;
                })
console.log(modifiedNode);
                return modifiedNode
            })
        }
debugger
        return modifyNodeInfo;
    }
    

  const onDrop = (event: DropEvent) => {
    event.preventDefault();
    const type: string = event.dataTransfer.getData("type");

    if (!type) {
      return;
    }

        const newNodeId: string = `${type}_${uuidv4()}`;
        
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        })
debugger
        console.log(nodes);
        let newNode = {
                id: newNodeId,
                type,
                position,
                data: {
                    'nodeId': newNodeId.split('_')[1],
                    'nodeType': type,   
                    'deleteNode': deleteNode,
                    'nodeName': 'New Node',
                    'nodeAdditionalInfo' : {},
                    modifyNodeInfo: getNodeSpecificModifyCallback(newNodeId),
                },
                edges: type === "task" ? edges : undefined,
            }
        
        setNodes((nodes) => [
            ...nodes,
            newNode
            ,
        ]);
    } 

    const deleteNode = (nodeId:string) => {
        setNodes((nodes) => {
            debugger;
            const newNodesList = nodes.filter(e => e.data.nodeId !== nodeId)
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

        nodes.forEach((node:any) => {node.data.deleteNode = deleteNode; node.data.modifyNodeInfo = getNodeSpecificModifyCallback(node.id)});
        edges.forEach((edge:any) => {
            
            const sourceType = edge.source.split('_')[0];
            edge.data = {
                deleteEdge,
                height: getNextHeight(edge.source,edge.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(edge.id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {
                    sourceNodeId: edge.source.split('_')[1],
                    targetNodeId: edge.target.split('_')[1],
                    linkName: edge.label,
                    linkId: edge.id,
                    actionDefinition: {},
                    processJob: {},
                    isJobActive: false,
                    conditionId: null,
                }
                    
            }
        });

    setNodes(nodes);
    setEdges(edges);
  };

  const downloadProcessModel = () => {
    const downloadData = {
      nodes: nodes,
      edges: edges,
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(downloadData, null, 4)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "process_model.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

    const saveProcessModel = async ({folderId}:{folderId: any}) => {
        debugger;
        setIsLoading(true);
        const saveData = {
            nodes: nodes,
            edges: edges
        }
        
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
            setIsLoading(false);
            toast.success("Process modal saved")
            return result;
          } catch (error) {
            console.error("❌ Error updating process_model.json:", error);
            return { error: (error as Error).message };
          }
    }

    const setWorkflow = ({nodes,edges}: {nodes:any[],edges:any[]}) => {
        console.log({nodes,edges});
debugger
        nodes.forEach((node:any) => node.data.deleteNode = deleteNode);
        edges.forEach((edge:any) => {
            
            const sourceType = edge.source.split('_')[0];
            edge.data = {
                deleteEdge,
                height: getNextHeight(edge.source,edge.target),
                edgeColor: genNodeColor(),
                modifyEdgeInfo: getEdgeSpecificModifyCallback(edge.id),
                edgeTransitionCategory: getEdgeTransitionCategory(sourceType),
                edgeAdditionalInfo: {
                    sourceNodeId: edge.source.split('_')[1],
                    targetNodeId: edge.target.split('_')[1],
                    linkName: edge.label,
                    linkId: edge.id,
                    actionDefinition: {},
                    processJob: {},
                    isJobActive: false,
                    conditionId: null,
                }
                    
            }
        });

    setNodes(nodes);
    setEdges(edges);

    // auto layout
    setTimeout(() => {
      getLayoutedElements({});
    }, 100);
  };

  const theme = getCurrentTheme();

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className=""
      style={{ height: "calc(-3.59rem + 100vh)" }}
    >
      <LoadingSpinner visible={isLoading} />
      <ResizablePanel defaultSize={50}>
        <div className="h-full flex flex-col">
          <AppHeader
            setIsLoading={setIsLoading}
            setProcessModel={setProcessModel}
            downloadProcessModel={downloadProcessModel}
            getLayoutedElements={getLayoutedElements}
            saveProcessModel={() =>
              saveProcessModel({ folderId: params?.workflow })
            }
          />
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
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={onDrop}
            colorMode={theme}
            className="flex-1"
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
      <ResizableHandle withHandle className="" />
      <ResizablePanel defaultSize={25} className="h-full">
        <Chat setWorkflow={setWorkflow} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default AppCanvas;
