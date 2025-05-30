import FormInput from "@/ikon/components/form-fields/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shadcn/ui/dialog";
import { Form } from "@/shadcn/ui/form";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextButton } from "@/ikon/components/buttons";
import { UserData } from "../../data/dummy-user-data";


function UserForm({
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
        userName: z
            .string()
            .min(1, "User name must be at least 1 character long")
            .max(75, "User name must be at most 63 characters long"),
        userLogin: z
            .string()
            .min(1, "User login is required"),
        password: z.string()
            .min(1, "Password is required"),
        confirmPassword: z.string()
            .min(1, "Confirm password is required")
            .refine((value) => value === schema.password(), "Passwords do not match"),
        userEmail: z
            .string()
            .min(1, "Email is required")
            .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"),
        userPhone: z.string().optional(),
        userThumbnail: z.string().nullable().optional(),
        userType: z.string().optional(),
        active: z.boolean().optional(),
        accountId: z.string().optional(),
        userDeleted: z.boolean().optional(),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            userName: "",
            userLogin: "",
            password: "",
            userPhone: "",
            userEmail: "",
            userThumbnail: null,
            userType: "",
            active: true,
            accountId: "",
            userDeleted: false
        },
    });
    useEffect(() => {
        if (userData) {
            form.reset(userData);
        }
    }, [userData]);

    const saveUserData = async (data: z.infer<typeof schema>) => {
        if (userData) {
            // await updateUser(userData.userId, data);
            setUserData(null);
        } else {
            // await createUser(data);
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
                        <DialogTitle>Create User</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(saveUserData)}
                            className="space-y-4"
                        >
                            <FormInput
                                formControl={form.control}
                                name={"userName"}
                                label={"User Name"}
                                placeholder={"Enter User Name"}
                            />
                            <FormInput
                                formControl={form.control}
                                name={"userLogin"}
                                label={"User Login"}
                                placeholder={"Enter User Login"}
                            />
                            <FormInput
                                formControl={form.control}
                                name={"userEmail"}
                                label={"User Email"}
                                placeholder={"Enter User Email"}
                            />
                            <FormInput
                                formControl={form.control}
                                name={"userPhone"}
                                label={"User Phone"}
                                placeholder={"Enter Phone Number"}
                            />
                            <FormInput
                                formControl={form.control}
                                name={"password"}
                                label={"Password"}
                                type="password"
                                placeholder={"Enter Password"}
                            />
                            <FormInput
                                formControl={form.control}
                                name={"confirmPassword"}
                                label={"Confirm Password"}
                                type="password"
                                placeholder={"Confirm Password"}
                            />
                            <DialogFooter>
                                <TextButton type="submit">Create</TextButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UserForm;
