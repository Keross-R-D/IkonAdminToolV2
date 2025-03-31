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

import { Merge, Trash } from 'lucide-react';

interface joinNodeProps {
    data: {
        id: string,
        deleteNode:any
    },
    selected: boolean
}

const JoinNode = ({data,selected}: joinNodeProps) => {

    let cardClassNames = "w-64";
    if (selected){
        cardClassNames += " ring-2 ring-black"
    }

    return (
        <>
        <NodeToolbar position={Position.Top}>
            {/* <NodeCodeDialog/> */}
            <Button variant="outline" onClick={() =>{
                data.deleteNode(data.id);
            }}>
                <Trash/>
            </Button>
        </NodeToolbar>
        <Card className={cardClassNames}>
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <Merge />
                    <div className="grow">
                        <CardTitle>Join Node </CardTitle>
                        <CardDescription>Join multiple flows into a single flow</CardDescription>
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

export default JoinNode;