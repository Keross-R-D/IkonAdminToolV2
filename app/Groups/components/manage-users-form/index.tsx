"use client";

import { Checkbox } from "@/shadcn/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shadcn/ui/form";
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
  groupId: string;
  groupName: string;
}

export function ManageUsersForm({ open, setOpen, groupId, groupName }: ManageUsersFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      users: [], 
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Selected users:", data.users);
    console.log("For group:", groupId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Users for {groupName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {dummyUserData.map((user) => (
                <FormField
                  key={user.userId}
                  control={form.control}
                  name="users"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(user.userId)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, user.userId])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== user.userId
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {user.userName} ({user.userEmail})
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <TextButton type="submit">Save</TextButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}