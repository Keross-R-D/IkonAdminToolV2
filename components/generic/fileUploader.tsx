"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, ChangeEvent, FormEvent } from "react";

import {decodeProcessModel} from '@/lib/utils';
import { Upload } from "lucide-react";

// Define the expected structure for the process model data
interface ProcessModel {
  [key: string]: any; // Replace this with actual structure if you know the model's data shape
}

const FileUploader = ({ setProcessModel }: { setProcessModel: (model: ProcessModel) => void }) => {
  const [processModelFile, setProcessModelFile] = useState<File | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (processModelFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
            const text = event.target?.result as string; // Contains file content as a string
            let workflowData = JSON.parse(text);
            workflowData = decodeProcessModel(workflowData);

            console.log(workflowData);

            // Pass the data to the setProcessModel function
            setProcessModel(workflowData);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      reader.readAsText(processModelFile); // Reads the file as text

      // clear the input after reading
      setProcessModelFile(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setProcessModelFile(event.target.files[0]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
            <Button variant="outline" size="icon"><Upload/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Project workflow</DialogTitle>
                <DialogDescription>Upload and view your project workflow</DialogDescription>
            </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label htmlFor="projectModelInpt" className="text-right">
                Project model
            </Label>
            <Input
                type="file"
                id="projectModelInpt"
                className="col-span-3"
                onChange={handleFileChange}
            />
        </div>
            <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                        Submit
                </Button>
            </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
