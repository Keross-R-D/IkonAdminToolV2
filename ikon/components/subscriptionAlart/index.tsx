import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SubscriptionAlartDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function SubscriptionAlartDialog({isOpen, setOpen} : SubscriptionAlartDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Please subscribe to go forward</AlertDialogTitle>
          <AlertDialogDescription>
            It seems you are not subscibed to the app. Please subscribe to make 
            sure you can access the data
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Subscibe</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
