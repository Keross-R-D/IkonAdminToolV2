"use client";

import { DataTable } from "@/ikon/components/data-table";
import {
  DTColumnsProps,
  DTExtraParamsProps,
} from "@/ikon/components/data-table/type";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextButton } from "@/ikon/components/buttons";

const formSchema = z.object({
  groups: z.array(z.string()).min(1, "Select at least one group"),
});

interface Group {
  id: string;
  name: string;
  description?: string;
  softwareId: string;
  active: boolean;
}

interface ManageGroupsFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groups: Group[];
  initialSelectedGroups?: string[];
  onSave: (groupIds: string[]) => void;
  roleName?: string;
}

export function ManageGroupsForm({
  open,
  setOpen,
  groups,
  initialSelectedGroups = [],
  onSave,
  roleName,
}: ManageGroupsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groups: initialSelectedGroups,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      onSave(data.groups);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save groups:", error);
    }
  };

  const groupColumns: DTColumnsProps<Group>[] = [
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => {
        const isActive = row.original.active;
        const isChecked = form.watch("groups").includes(row.original.id);

        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) => {
              if (isActive) {
                const currentGroups = form.getValues("groups");
                form.setValue(
                  "groups",
                  checked
                    ? [...currentGroups, row.original.id]
                    : currentGroups.filter((id) => id !== row.original.id)
                );
              }
            }}
            disabled={!isActive}
            className={!isActive ? "opacity-50 cursor-not-allowed" : ""}
          />
        );
      },
    },
    {
      accessorKey: "name",
      header: "Group Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="text-sm text-muted-foreground">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={row.original.active ? "text-green-500" : "text-red-500"}
        >
          {row.original.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const extraParams: DTExtraParamsProps = {
    grouping: false,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[800px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {roleName ? `Manage Groups for ${roleName}` : "Manage Groups"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-auto max-h-[60vh]">
              <DataTable
                data={groups}
                columns={groupColumns}
                extraParams={extraParams}
              />
            </div>
            <DialogFooter className="mt-4 py-2 border-t">
              <TextButton type="submit">Save</TextButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
