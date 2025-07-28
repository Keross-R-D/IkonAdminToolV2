import React, { useState } from "react";
import {
  BaseEdge,
  BezierEdge,
  EdgeLabelRenderer,
  EdgeText,
  getSmoothStepPath,
  SmoothStepEdge,
  type EdgeProps,
} from "@xyflow/react";
import EdgeTransitionCategory from "@/enums/edgeTransitionType";
import { Handle, NodeToolbar, Position } from "@xyflow/react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cog, Trash } from "lucide-react";

import EdgeInfoModal from "@/components/generic/edgeInfo";
import { createRightToLeftSwoosh } from "@/lib/berizerUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface CustomEdgeProps extends EdgeProps {
  data: {
    deleteEdge: (id: string) => void;
    height: number;
    edgeColor: string;
    modifyEdgeInfo: (edgeId: string) => void;
    edgeTransitionCategory: EdgeTransitionCategory;
    edgeAdditionalInfo: {
      sourceNodeId: string;
      targetNodeId: string;
      linkName: string;
      linkId: string;
      actionDefinition: {
        actionValidationScriptId: string | null;
        messageBinding: string | null;
        transitionActionScriptId: string | null;
      };
      jobProcess: {
        jobScriptId: string | null;
        jobDelay: number | 0;
        jobDelayUnit: "hour" | "minute" | undefined;
        scheduleType: "once" | "repeating" | "cron" | undefined;
        repeatCount: number | 0;
        interval: number | 0;
        intervalUnit: "hour" | "minute" | undefined;
      };
      isJobActive: boolean;
      conditionId: string;
    };
  };
}

const SelfConnecting = (props: CustomEdgeProps) => {
  // we are using the default bezier edge when source and target ids are different
  // if (props.source !== props.target) {
  //     return <SmoothStepEdge {...props} />;
  // }

  const { sourceX, sourceY, targetX, targetY, id, markerEnd, label } = props;
  //const height = 150 + Math.floor(Math.random() * 100);

  const x = sourceX;
  const y = sourceY;

  const { sourcePosition, targetPosition } = props;

  let [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (props.source === props.target) {
    const { bezierPath, midX, midY } = createRightToLeftSwoosh(
      sourceX,
      sourceY,
      targetX,
      targetY,
      props.data.height,
      2
    );

    path = bezierPath;
    labelX = midX;
    labelY = midY;
  }

  const isSelected = props.selected;
  const edgeAdditionalInfo = props.data.edgeAdditionalInfo;

  const getCurrentTheme = (): "light" | "dark" | "system" | undefined => {
    const { theme } = useTheme();
    if (theme === "light" || theme === "dark" || theme === "system") {
      return theme;
    }
    return "dark";
  };

  return (
    <>
      <BaseEdge
        path={path}
        key={id}
        markerEnd={markerEnd}
        label={label}
        style={{
          strokeWidth: 4,
          stroke: `hsl(${props.data.edgeColor} 100% ${
            getCurrentTheme() === "light" ? "40%" : "80%"
          })`,
        }}
      />
      <EdgeLabelRenderer key={`edge_renderer_${id}`}>
        <div
          // style={{
          //   transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
          // }}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="button-edge__label nodrag nopan"
        >
          <Card className="!p-0">
            <CardContent className="p-3">
              <Label className="">{label}</Label>
              <div className="flex flex-col items-center gap-2">
                {isSelected ? (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant={"outline"}
                      style={{ pointerEvents: "auto" }}
                      onClick={() => {
                        if (props && props.data && props.data.deleteEdge) {
                          props.data.deleteEdge(props.id);
                        }
                      }}
                    >
                      <Trash />
                    </Button>
                    <EdgeInfoModal
                      edgeInfoDefaultValues={{
                        //generic
                        edgeLabel: label?.toString() || "",
                        processJob: edgeAdditionalInfo.processJob,
                        actionDefinition: edgeAdditionalInfo.actionDefinition,

                        //job
                        isJobActive: edgeAdditionalInfo.isJobActive
                          ? edgeAdditionalInfo.isJobActive
                          : undefined,
                        // jobScript: edgeAdditionalInfo.processJob?.jobScriptId ? edgeAdditionalInfo.processJob?.jobScriptId.toString() : undefined,
                        // jobStartDelay: edgeAdditionalInfo.processJob?.jobDelay ? edgeAdditionalInfo.processJob.jobDelay.toString() : undefined,
                        // jobStartDelayUnit: edgeAdditionalInfo.processJob.jobDelayUnit ? edgeAdditionalInfo.processJob.jobDelayUnit.toString() : undefined,
                        // jobFrequency: edgeAdditionalInfo.processJob.scheduleType ? edgeAdditionalInfo.processJob.scheduleType.toString() : undefined,
                        // jobRepetitionCount: edgeAdditionalInfo.processJob.jobRepeatationCount ? edgeAdditionalInfo.processJob.jobRepeatationCount.toString() : undefined,
                        // jobRepeatationDelay: edgeAdditionalInfo.processJob.interval ? edgeAdditionalInfo.processJob.interval.toString() : undefined,
                        // jobRepeatationUnit: edgeAdditionalInfo.processJob.intervalUnit ? edgeAdditionalInfo.processJob.intervalUnit.toString() : undefined,

                        // // action
                        // actionValidatationScript: edgeAdditionalInfo.actionDefinition.actionValidatationScript ? edgeAdditionalInfo.actionDefinition.actionValidatationScript.toString() : undefined,
                        // transitionScript: edgeAdditionalInfo.actionDefinition.transitionScript ? edgeAdditionalInfo.actionDefinition.transitionScript.toString() : undefined,
                        // messageBinding: edgeAdditionalInfo.actionDefinition.messageBinding ? edgeAdditionalInfo.actionDefinition.messageBinding.toString() : undefined,

                        // condition
                        conditionId: edgeAdditionalInfo.conditionId
                          ? edgeAdditionalInfo.conditionId.toString()
                          : undefined,
                      }}
                      onSubmitCallback={props.data.modifyEdgeInfo}
                      edgeTransitionCategory={props.data.edgeTransitionCategory}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
export default SelfConnecting;
