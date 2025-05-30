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
import { saveRoleData } from "../role-save";


interface RoleData {
  id?: string;
  name: string;
  description?: string;
  softwareId: string;
}

interface RoleFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  softwareId: string;
  roleData: RoleData | null;
}

const schema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(63, "Role name must be at most 63 characters long"),
  description: z.string().optional(),
  softwareId: z.string().min(1, "Software selection is required"),
});

function RoleForm({ open, setOpen, softwareId, roleData }: RoleFormProps) {
  const isEditMode = !!roleData?.id;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      softwareId: softwareId || "",
    },
  });

  useEffect(() => {
    if (isEditMode && roleData) {
      form.reset({
        name: roleData.name,
        description: roleData.description || "",
        softwareId: roleData.softwareId || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        softwareId: softwareId || "",
      });
    }
  }, [roleData, open, softwareId, isEditMode, form]);

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const roleDatas = {
        ...data,
        active: true,
        ...(isEditMode && { id: roleData?.id }),
      };

      await saveRoleData(roleDatas);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error saving role data:", error);
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
          <DialogTitle>{isEditMode ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormInput
              formControl={form.control}
              name="name"
              label="Role Name"
              placeholder="Enter role name"
            />
            
            <FormTextarea
              formControl={form.control}
              name="description"
              label="Role Description"
              placeholder="Enter role description (optional)"
              rows={3}
            />
            
            <DialogFooter>
              <TextButton type="submit">
                {isEditMode ? "Update Role" : "Create Role"}
              </TextButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleForm;