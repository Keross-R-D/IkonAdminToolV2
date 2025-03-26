"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/generic/fileUploader";
import { Download, Workflow, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNavbar } from "@/context/NavbarContext";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

const AppHeader = ({ setProcessModel, downloadProcessModel, getLayoutedElements, saveProcessModel }: { setProcessModel: any, downloadProcessModel: any, getLayoutedElements: any, saveProcessModel: any }) => {
    const { selectedApp,setSelectedApp } = useNavbar();
    const router = useRouter();

    return (
        <>
            <header className="flex flex-row align-middle m-2 justify-between gap-2">
            <TooltipProvider>            
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={() => {
                            if (selectedApp[0]?.id) {
                                router.push(`/workflow/${encodeURIComponent(selectedApp[0].id)}/scripts/${encodeURIComponent(selectedApp[0].id)}`);
                                setSelectedApp([...selectedApp,{name: "Script", id: selectedApp[0].id}]);
                            }
                        }}>
                        <Settings /> Scripts
                        </Button>
                        </TooltipTrigger>
                            <TooltipContent>
                            <p>Scripts</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                
                <div className="flex gap-2">
                    {/* <FileUploader setProcessModel={setProcessModel} />
                    <Button variant="outline" onClick={downloadProcessModel} size="icon">
                        <Download />
                    </Button> */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button variant="outline" onClick={saveProcessModel} size="icon">
                                <Save />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Save</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button variant="outline" onClick={() => getLayoutedElements({})} size="icon">
                                <Workflow />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Arrange</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </header>
            <Separator className="mr-2 w-full" />
        </>
    );
};

export default AppHeader;
