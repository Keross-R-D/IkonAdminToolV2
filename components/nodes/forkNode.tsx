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

import { PlusSquare, Trash } from 'lucide-react';

interface forkNodeProps {
    data: {
        id: string,
        deleteNode:any
    },
    selected: boolean
}

const ForkNode = ({data,selected}: forkNodeProps) => {

    let cardClassNames = "w-64";
    if (selected){
        cardClassNames += " ring-2 ring-primary"
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
                    <PlusSquare />
                    <div className="grow">
                        <CardTitle>Fork Node </CardTitle>
                        <CardDescription>Break flow into mutiple parallal flows</CardDescription>
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

export default ForkNode;