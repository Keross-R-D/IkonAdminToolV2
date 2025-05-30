import FormInput from "@/ikon/components/form-fields/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Form } from "@/shadcn/ui/form";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextButton } from "@/ikon/components/buttons";
import dummyGroupData from "../../data/dummy-platform-groups";
import GroupsTable from "../platform-groups-table";

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


function MembershipForm({
    open,
    setOpen,
    userData,
    setUserData,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}) {
    const schema : any = z.object({
        
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
           
        },
    });
    useEffect(() => {
        if (userData) {
            form.reset(userData);
        }
    }, [userData]);

    const saveUserWiseMembershipData = async (data: z.infer<typeof schema>) => {
        if (userData) {
            // await updateUserMemebrship(userData.userId, data);
            setUserData(null);
        }
        setOpen(false);
    };

    return (
        <>
            <Dialog 
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        form.reset();
                        setUserData(null);
                    }
                    setOpen(isOpen);
                }}
                modal={true}
            >
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle>{userData?.userName} - Platform Membership</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(saveUserWiseMembershipData)}
                            className="space-y-4"
                        >
                            <GroupsTable groups={dummyGroupData} />
                            <DialogFooter>
                                <TextButton type="submit">Save</TextButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default MembershipForm;
