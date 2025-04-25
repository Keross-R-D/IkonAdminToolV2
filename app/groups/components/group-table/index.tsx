"use client";

import { IconTextButton } from "@/ikon/components/buttons";
import { DataTable } from "@/ikon/components/data-table";
import {
  DTColumnsProps,
  DTExtraParamsProps,
} from "@/ikon/components/data-table/type";
import {
  Ban,
  Edit,
  Plus,
  User,
} from "lucide-react";
import React, { useState } from "react";
import GroupForm from "../group-form";
import { ManageUsersForm } from "../manage-users-form";
import { updateGroupStatus } from "../update-group-status";
import { Tooltip } from "@/ikon/components/tooltip";

interface GroupProps {
  active: any;
  id: string;
  name: string;
  description?: string
}

function GroupTable({
  groups,
}: {
  groups: any;
}) {
  const [open, setOpen] = useState(false);
  const [groupData, setGroupData] = useState<GroupProps[]>([]);
  const [openUsersForm, setOpenUsersForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupProps | null>(null);

  const handleToggleActive = async (row: GroupProps) => {
    try {
      const updatedRow = {
        ...row,
        active: !row.active,
      };
  
      await updateGroupStatus(updatedRow);
  
      setGroupData((prevGroups) =>
        prevGroups.map((group) =>
          group.id === updatedRow.id ? updatedRow : group
        )
      );
  
      setSelectedGroup(updatedRow);
  
      console.log(`Group "${row.name}" status toggled to ${updatedRow.active}`);
    } catch (error) {
      console.error("Error toggling group status:", error);
      alert('Failed to update group status.');
      
      setGroupData((prevGroups) => prevGroups);
    }
  };

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
        // {
        //   label: "Manage Users",
        //   icon: User,
        //   onClick: (row) => {
        //     setSelectedGroup(row);
        //     setOpenUsersForm(true);
        //   },
        // },
        {
          label: "Deactivate" ,
          icon: Ban ,
          onClick: (row) => {
            setSelectedGroup(row);
            handleToggleActive(row);
          },
          visibility:(row) => {
            return row?.active
          }
        },
        {
          label: "Activate" ,
          icon: Ban ,
          onClick: (row) => {
            setSelectedGroup(row);
            handleToggleActive(row);
          },
          visibility:(row) => {
            return !row?.active
          }
        },
      ],
    },
    extraTools: [
      <Tooltip tooltipContent="Add Group" side={"top"} >
      <IconTextButton
        onClick={() => {
          setSelectedGroup(null);
          setOpen(true);
        }}
      >
        <Plus />
        
      </IconTextButton>
      </Tooltip>,
    ],
  };

  return (
    <>
      <DataTable data={groups} columns={appColumns} extraParams={extraParams} />
      {open && (
        <GroupForm
          open={open}
          setOpen={setOpen}
          groupData={selectedGroup}
        />
      )}

      {openUsersForm && selectedGroup && (
        <ManageUsersForm
          open={openUsersForm}
          setOpen={setOpenUsersForm}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onSave={(groupId: any, userIds: string | any[]) => {
            return console.log(
              `Saved ${userIds.length} users to group ${groupId}`
            );
          }}
        />
      )}
    </>
  );
}

export default GroupTable;
