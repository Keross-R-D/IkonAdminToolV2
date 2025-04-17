import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cog } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import EdgeTransitionCategory from "@/enums/edgeTransitionType";
import { useParams } from "next/navigation";

interface EdgeInfoDefaultValues {
  //edge label
  edgeLabel : string,

  //job
  isJobActive: boolean | undefined,
  jobScript: string | undefined,
  jobStartDelay: number | undefined,
  jobStartDelayUnit: "hour" | "minute" | undefined,
  jobFreqency: "once" | "repeating" | "cron" | undefined,
  jobRepeatationCount: number,
  jobRepeatationDelay: number,
  jobRepeatationUnit: "hour" | "minute" | undefined

  // action
  actionValidatationScript: string | undefined,
  messageBinding: string | undefined,
  transitionScript: string | undefined

  // condition
  edgeCondition: string | undefined
}

interface edgeInfoModalProps {
  edgeInfoDefaultValues: EdgeInfoDefaultValues;
  onSubmitCallback: (values: { [key: string]: string }) => void;
  edgeTransitionCategory: EdgeTransitionCategory;
}


const getZschema = (edgeTransitionCategory:EdgeTransitionCategory) => {
  let zSchemaObj: any = {
    // generic
    edgeLabel: z.string().min(2, {
      message: "Edge name must be at least 2 characters.",
    }),

    // job
    isJobActive: z.boolean(),
    jobScript: z.string().optional(),
    jobStartDelay: z.preprocess((val) => Number(val), z.number().min(0).optional()),
    jobStartDelayUnit: z.enum(["hour", "minute"]).optional(),
    jobFreqency: z.enum(["once","repeating","cron"]).default("once").optional(),
    jobcron: z.string().optional(),
    jobRepeatationCount: z.preprocess(
      (val) => Number(val),
      z.number().min(1).optional(),
    ),
    jobRepeatationDelay: z.preprocess(
      (val) => Number(val),
      z.number().min(0).optional(),
    ),
    jobRepeatationUnit: z.enum(["hour", "minute"]).optional(),
  };

  if (edgeTransitionCategory === EdgeTransitionCategory.XOR_TYPE) {
    zSchemaObj.edgeCondition = z.string().optional();
  } else if (edgeTransitionCategory === EdgeTransitionCategory.GENERIC_TYPE) {
    zSchemaObj.transitionScript = z.string().optional();
    zSchemaObj.actionValidatationScript = z.string().optional();
    zSchemaObj.messageBinding = z.string().optional();
  }

  return zSchemaObj;
}

const getDefaultValue = (edgeTransitionCategory:EdgeTransitionCategory, currentValues:any = {}) => {
  let defaultValues:any = {

    // generic
    edgeLabel: currentValues.edgeLabel ? currentValues.edgeLabel : "Transition",

    // job
    isJobActive: currentValues.isJobActive ? currentValues.isJobActive : false,
    jobScript: currentValues.jobScript ? currentValues.jobScript : "",
    jobStartDelay: currentValues.jobStartDelay ? currentValues.jobStartDelay : 0,
    jobStartDelayUnit: currentValues.jobStartDelayUnit? currentValues.jobStartDelayUnit : "minute",
    jobFreqency: currentValues.jobFreqency? currentValues.jobFreqency : "once",
    jobcron: currentValues.jobcron? currentValues.jobcron : "",
    jobRepeatationCount: currentValues.jobRepeatationCount? currentValues.jobRepeatationCount : 1,
    jobRepeatationDelay: currentValues.jobRepeatationDelay? currentValues.jobRepeatationDelay : 1,
    jobRepeatationUnit: currentValues.jobRepeatationUnit? currentValues.jobRepeatationUnit : "minute",
  }

  // action
  if(edgeTransitionCategory === EdgeTransitionCategory.GENERIC_TYPE){
    defaultValues = {
      ...defaultValues,
      transitionScript: currentValues.transitionScript ? currentValues.transitionScript : '',
      actionValidatationScript: currentValues.actionValidatationScript ? currentValues.actionValidatationScript : '',
      messageBinding: currentValues.messageBinding ? currentValues.messageBinding : '',
    }
  }

  // condition
  else if(edgeTransitionCategory === EdgeTransitionCategory.XOR_TYPE){
    defaultValues = {
      ...defaultValues,
      edgeCondition: currentValues.edgeCondition? currentValues.edgeCondition : "",
    }
  }

  return defaultValues;
}

const EdgeInfoModal: React.FC<edgeInfoModalProps> = ({
  edgeInfoDefaultValues,
  onSubmitCallback,
  edgeTransitionCategory,
}) => {
  debugger
  const [open, setOpen] = useState(false);
  const zSchemaObj = getZschema(edgeTransitionCategory);
  const formSchema = z.object(zSchemaObj);
  const params = useParams();
  const [scripts, setScripts] = useState<any[]>([]);

  const defaultValues = getDefaultValue(edgeTransitionCategory, edgeInfoDefaultValues)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const internalJobFrequencyType = form.watch("jobFreqency");


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


  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    debugger
    onSubmitCallback(values);
    setOpen(false);
    console.log(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} style={{ pointerEvents: "auto" }}>
          <Cog />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edge Information</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="genericInfo">
              <TabsList>
                <TabsTrigger value="genericInfo">Generic</TabsTrigger>
                {edgeTransitionCategory === EdgeTransitionCategory.GENERIC_TYPE && (
                  <TabsTrigger value="actionInfo">Action</TabsTrigger>
                )}
                <TabsTrigger value="jobInfo">Job</TabsTrigger>
                {edgeTransitionCategory === EdgeTransitionCategory.XOR_TYPE && (
                  <TabsTrigger value="conditionInfo">Condition</TabsTrigger>
                )}
                {edgeTransitionCategory === EdgeTransitionCategory.GENERIC_TYPE && (
                  <TabsTrigger value="notificationInfo">
                    Notification
                  </TabsTrigger>
                )}
              </TabsList>
              <ScrollArea className="h-80">
                <TabsContent value="genericInfo">
                  <FormField
                    control={form.control}
                    name="edgeLabel"
                    render={({ field }) => (
                      <FormItem className="my-2">
                        <FormLabel>Edge Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Edge Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your edge identification name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                {edgeTransitionCategory ===
                  EdgeTransitionCategory.GENERIC_TYPE && (
                  <TabsContent value="actionInfo">
                    <FormField
                      control={form.control}
                      name="actionValidatationScript"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Action Validation Script</FormLabel>
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
                                        .filter((script) => script.scriptType === "Action Validation") // ✅ filter only post-processing scripts
                                        .map((script) => (
                                            <SelectItem key={script.scriptId} value={script.scriptId}>
                                            {script.scriptName}
                                            </SelectItem>
                                        ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            This script will validate the incoming data
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transitionScript"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Transition Script</FormLabel>
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
                                        .filter((script) => script.scriptType === "Transition Action - After Transaction" || script.scriptType === "Transition Action - Before Transaction") // ✅ filter only post-processing scripts
                                        .map((script) => (
                                            <SelectItem key={script.scriptId} value={script.scriptId}>
                                            {script.scriptName}
                                            </SelectItem>
                                        ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            This script will be executed during transition
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="messageBinding"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Transition Message Binding</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Transition Message Binding"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This is a descriptor for this transition for a
                            specific instance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                )}

                <TabsContent value="jobInfo">
                  <FormField
                    control={form.control}
                    name="isJobActive"
                    render={({ field }) => (
                      <FormItem className="my-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
                        <div className="space-y-0.5">
                          <FormLabel>Execute Job</FormLabel>
                          <FormDescription>
                            This will donate if this script will execute or not
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobScript"
                    render={({ field }) => (
                      <FormItem className="my-2">
                        <FormLabel>Job Script</FormLabel>
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
                                        .filter((script) => script.scriptType === "Job Script") // ✅ filter only post-processing scripts
                                        .map((script) => (
                                            <SelectItem key={script.scriptId} value={script.scriptId}>
                                            {script.scriptName}
                                            </SelectItem>
                                        ))}
                              </SelectContent>
                            </Select>
                        </FormControl>
                        <FormDescription>
                          This script will be executed by the job.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 items-end">
                    <FormField
                      control={form.control}
                      name="jobStartDelay"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Job start delay</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Job Repeatation Delay"
                              min={0}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The job will start after this ammount of time
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobStartDelayUnit"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormControl>
                            <Select {...field}>
                              <SelectTrigger>
                                <SelectValue placeholder="job delay unit"/>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Job delay unit</SelectLabel>
                                    <SelectItem value="minute">Minute(s)</SelectItem>
                                    <SelectItem value="hour">Hour(s)</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </SelectTrigger>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Unit denoting the job start delay
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="jobFreqency"
                    render={({ field }) => (
                      <FormItem className="my-2">
                        <FormLabel>Job Frequency</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => form.setValue("jobFreqency", value)}
                            {...field}
                            defaultValue="once"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a freqency type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>freqency</SelectLabel>
                                <SelectItem value="once">Once only</SelectItem>
                                <SelectItem value="repeating">
                                  Repeating Schedule
                                </SelectItem>
                                <SelectItem value="cron">
                                  cron Based Schedule
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          This will dictate how frequently the job will run
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {internalJobFrequencyType === "repeating" && (
                    <>
                      <FormField
                        control={form.control}
                        name="jobRepeatationCount"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>Job Repeatation Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Job Repeatation Count"
                                min={1}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The job will repeat this no of times
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 items-end">
                        <FormField
                          control={form.control}
                          name="jobRepeatationDelay"
                          render={({ field }) => (
                            <FormItem className="my-2">
                              <FormLabel>Job Repeatation Delay</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Job Repeatation Delay"
                                  min={0}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The job will repeat after this ammount of time
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="jobRepeatationUnit"
                          render={({ field }) => (
                            <FormItem className="my-2">
                              <FormControl>
                                <Select
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Job repeatation unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Job repeatation unit</SelectLabel>
                                      <SelectItem value="minute"> Minute(s) </SelectItem>
                                      <SelectItem value="hours"> Hour(s) </SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Unit denoting the job repeatation delay
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {internalJobFrequencyType === "cron" && (
                    <FormField
                      control={form.control}
                      name="jobcron"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>cron schedule</FormLabel>
                          <FormControl>
                            <Input placeholder="cron schedule" {...field} />
                          </FormControl>
                          <FormDescription>
                            The job will follow this cron schedule
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                {edgeTransitionCategory === EdgeTransitionCategory.XOR_TYPE && (
                  <TabsContent value="conditionInfo">
                    <FormField
                      control={form.control}
                      name="edgeCondition"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Edge Conditional Script</FormLabel>
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
                                        .filter((script) => script.scriptType === "Process Condition") // ✅ filter only post-processing scripts
                                        .map((script) => (
                                            <SelectItem key={script.scriptId} value={script.scriptId}>
                                            {script.scriptName}
                                            </SelectItem>
                                        ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            This transition will be selected if this script is
                            uniquely true
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                )}

                {edgeTransitionCategory === EdgeTransitionCategory.GENERIC_TYPE && (
                  <TabsContent value="notificationInfo"></TabsContent>
                )}
              </ScrollArea>
            </Tabs>
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeInfoModal;


