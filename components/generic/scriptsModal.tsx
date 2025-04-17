"use client";

import { 
    Dialog, 
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import {
    Button
} from "@/components/ui/button";

import { Braces } from "lucide-react";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel
} from "@/components/ui/form";

import {
    Input
} from "@/components/ui/input";

import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeProps } from "@xyflow/react";

interface nodeInfoModalProps {
    nodeInfoDefaultValues: any;
  }


const ScriptsModal = (prop: nodeInfoModalProps) => {
    const params = useParams();
    const [scripts, setScripts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    debugger
    const onSubmitCallback = prop.nodeInfoDefaultValues.modifyNodeInfo;
    const nodeAdditionalInfo = prop.nodeInfoDefaultValues.nodeAdditionalInfo;
debugger
    useEffect(() => {
        const createScriptFile = async () => {
          const response = await fetch("/api/read-script-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folderId: params?.workflow,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to Create script file");
          } 
          const data = await response.json();
          setScripts(data.metadata); // Update state with the fetched scripts
        };
    
        createScriptFile().catch((err) => console.error("❌ Error in useEffect:", err));
      }, []);
    
    const formSchema = z.object({
        postProcessingScriptId: z.string().optional(),
        taskActionScriptId: z.string().optional()
    })
    
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: nodeAdditionalInfo? nodeAdditionalInfo :{
            postProcessingScriptId: "",
            taskActionScriptId: ""
        }
    })
    
    const onSubmit = (value: any) => {
        debugger;
        console.log(value)
        onSubmitCallback({nodeAdditionalInfo : value,label :prop.nodeInfoDefaultValues.nodeName}); 
        setShowModal(false);
    }

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <Braces/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                    
                    
                        <DialogHeader className="pb-4">
                            <DialogTitle>Script Association</DialogTitle>
                        </DialogHeader>
                        
                        <FormField
                            control={form.control}
                            name="postProcessingScriptId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Post Processing Script</FormLabel>
                                <FormControl>
                                    <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select script" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scripts
                                        .filter((script) => script.scriptType === "Form Data Post Processing") // ✅ filter only post-processing scripts
                                        .map((script) => (
                                            <SelectItem key={script.scriptId} value={script.scriptId}>
                                            {script.scriptName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>
                                    This script can be dynamically executed for this task for a specific instance.
                                </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="taskActionScriptId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel> Task Action script</FormLabel>
                                    <FormControl>
                                        <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select script" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {scripts
                                            .filter((script) => script.scriptType === "Task Action") // ✅ filter only post-processing scripts
                                            .map((script) => (
                                                <SelectItem key={script.scriptId} value={script.scriptId}>
                                                {script.scriptName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Description to be done
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default ScriptsModal;