import { NodeToolbar, Handle, Position } from '@xyflow/react';
import { CodeIcon, CircleDot, Trash } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '../ui/card';
import { Button } from '../ui/button';

interface endNodeProps {
    data: {
        nodeId: string,
        deleteNode:any
    },
    selected: boolean
}


const EndNode = ({data,selected}: endNodeProps) => {

    let cardClassNames = "w-64";
    if (selected){
        cardClassNames += " ring-2 ring-black"
    }

    return (
        <>
        <NodeToolbar position={Position.Top}>
            {/* <NodeCodeDialog/> */}
            <Button variant="outline" onClick={() =>{
                data.deleteNode(data.nodeId);
            }}>
                <Trash/>
            </Button>
        </NodeToolbar>
        <Card className={cardClassNames}>
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <CircleDot />
                    <div className="grow">
                        <CardTitle>End Node</CardTitle>
                        <CardDescription>Exit point for the process</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
            </CardContent>
            <Handle 
                type="target" 
                position={Position.Left}
                style={{
                    width: 20,
                    height: 20
                }} 
            />
        </Card>
        </>
    );
}

export default EndNode;