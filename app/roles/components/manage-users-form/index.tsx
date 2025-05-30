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
import { memo, useEffect, useState } from "react";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { toast } from "sonner";
import { LoadingSpinner } from "@/ikon/components/loading-spinner";

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, "Select at least one user"),
});

interface ManageUsersFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  roleId: string;
  roleName: string;
  onSave?: (roleId: string, userIds: string[]) => void;
}

function ManageUsersForm({
  open,
  setOpen,
  roleId,
  roleName,
  onSave,
}: ManageUsersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: [],
    },
  });

  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  async function saveRoleUserMembership(userIds: string[]) {
    try {
      const responseData = await apiReaquest(`/api/role-user-membership`, {
        method: "POST",
        body: JSON.stringify({
          roleId,
          userIds: userIds,
        }),
      });
      setOpen(false);
      setLoading(false);

      if (responseData?.status == "Failure") {
        toast.error(responseData.message);
      } else {
        toast.success("User role association Saved");
      }
    } catch (error) {
      toast.error("Failed to save role user membership");
    }
  }

  async function fetchUsers() {
    try {
      const responseData = await apiReaquest(`/api/users`, {
        method: "GET",
        next: {
          tags: ["getUsers"],
        },
      });

      if (!responseData.error) {
        setUsers(responseData || []);
      }
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
    fetchRoleUsers();
  }

  async function fetchRoleUsers() {
    try {
      const responseData = await apiReaquest(`/api/role-user/${roleId}`, {
        method: "GET",
      });

      if (!responseData.error) {
        form.setValue("userIds", responseData || []);
      }
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (roleId) {
      fetchUsers();
    }
  }, [roleId]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    saveRoleUserMembership(data.userIds);
  };

  const userColumns: DTColumnsProps<any>[] = [
    {
      accessorKey: "userName",
      header: "User Name",
    },
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => (
        <Checkbox
          checked={form.watch("userIds").includes(row.original.userId)}
          onCheckedChange={(checked) => {
            const currentUsers = form.getValues("userIds");
            form.setValue(
              "userIds",
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
      <DialogContent className="w-[800px] max-w-[90vw] ">
        <DialogHeader>
          <DialogTitle>Manage Users for {roleName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden min-h-[600px] relative">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1 overflow-hidden"
              >
                <div className="flex-1 overflow-auto">
                  <DataTable
                    data={users}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ManageUsersForm);
