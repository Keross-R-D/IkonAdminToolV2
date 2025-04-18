import { Handle, NodeToolbar, Position } from '@xyflow/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Trash, XSquare } from 'lucide-react';

interface xorNodeProps {
    data: {
        nodeId: string,
        deleteNode:any
    },
    selected: boolean
}

const XORNode = ({data,selected}: xorNodeProps) => {


    let cardClassNames = "w-64";
    if (selected){
        cardClassNames += " ring-2 ring-primary"
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
                    <XSquare />
                    <div className="grow">
                        <CardTitle>XOR Node </CardTitle>
                        <CardDescription>Select a single flow based on condition</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
            </CardContent>
            <Handle 
                type="source" 
                position={Position.Right} 
                style={{
                    width: 20,
                    height: 20
                }}    
            />
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

export default XORNode;