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
import { toast } from "sonner";

interface SubscriptionAlartDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

async function subscribeToApp() {
  const subscriptionUrl = "/api/remote/subscription/subscribe";
  const response = await fetch(
    subscriptionUrl,
    {
      method: "POST",
    }
  )

  if(!response.ok) {
    return false;
  }

  else {
    const {subscriptionStatus} = await response.json();
    return subscriptionStatus;
  }
}

async function subscribeBtnOnClick(setOpenCallback: (open: boolean) => void) {
  const subscriptionStatus = await subscribeToApp();
  if(subscriptionStatus) {
    toast.success('subscribed to the app in current environment successfully');
    setOpenCallback(false);
  }
  else{
    toast.error('failed to subscribe to app in the current environment. please try again');
  }
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
          <AlertDialogAction onClick={()=>{subscribeBtnOnClick(setOpen)}}>Subscibe</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
