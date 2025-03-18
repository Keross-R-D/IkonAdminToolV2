import { useReactFlow } from '@xyflow/react';
import ELK,{ElkNode} from 'elkjs';
import { useCallback } from 'react';
const elk = new ELK();

const useLayoutedElements = () => {
    const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

    const defaultOptions = {
        'elk.algorithm' : 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': 400,
        'elk.spacing.nodeNode': 280,
    };

    const getLayoutedElements = useCallback((options:any) => {
        const layoutOptions: { [key: string]: any } = { ...defaultOptions, ...options };
        
        const currentNodes = getNodes();
        const currentEdges = getEdges();
        
        const graph = {
            id: 'root',
            layoutOptions: layoutOptions,
            children: currentNodes.map((node) => ({
                id: node.id,
                width: 256,
                height: 256,
            })),
            edges: currentEdges.map((edge) => ({
                id: edge.id,
                sources:[edge.source],
                targets:[edge.target]
            })),
        };
        
        const nodeIdToNodeMap: { [key: string]: any } = {};
        currentNodes.forEach((node: { id: string }) => {
            nodeIdToNodeMap[node.id] = node;
        })
        
        elk.layout(graph).then(({ children }) => {
            if(children){
                children.forEach((node) => {
                    nodeIdToNodeMap[node.id].position = {
                        x: node.x,
                        y: node.y,
                    }
                })

                setNodes(currentNodes);
            }
        })
    },[])


    return {getLayoutedElements};
}

export default useLayoutedElements;