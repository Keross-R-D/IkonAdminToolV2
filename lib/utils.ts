import { MarkerType } from "@xyflow/react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function decodeProcessModel(processModel: any) {
  
  const nodeIdToTypeMap: { [key: string]: any } = {};
  processModel.nodeDataArray.map((e: { key: string; category: string }) => {
    nodeIdToTypeMap[e.key] = e.category.toLowerCase() 
  })
  
  const nodes = processModel.nodeDataArray.map((node: any) => {
    
    const [x,y] = node.location.split(' ').map(parseFloat);
    const nodeId = `${node.category.toLowerCase()}_${node.key}`
    
    console.log(x, y);

    return {
      id: nodeId,
      type: node.category.toLowerCase(),
      data: {
        id: nodeId,
        label: node.text,
      },
      position: {x: x, y: y},
    };
  })

  const edges = processModel.linkDataArray.map((link: { key: string; from: string; to: string; text: string }) => {

    const source = `${nodeIdToTypeMap[link.from]}_${link.from}`;
    const target = `${nodeIdToTypeMap[link.to]}_${link.to}`;


    return {
      id: link.key,
      source: source,
      target: target,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      },
      type: "selfConnecting",
      // type: "smoothstep",
      label: link.text,
      style: {
        strokeWidth: 2,
      },
    };
  })

  return {nodes,edges};
}

export function genNodeColor () {
  const hue = Math.floor(Math.random() * 360)
  return `${hue}`
}


