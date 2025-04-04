"use client";
import { DataTable } from "@/ikon/components/data-table";
import { DTColumnsProps, DTExtraParamsProps } from "@/ikon/components/data-table/type";
import React from "react";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { GroupData } from "../../data/dummy-platform-groups";

function GroupsTable({ groups }: { groups: GroupData[] }) {
    
    const [groupData, setGroupData] = React.useState<GroupData | null>(null);

    const groupColumns: DTColumnsProps<GroupData>[] = [
        {
            accessorKey: "groupName",
            header: "Name",
        },
        {
            accessorKey: "groupDescription",
            header: "Description",
        },
        {
            header: "Assign",
            cell: ({ row }) => (
                <Checkbox
                    id={row.original.groupId}
                    checked={row.original.users.includes(row.original.groupId)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setGroupData(row.original);
                        }
                        else {
                            setGroupData(null);
                        }
                    }}
                />
            ),
        }
    ];

    const extraParams: DTExtraParamsProps = {
        grouping: false,
    };
    return (
        <>
            <DataTable data={groups} columns={groupColumns} extraParams={extraParams} />
        </>
    );
}

export default GroupsTable;
