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


const ScriptsModal = () => {
    
    const formSchema = z.object({
        postProcessingScript: z.string().optional(),
        taskActionScript: z.string().optional()
    })
    
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postProcessingScript: "",
            taskActionScript: ""
        }
    })
    
    const onSubmit = (value: any) => {
        console.log(value)
    }

    return (
        <Dialog>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogTrigger asChild>
                        <Button variant={"outline"}>
                            <Braces/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Script Assocition</DialogTitle>
                        </DialogHeader>
                        
                        <FormField
                            control={form.control}
                            name="postProcessingScript"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel> Post processing script</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Post processing script" {...field}/>
                                    </FormControl>
                                    <FormDescription>
                                        This script can be dynamically executed for this task for a specific instance
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="taskActionScript"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel> Task Action script</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task Action script" {...field}/>
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
                    </DialogContent>
                </form>
            </Form>
        </Dialog>
    )
}

export default ScriptsModal;