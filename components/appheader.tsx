"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { Download, Workflow, Save, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Tooltip } from "@/ikon/components/tooltip"
import { useState } from "react";


const AppHeader = ({ setProcessModel, downloadProcessModel, getLayoutedElements, saveProcessModel, setIsLoading }: { setProcessModel: any, downloadProcessModel: any, getLayoutedElements: any, saveProcessModel: any,  setIsLoading :any }) => {

    const router = useRouter();
    const params =  useParams();


    const openScripts = () => {
        setIsLoading(true);
        debugger
        if (params?.workflow) {
            router.push(`/workflow/${params.workflow}/scripts/${params.workflow}`);
            
        }

     }

    return (
        <>
            <header className="flex flex-row align-middle m-2 justify-end gap-2">
            
            
                
                <div className="flex gap-2">
                    {/* <FileUploader setProcessModel={setProcessModel} />
                    <Button variant="outline" onClick={downloadProcessModel} size="icon">
                        <Download />
                    </Button> */}
                    <Tooltip tooltipContent="Scripts" side={"top"} >
                            <Button variant="outline" onClick={() => openScripts()}>
                                <Settings /> Scripts
                            </Button>
                    </Tooltip>
                    <Tooltip tooltipContent="Save Process Model" side={"top"}>
                            <Button variant="outline" onClick={saveProcessModel} size="icon">
                                <Save />
                            </Button>
                            
                    </Tooltip>
                    <Tooltip tooltipContent="Arrange" side={"top"}>
                            <Button variant="outline" onClick={() => getLayoutedElements({})} size="icon">
                                <Workflow />
                            </Button>
                    </Tooltip>
                </div>
            </header>
            <Separator className="mr-2 w-full" />
        </>
    );
};

export default AppHeader;
