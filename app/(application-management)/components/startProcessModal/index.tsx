import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import { Label } from "@/shadcn/ui/label";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";

const ProcessModal = ({ isOpen = false, setIsOpen, startProcessCallback }) => {
  const [processInstanceIdentifierFields, setProcessInstanceIdentifierFields] =
    useState("");
  const [dataText, setDataText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [jsonError, setJsonError] = useState("");

  const handleDataChange = (value) => {
    setDataText(value);
    setJsonError("");

    if (value.trim() === "") {
      setParsedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setParsedData(parsed);
    } catch (error) {
      setJsonError("Invalid JSON format");
      setParsedData(null);
    }
  };

  const handleSubmit = () => {
    if (jsonError) {
      alert("Please fix JSON errors before submitting");
      return;
    }

    const formData = {
      processInstanceIdentifierFields,
      data: parsedData,
    };

    console.log("Form submitted:", formData);

    startProcessCallback(formData)
    // Reset form
    setProcessInstanceIdentifierFields("");
    setDataText("");
    setParsedData(null);
    setJsonError("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setProcessInstanceIdentifierFields("");
    setDataText("");
    setParsedData(null);
    setJsonError("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Open Process Modal
        </Button>
      </DialogTrigger> */}

      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Process Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Process Instance Identifier Fields */}
          <div className="space-y-2">
            <Label
              htmlFor="identifier"
              className="text-sm font-medium text-gray-700"
            >
              Process Instance Identifier Fields
            </Label>
            <Input
              id="identifier"
              value={processInstanceIdentifierFields}
              onChange={(e) =>
                setProcessInstanceIdentifierFields(e.target.value)
              }
              placeholder="Enter identifier fields"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data Field */}
          <div className="space-y-2">
            <Label htmlFor="data" className="text-sm font-medium text-gray-700">
              Data (JSON)
            </Label>
            <Textarea
              id="data"
              value={dataText}
              onChange={(e) => handleDataChange(e.target.value)}
              placeholder='Enter JSON data, e.g., {"key": "value", "number": 123}'
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />

            {/* JSON Error Display */}
            {jsonError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">
                  {jsonError}
                </AlertDescription>
              </Alert>
            )}

            {/* Parsed JSON Preview */}
            {parsedData && !jsonError && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <Label className="text-sm font-medium text-green-800">
                  Parsed JSON:
                </Label>
                <pre className="text-xs text-green-700 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={jsonError && dataText.trim() !== ""}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

{
  /* <div className="p-8">
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Try Some Sample JSON:
        </h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() =>
              handleDataChange(
                '{"name": "John Doe", "age": 30, "active": true}'
              )
            }
            className="text-sm"
          >
            Sample User Data
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              handleDataChange(
                '{"process": "approval", "status": "pending", "priority": "high", "metadata": {"department": "finance", "amount": 1500}}'
              )
            }
            className="text-sm ml-2"
          >
            Sample Process Data
          </Button>
        </div>
      </div>
    </div> */
}

export default ProcessModal;
