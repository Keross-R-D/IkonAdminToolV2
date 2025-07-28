import { NodeToolbar, Handle, Position } from '@xyflow/react';
import { CodeIcon, Circle, Trash } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import ScriptsModal from '@/components/generic/scriptsModal';

// import NodeCodeDialog from '@/components/Dialogs/NodeCodeDialog';

interface startNodeProps {
    data: {
        nodeId: string,
        deleteNode:any,
        label: string,
        modifyNodeInfo: (nodeId: string) => void,
        nodeAdditionalInfo: any,
    },
    selected: boolean
}

const StartNode = ({data,selected}: startNodeProps) => {

    let cardClassNames = "w-64";
    if (selected){
        cardClassNames += " ring-2 ring-primary"
    }

    return (
        <>
        <NodeToolbar position={Position.Top} className='flex gap-2'>
            {/* <NodeCodeDialog/> */}
            <Button variant="outline" onClick={() =>{
                data.deleteNode(data.nodeId);
            }}>
                <Trash/>
            </Button>
            <ScriptsModal nodeInfoDefaultValues={data} />
        </NodeToolbar>
        <Card className={cardClassNames}>
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <Circle />
                    <div className="grow">
                        <CardTitle>Start Node</CardTitle>
                        <CardDescription>Entry point for the process</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Handle 
                type="source" 
                position={Position.Right} 
                style={{
                    width: 20,
                    height: 20
                }}    
            />
        </Card>
        </>
    );
}

export default StartNode;