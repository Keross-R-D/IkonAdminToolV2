import { 
    Dialog, 
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Button
} from "@/components/ui/button";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const AssignmentModal = (nodeInfoDefaultValues: any) => {
    const params = useParams();
    const [scripts, setScripts] = useState([]);
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

    debugger
    return (
        <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Users />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Assignment</DialogTitle>
        </DialogHeader>

        {/* Tabs Container */}
        <Tabs defaultValue="users" className="w-full mt-4">
          {/* Tab Switcher */}
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="Participant">Participant</TabsTrigger>
            <TabsTrigger value="AppGroups">App Groups</TabsTrigger>
            <TabsTrigger value="ScriptBased">Script Based</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="Participant">
            <p className="mt-2 text-sm text-muted-foreground">Assign task to individual users here.</p>
          </TabsContent>
          <TabsContent value="AppGroups">
            <p className="mt-2 text-sm text-muted-foreground">Assign task to user groups.</p>
          </TabsContent>
          <TabsContent value="ScriptBased">
            <p className="mt-2 text-sm text-muted-foreground">Assign task based on user roles.</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    )
}

export default AssignmentModal;