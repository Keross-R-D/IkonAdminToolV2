"use client";

import { IconTextButton } from "@/ikon/components/buttons";
import { DataTable } from "@/ikon/components/data-table";
import {
  DTColumnsProps,
  DTExtraParamsProps,
} from "@/ikon/components/data-table/type";
import { Ban, Blocks, Edit, LucideBlocks, Plus, User } from "lucide-react";
import React, { useState } from "react";
import GroupForm from "../group-form";
import { ManageUsersForm } from "../manage-users-form";

interface GroupProps {
  id: string;
  name: string;
  description?: string;
  softwareId: string;
}

function GroupTable({
  softwareId,
  groups,
}: {
  softwareId: string;
  groups: any;
}) {
  const [open, setOpen] = useState(false);
  const [groupData, setGroupData] = useState<GroupProps[]>([]);
  const [openUsersForm, setOpenUsersForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupProps | null>(null);

  const appColumns: DTColumnsProps<GroupProps>[] = [
    {
      accessorKey: "name",
      header: "Group Name",
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
            setSelectedGroup(row);
            setOpen(true);
          },
        },
        {
          label: "Manage Users",
          icon: User,
          onClick: (row) => {
            setSelectedGroup(row);
            setOpenUsersForm(true);
          },
        },
        {
          label: "Deactivate",
          icon: Ban,
          onClick: (row) => {
            console.log("Deactivate group:", row);
          },
        },
      ],
    },
    extraTools: [
      <IconTextButton
        onClick={() => {
          setSelectedGroup(null);
          setOpen(true);
        }}
      >
        <Plus />
        Group
      </IconTextButton>,
    ],
  };

  return (
    <>
      <DataTable data={groups} columns={appColumns} extraParams={extraParams} />
      {open && (
        <GroupForm
          open={open}
          setOpen={setOpen}
          softwareId={softwareId}
          groupData={selectedGroup}
        />
      )}

      {openUsersForm && selectedGroup && (
        <ManageUsersForm
          open={openUsersForm}
          setOpen={setOpenUsersForm}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}
    </>
  );
}

export default GroupTable;
