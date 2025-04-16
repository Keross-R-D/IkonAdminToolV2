import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TabArray } from "@/ikon/components/tabs/type";

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

    createScriptFile().catch((err) =>
      console.error("❌ Error in useEffect:", err)
    );
  }, []);

  const tabArray: TabArray[] = [
    {
      tabName: "Participant",
      tabId: "tab-participant",
      default: true,
      tabContent: (
        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto h-[85vh]"></div>
      ),
    },
    {
      tabName: "App Groups",
      tabId: "tab-app-groups",
      default: false,
      tabContent: (
        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto h-[85vh]"></div>
      ),
    },
    {
      tabName: "Script Based",
      tabId: "tab-script-based",
      default: false,
      tabContent: (
        <>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto h-[85vh]"></div>
        </>
      ),
    },
  ];
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
        {/* <Tabs defaultValue="users" className="w-full mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="Participant">Participant</TabsTrigger>
            <TabsTrigger value="AppGroups">App Groups</TabsTrigger>
            <TabsTrigger value="ScriptBased">Script Based</TabsTrigger>
          </TabsList>

          <TabsContent value="Participant">
            <p className="mt-2 text-sm text-muted-foreground">
              Assign task to individual users here.
            </p>
          </TabsContent>
          <TabsContent value="AppGroups">
            <p className="mt-2 text-sm text-muted-foreground">
              Assign task to user groups.
            </p>
          </TabsContent>
          <TabsContent value="ScriptBased">
            <p className="mt-2 text-sm text-muted-foreground">
              Assign task based on user roles.
            </p>
          </TabsContent>
        </Tabs> */}

        <div>
          <form>
            <Tabs
              tabArray={tabArray}
              tabListClass="py-6 px-3"
              tabListButtonClass="text-md"
              tabListInnerClass="justify-between items-center"
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
