"use client";
import { DataTable } from "@/ikon/components/data-table";
import {
    DTColumnsProps,
    DTExtraParamsProps,
} from "@/ikon/components/data-table/type";
import React from "react";
import { Edit, Plus, Trash, UserCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { IconTextButton } from "@/ikon/components/buttons";
import { useDialog } from "@/ikon/components/alert-dialog/dialog-context";
import UserForm from "../create-user-form";
import { useRouter } from "next/navigation";

import MembershipForm from "../platform-membership-form";

interface UserData {
    userId: string;
    userName: string;
    userLogin: string;
    password: string;
    userPhone?: string;
    userEmail: string;
    userThumbnail?: string | null;
    userType?: string;
    active?: boolean;
    accountId?: string;
    userDeleted?: boolean;
}


function UsersTable({ users }: { users: UserData[] }) {
    const router = useRouter();
    const [userData, setUserData] = React.useState<UserData | null>(null);
    const [open, setOpen] = React.useState(false);
    const [openMembership, setOpenMembership] = React.useState(false);
    const { closeDialog, openDialog } = useDialog();

    const userColumns: DTColumnsProps<UserData>[] = [
        {
            accessorKey: "userName",
            header: "Name",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        {row.original.userThumbnail && (
                            <img
                                src={row.original.userThumbnail}
                                alt="User Thumbnail"
                                style={{
                                    width: "25px",
                                    height: "25px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                        {!row.original.userThumbnail && (
                            <UserCircle
                                size={25}
                            />
                        )}
                        {row.getValue("userName")}
                    </div>
                );
            }
        },
        {
            accessorKey: "userLogin",
            header: "Login",
        },
        {
            accessorKey: "userEmail",
            header: "Email",
        },
        {
            accessorKey: "userPhone",
            header: "Phone",
        },
        {
            accessorKey: "userType",
            header: "Type",
        },
        {
            accessorKey: "active",
            header: "Active",
            cell: ({ row }) => {
                return row.getValue("active") ? "Yes" : "No";
            },
        },
    ];

    const extraParams: DTExtraParamsProps = {
        grouping: false,
        actionMenu: {
            items: [
                {
                    label: "Platform Membership",
                    icon: Users,
                    onClick: (row) => {
                        setUserData(row);
                        setOpenMembership(true);
                    }
                },
                {
                    label: "Edit",
                    icon: Edit,
                    onClick: (row) => {
                        setUserData(row);
                        setOpen(true);
                    },
                },
                {
                    label: "Delete",
                    icon: Trash,
                    onClick: async (row) => {
                        openDialog({
                            title: "Delete User",
                            description: "Are you sure you want to delete this user?",
                            confirmText: "Delete",
                            cancelText: "Cancel",
                            onConfirm: async () => {
                                try {
                                    //await deleteUser(row.id);
                                    toast.success("User deleted successfully");
                                } catch (error) {
                                    toast.error("Failed to delete user");
                                }
                            },
                        });
                    },
                },
            ],
        },
        extraTools: [
            <IconTextButton onClick={() => setOpen(true)}>
                <Plus />
                Create
            </IconTextButton>,
        ],
    };
    return (
        <>
            <DataTable data={users} columns={userColumns} extraParams={extraParams} />
            {open && (
                <UserForm
                    open={open}
                    setOpen={setOpen}
                    userData={userData}
                    setUserData={setUserData}
                />
            )}
            {openMembership && (
                <MembershipForm
                    open={openMembership}
                    setOpen={setOpenMembership}
                    userData={userData}
                    setUserData={setUserData}
                />   
            )}
        </>
    );
}

export default UsersTable;
