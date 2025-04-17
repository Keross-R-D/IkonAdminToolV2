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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

// type CheckedEdges = {
//   [key: number]: boolean;
// };

type CheckedEdges = Record<number, boolean>;

// Zod schema for form validation
const AssignmentSchema = z.object({
  assignment: z.object({
    participants: z.array(z.string()).optional(),
    staticGroups: z.array(z.string()).optional(),
    userAssignmentScript: z.string().optional(),
    groupAssignmentScript: z.string().optional(),
    appGroupAssignmentScript: z.string().optional(),
    inviterAccountGroupAssignmentScript: z.string().optional(),
  }),
});

const AssignmentModal = (nodeInfoDefaultValues: any) => {
  const params = useParams();
  const [scripts, setScripts] = useState<ScriptOption[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { edgesAppCanvas, nodesAppCanvas } = useAppCanvas();

  console.log("nodeInfoDefaultValues ", edgesAppCanvas);
  const [edges, setEdges] = useState(edgesAppCanvas);
  const [checkedEdges, setCheckedEdges] = useState<CheckedEdges>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const handleCheckboxChange = (index: number) => {
    setCheckedEdges((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
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
      assignment: {
        participants: [],
        staticGroups: [],
        userAssignmentScript: "",
        groupAssignmentScript: "",
        appGroupAssignmentScript: "",
        inviterAccountGroupAssignmentScript: "",
      },
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
          ) : (
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

          <FormComboboxInput
            name={"groupAssignmentScript"}
            items={scripts}
            formControl={undefined}
            label={"Select Group Assignment Script"}
          />
          <FormComboboxInput
            name={"inviterAccountGroupAssignmentScript"}
            items={scripts}
            formControl={undefined}
            label={"Select Inviter Account Group Assignment Script"}
          />
        </div>
      ),
    },
  ];

  const onSubmit = (data: z.infer<typeof AssignmentSchema>) => {
    console.log("Form submitted:", data);
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
