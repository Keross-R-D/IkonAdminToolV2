"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boolean, z } from "zod";

import { TabArray } from "@/ikon/components/tabs/type";
import Tabs from "@/ikon/components/tabs";
import { DialogFooter } from "@/shadcn/ui/dialog";
import { TextButton } from "@/ikon/components/buttons";
import FormComboboxInput from "@/ikon/components/form-fields/combobox-input";
import { useParams } from "next/navigation";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import { useAppCanvas } from "../appcanvasContext";

type ScriptOption = {
  value: string;
  label: string;
};

type Group = {
  id: string;
  name: string;
  description: string;
  softwareId: string;
  active: boolean;
  groupType?: string;
};

type CheckedEdges = Record<number, boolean>;

type MetaDataItem = {
  id: string;
  name: string;
};

const AssignmentSchema = z.object({
  participants: z.array(z.string()).optional(),
  staticGroups: z.array(z.string()).optional(),
  userAssignmentScript: z.string().optional(),
  groupAssignmentScript: z.string().optional(),
  appGroupAssignmentScript: z.string().optional(),
  inviterAccountGroupAssignmentScript: z.string().optional(),
});

const AssignmentModal = (nodeInfoDefaultValues: any) => {
  
  const params = useParams();
  const [scripts, setScripts] = useState<ScriptOption[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [noGroupData, setNoGroupData] = useState(false);
  const { edgesAppCanvas, nodesAppCanvas } = useAppCanvas();
  console.log("nodeInfoDefaultValues ", nodeInfoDefaultValues);
  console.log("edgesAppCanvas ", edgesAppCanvas);
  const onSubmitCallback =
    nodeInfoDefaultValues.nodeInfoDefaultValues?.modifyNodeInfo;
  const nodeAdditionalInfo =
    nodeInfoDefaultValues.nodeInfoDefaultValues?.assignment;
  const [edges, setEdges] = useState(edgesAppCanvas);
  const [checkedEdges, setCheckedEdges] = useState<CheckedEdges>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [metaData, setMetaData] = useState<MetaDataItem[]>([]);
  const [shared, setShared] = useState(boolean);

  const handleCheckboxChange = (index: number) => {
    setCheckedEdges((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const existingParticipants =
      nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
        ?.assignment?.participants || [];
    if (existingParticipants.length > 0) {
      const newCheckedEdges: CheckedEdges = {};
      edges.forEach((edge, index) => {
        if (existingParticipants.includes(edge.id)) {
          newCheckedEdges[index] = true;
        }
      });
      setCheckedEdges(newCheckedEdges);
    }
  }, [edges, nodeInfoDefaultValues]);

  useEffect(() => {
    const existingGroups =
      nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
        ?.assignment?.staticGroups || [];
    setSelectedGroups(existingGroups);
  }, [nodeInfoDefaultValues]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const response = await fetch("/api/process-meta-data", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch process metadata");
        }

        const data = await response.json();
        console.log(
          "process meta data shared ",
          data?.content?.isSharedProcess
        );
        setShared(data?.content?.isSharedProcess);
        setMetaData(data);
      } catch (error) {
        console.error("Error fetching process metadata:", error);
      }
    };

    fetchMetaData();
  }, []);

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

      console.log("data ", data["metadata"]);

      const transformedScriptData: any[] = [];
      for (const script of data["metadata"]) {
        if (script.scriptType == "Assignee Definition") {
          transformedScriptData.push({
            label: script.scriptName,
            value: script.scriptId,
          });
        }
      }

      console.log("transformedScriptData ", transformedScriptData);

      setScripts(transformedScriptData);
    };

    createScriptFile().catch((err) =>
      console.error("Error in useEffect:", err)
    );
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const header = new Headers();
        const host =
          (header.get("x-forwarded-proto") || "http") +
          "://" +
          (header.get("host") || "localhost:3000");

        const response = await fetch(`${host}/api/groups`, {
          next: {
            tags: ["groups"],
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        console.log("groups ", data);
        if (data.length > 0) {
          setLoading(false);
        }
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const form = useForm<z.infer<typeof AssignmentSchema>>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      participants:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.participants || [],
      staticGroups:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.staticGroups || [],
      userAssignmentScript:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.userAssignmentScript || "",
      groupAssignmentScript:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.groupAssignmentScript || "",
      appGroupAssignmentScript:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.appGroupAssignmentScript || "",
      inviterAccountGroupAssignmentScript:
        nodeInfoDefaultValues.nodeInfoDefaultValues?.nodeAdditionalInfo
          ?.assignment?.inviterAccountGroupAssignmentScript || "",
    },
  });
  const tabArray: TabArray[] = [
    {
      tabName: "Participant",
      tabId: "tab-participant",
      default: true,
      tabContent: (
        <div className="space-y-2">
          {edges.map((edge, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`participant-${index}`}
                checked={!!checkedEdges[index]}
                onCheckedChange={() => handleCheckboxChange(index)}
              />
              <Label htmlFor={`participant-${index}`}>
                Actor - {edge.label}
              </Label>
            </div>
          ))}
        </div>
      ),
    },
    {
      tabName: "App Groups",
      tabId: "tab-app-groups",
      default: false,
      tabContent: (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox
                  id={group.id}
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={(checked) => {
                    setSelectedGroups((prev) =>
                      checked
                        ? [...prev, group.id]
                        : prev.filter((id) => id !== group.id)
                    );
                  }}
                />
                <Label htmlFor={group.id}>{group.name}</Label>
              </div>
            ))
          ) : (
            <div className="flex justify-center py-8 text-muted-foreground">
              No groups available
            </div>
          )}
        </div>
      ),
    },

    {
      tabName: "Script Based",
      tabId: "tab-script-based",
      default: false,
      tabContent: (
        <div className="flex flex-col gap-4 ">
          <FormComboboxInput
            name={"userAssignmentScript"}
            items={scripts}
            formControl={form.control}
            label={"Select User Assignment Script"}
          />

          {shared ? (
            <>
              <FormComboboxInput
                name={"appGroupAssignmentScript"}
                items={scripts}
                formControl={form.control}
                label={"Select App Level Group Assignment Script"}
              />
            </>
          ) : (
            <>
              <FormComboboxInput
                name={"groupAssignmentScript"}
                items={scripts}
                formControl={form.control}
                label={"Select Group Assignment Script"}
              />
              <FormComboboxInput
                name={"inviterAccountGroupAssignmentScript"}
                items={scripts}
                formControl={form.control}
                label={"Select Inviter Account Group Assignment Script"}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const onSubmit = (data: z.infer<typeof AssignmentSchema>) => {
    const selectedParticipants = edges
      .filter((_, index) => checkedEdges[index])
      .map((edge) => edge.id);

    const selectedStaticGroups = selectedGroups;

    const result = {
      assignment: {
        participants: selectedParticipants.length ? selectedParticipants : [],
        staticGroups: selectedStaticGroups.length ? selectedStaticGroups : [],
        userAssignmentScript: data.userAssignmentScript
          ? data.userAssignmentScript
          : null,
        groupAssignmentScript: data.groupAssignmentScript
          ? data.groupAssignmentScript
          : null,
        appGroupAssignmentScript: data.appGroupAssignmentScript
          ? data.appGroupAssignmentScript
          : null,
        inviterAccountGroupAssignmentScript:
          data.inviterAccountGroupAssignmentScript
            ? data.inviterAccountGroupAssignmentScript
            : null,
      },
    };
    nodeInfoDefaultValues[
      "nodeInfoDefaultValues"
    ].nodeAdditionalInfo.assignment = result.assignment;
    console.log("Form submitted:", result);
    
    onSubmitCallback({
      nodeAdditionalInfo:
        nodeInfoDefaultValues["nodeInfoDefaultValues"].nodeAdditionalInfo,
      label: nodeInfoDefaultValues["nodeInfoDefaultValues"].nodeName,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Users className="h-2 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Assignment - Owner Access</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex">
              <Tabs
                tabArray={tabArray}
                tabListClass="py-6 px-3"
                tabListButtonClass="text-md"
                tabListInnerClass="justify-between items-center"
              />
            </div>

            <DialogFooter>
              <TextButton type="submit">Save</TextButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
