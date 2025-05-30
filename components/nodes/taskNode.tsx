import { Handle, NodeToolbar, Position } from '@xyflow/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '../ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Square, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import AssignmentModal from '@/components/generic/assisgnmentModal';
import ScriptsModal from '@/components/generic/scriptsModal';


interface taskNodeProps {
    data: {
        nodeName: string;
        deleteNode: (id: string) => void;
        nodeId: string;
        nodeType: string;
        modifyNodeInfo: (nodeId: string) => void,
        nodeAdditionalInfo: any,
    };
    selected: boolean;
    updateNodeLabel: (id: string, label: string) => void;
}


const TaskNode = ({data,selected, updateNodeLabel}: taskNodeProps) => {

    let cardClassNames = "w-128";
    if (selected){
        cardClassNames += "ring-2 ring-primary"
    }

    const [taskName, setTaskName] = useState((data.nodeName)? data.nodeName : "");

     // Sync local state when external data changes
    useEffect(() => {
        setTaskName(data.nodeName);
    }, [data.nodeName]);

    // Debounce effect: Runs `updateNodeLabel` 500ms after the user stops typing
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (taskName !== data.nodeName) {
                updateNodeLabel(data.nodeType +"_"+data.nodeId, taskName);
            }
        }, 1000); // ✅ 500ms delay before updating

        return () => clearTimeout(timeout); // Cleanup timeout on unmount or re-run
    }, [taskName]); // Runs when `taskName` changes

    return (
        <>
        <NodeToolbar position={Position.Top} className='flex gap-2'>
            {/* <NodeCodeDialog/> */}
            <Button variant="outline" onClick={() =>{
                data.deleteNode(data.nodeId);
            }}>
                <Trash/>
            </Button>
            <AssignmentModal nodeInfoDefaultValues={data} />
            <ScriptsModal nodeInfoDefaultValues={data}/>
        </NodeToolbar>
        <Card className={cardClassNames}>
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <Square />
                    <div className="grow">
                        <CardTitle>Task Node</CardTitle>
                        <CardDescription>The basic component for designing the flow</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Input type="text" placeholder="Task Name" value={taskName} onChange={(event) => {
                            setTaskName(event.target.value);
                            //updateNodeLabel(data.id, event.target.value); // Update in ReactFlow state
                        }}/>
            </CardContent>
            <CardFooter className="flex justify-end">
                {/* <Button>click me</Button> */}
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

export default TaskNode;