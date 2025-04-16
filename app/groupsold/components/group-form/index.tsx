import FormInput from "@/ikon/components/form-fields/input";
import FormTextarea from "@/ikon/components/form-fields/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { Form } from "@/shadcn/ui/form";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextButton } from "@/ikon/components/buttons";
import { saveGroupData } from "../group-save";


interface GroupData {
  id?: string;
  name: string;
  description?: string;
  softwareId: string;
}

interface GroupFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  softwareId: string;
  groupData: GroupData | null;
}

const schema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(63, "Group name must be at most 63 characters long"),
  description: z.string().optional(),
  softwareId: z.string().min(1, "Software selection is required"),
});

function GroupForm({ open, setOpen, softwareId, groupData }: GroupFormProps) {
  const isEditMode = !!groupData?.id;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      softwareId: softwareId || "",
    },
  });

  useEffect(() => {
    if (isEditMode && groupData) {
      form.reset({
        name: groupData.name,
        description: groupData.description || "",
        softwareId: groupData.softwareId || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        softwareId: softwareId || "",
      });
    }
  }, [groupData, open, softwareId, isEditMode, form]);

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const groupDatas = {
        ...data,
        active: true,
        ...(isEditMode && { id: groupData?.id }),
      };

      await saveGroupData(groupDatas);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error saving group data:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
        setOpen(open);
      }}
      modal={true}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Group" : "Create Group"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormInput
              formControl={form.control}
              name="name"
              label="Group Name"
              placeholder="Enter group name"
            />
            
            <FormTextarea
              formControl={form.control}
              name="description"
              label="Group Description"
              placeholder="Enter group description (optional)"
              rows={3}
            />
            
            <DialogFooter>
              <TextButton type="submit">
                {isEditMode ? "Update Group" : "Create Group"}
              </TextButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default GroupForm;