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

import { Pause, Trash } from 'lucide-react';
import { useState } from 'react';

interface waitNodeProps {
    data: {
        label: string,
        deleteNode: any,
        id: string
    },
    selected: boolean
}



const WaitNode = ({data,selected}: waitNodeProps) => {

    let cardClassNames = "w-128";
    if (selected){
        cardClassNames += " ring-2 ring-primary"
    }

    const [taskName, setTaskName] = useState((data.label)? data.label : "");

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
                    <Pause />
                    <div className="flex-grow">
                        <CardTitle>Wait Node</CardTitle>
                        <CardDescription>stopping flow for a signal</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Input type="text" placeholder="Task Name" value={taskName} onChange={(event)=>{setTaskName(event.target.value)}}/>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button>click me</Button>
            </CardFooter>
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

export default WaitNode;