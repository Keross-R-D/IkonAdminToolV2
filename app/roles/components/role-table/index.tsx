"use client";

import { IconTextButton } from "@/ikon/components/buttons";
import { DataTable } from "@/ikon/components/data-table";
import {
  DTColumnsProps,
  DTExtraParamsProps,
} from "@/ikon/components/data-table/type";
import {
  Ban,
  Blocks,
  CheckCircle,
  Edit,
  Group,
  LucideBlocks,
  Plus,
  User,
} from "lucide-react";
import React, { useState } from "react";
import RoleForm from "../role-form";
import { ManageUsersForm } from "../manage-users-form";
import { updateRoleStatus } from "../update-role-status";
import { ManageGroupsForm } from "../manage-group-form";
import { updateGroupStatusInRole } from "../manage-group-form/update-group-in-role";
import { Tooltip } from "@/ikon/components/tooltip";
import { useDialog } from "@/ikon/components/alert-dialog/dialog-context";
import { toast } from "sonner";

interface RoleProps {
  groups: never[];
  active: any;
  id: string;
  name: string;
  description?: string;
  softwareId: string;
}

function RoleTable({
  softwareId,
  roles,
  groups,
}: {
  softwareId: string;
  roles: any;
  groups: any;
}) {
  const [open, setOpen] = useState(false);
  const [roleData, setRoleData] = useState<RoleProps[]>([]);
  const [openUsersForm, setOpenUsersForm] = useState(false);
  const [openGroupForm, setOpenGroupForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null);
  const { closeDialog, openDialog } = useDialog();

  console.log("group details ", groups);

  const handleToggleActive = async (row: RoleProps) => {
    try {
      const updatedRow = {
        ...row,
        active: !row.active,
      };

      await updateRoleStatus(updatedRow);

      setRoleData((prevRoles) =>
        prevRoles.map((role) => (role.id === updatedRow.id ? updatedRow : role))
      );

      setSelectedRole(updatedRow);

      console.log(`Role "${row.name}" status toggled to ${updatedRow.active}`);
    } catch (error) {
      console.error("Error toggling role status:", error);
      alert("Failed to update role status.");

      setRoleData((prevRoles) => prevRoles);
    }
  };

  const appColumns: DTColumnsProps<RoleProps>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
  ];

  const extraParams: DTExtraParamsProps = {
    grouping: false,
    actionMenu: {
      items: [
        {
          label: "Edit",
          icon: Edit,
          onClick: (row) => {
            console.log("Edit users for:", row);
            setSelectedRole(row);
            setOpen(true);
          },
        },
        // {
        //   label: "Manage Users",
        //   icon: User,
        //   onClick: (row) => {
        //     setSelectedRole(row);
        //     setOpenUsersForm(true);
        //   },
        // },
        {
          label: "Manage Groups",
          icon: Group,
          onClick: (row) => {
            setSelectedRole(row);
            setOpenGroupForm(true);
          },
        },
        {
          label: "Deactivate",
          icon: Ban,
          onClick: (row) => {
            openDialog({
              title: "Deactivate Role",
              description: "Are you sure you want to deactivate this role?",
              confirmText: "Deactivate",
              cancelText: "Cancel",
              onConfirm: async () => {
                try {
                  setSelectedRole(row);
                  handleToggleActive(row);
                  toast.success("Role deactivated successfully");
                } catch (error) {
                  toast.error("Failed to deactivate role");
                }
              },
            });
          },
          visibility: (row) => {
            return row?.active;
          },
        },
        {
          label: "Activate",
          icon: Ban,
          onClick: (row) => {
            openDialog({
              title: "Activate Role",
              description: "Are you sure you want to activate this role?",
              confirmText: "Activate",
              cancelText: "Cancel",
              onConfirm: async () => {
                try {
                  setSelectedRole(row);
                  handleToggleActive(row);
                  toast.success("Role activated successfully");
                } catch (error) {
                  toast.error("Failed to activate role");
                }
              },
            });
          },
          visibility: (row) => {
            return !row?.active;
          },
        },
      ],
    },
    extraTools: [
      <Tooltip tooltipContent="Add Role" side={"top"} >
        <IconTextButton
          onClick={() => {
            setSelectedRole(null);
            setOpen(true);
          }}
        >
          <Plus />
        </IconTextButton>
      </Tooltip>,
    ],
  };

  async function handleSaveGroups(roleId: string, selectedGroupIds: string[]) {
    await updateGroupStatusInRole(roleId, selectedGroupIds);

    //  setRoles(prevRoles =>
    //       prevRoles.map((role: { id: any; }) =>
    //         role.id === updatedRole?.id ? updatedRole : role
    //       )
    //     );
  }

  return (
    <>
      <DataTable data={roles} columns={appColumns} extraParams={extraParams} />
      {open && (
        <RoleForm
          open={open}
          setOpen={setOpen}
          softwareId={softwareId}
          roleData={selectedRole}
        />
      )}

      {openUsersForm && selectedRole && (
        <ManageUsersForm
          open={openUsersForm}
          setOpen={setOpenUsersForm}
          roleId={selectedRole.id}
          roleName={selectedRole.name}
          onSave={(roleId: any, userIds: string | any[]) => {
            return console.log(
              `Saved ${userIds.length} users to role ${roleId}`
            );
          }}
        />
      )}

      {openGroupForm && selectedRole && (
        <ManageGroupsForm
          open={openGroupForm}
          setOpen={setOpenGroupForm}
          groups={groups}
          initialSelectedGroups={selectedRole.groups || []}
          onSave={(selectedGroupIds) => {
            handleSaveGroups(selectedRole.id, selectedGroupIds);
          }}
          roleName={selectedRole.name}
        />
      )}
    </>
  );
}

export default RoleTable;
