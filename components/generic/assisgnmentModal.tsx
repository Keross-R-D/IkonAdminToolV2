import { 
    Dialog, 
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Button
} from "@/components/ui/button";
import { Users } from "lucide-react";

const AssignmentModal = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <Users/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Task assignment</DialogTitle>
                </DialogHeader>
                <p>In Progress</p>
            </DialogContent>
        </Dialog>
    )
}

export default AssignmentModal;