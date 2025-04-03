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
import dummyUserData from "@/app/users/data/dummy-user-data";

const formSchema = z.object({
  users: z.array(z.string()).min(1, "Select at least one user"),
});

interface ManageUsersFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  roleId: string;
  roleName: string;
  onSave?: (roleId: string, userIds: string[]) => void;
}

export function ManageUsersForm({
  open,
  setOpen,
  roleId,
  roleName,
  onSave,
}: ManageUsersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: [],
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      const roleUserData = {
        roleId,
        userIds: data.users,
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving role-user association:", roleUserData);

      if (onSave) {
        onSave(roleId, data.users);
      }

      setOpen(false);
    } catch (error) {
      console.error("Failed to save user-role association:", error);
    }
    setOpen(false);
  };

  const userColumns: DTColumnsProps<(typeof dummyUserData)[0]>[] = [
    {
      accessorKey: "userName",
      header: "User Name",
    },
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => (
        <Checkbox
          checked={form.watch("users").includes(row.original.userId)}
          onCheckedChange={(checked) => {
            const currentUsers = form.getValues("users");
            form.setValue(
              "users",
              checked
                ? [...currentUsers, row.original.userId]
                : currentUsers.filter((id) => id !== row.original.userId)
            );
          }}
        />
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
          <DialogTitle>Manage Users for {roleName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-auto">
              <DataTable
                data={dummyUserData}
                columns={userColumns}
                extraParams={{
                  ...extraParams,
                }}
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
