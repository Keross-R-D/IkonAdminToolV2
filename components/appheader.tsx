import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/generic/fileUploader";
import { Download, Workflow, Save } from "lucide-react";

const AppHeader = ({ setProcessModel, downloadProcessModel, getLayoutedElements, saveProcessModel }: { setProcessModel: any, downloadProcessModel: any, getLayoutedElements: any, saveProcessModel: any }) => {
    

    return (
        <>
            <header className="flex flex-row align-middle m-2 justify-end gap-2">
                <FileUploader setProcessModel={setProcessModel} />
                <Button variant="outline" onClick={downloadProcessModel} size="icon">
                    <Download />
                </Button>
                <Button variant="outline" onClick={saveProcessModel} size="icon">
                    <Save />
                </Button>
                <Button variant="outline" onClick={() => getLayoutedElements({})} size="icon">
                    <Workflow />
                </Button>
            </header>
            <Separator className="mr-2 w" />
        </>
    );
};

export default AppHeader;
