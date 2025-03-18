import { useState } from "react";

// Define types for the state and the return values
type EdgeHeightState = Record<string, number>;

type EdgeHeightManager = [
  (source: string, target: string) => number, // getNextHeight function
  (source: string, target: string) => void // removeEdge function
];

const getEdgeHeightManager = (
  initialEdgeHeight: number = 150,
  incrementStepValue: number = 20
): EdgeHeightManager => {
  const [edgeHeightCounter, setEdgeHeightCounter] = useState<EdgeHeightState>({});

  const getNextHeight = (source: string, target: string): number => {
    const _key = `${source}_${target}`;
    let nextHeight = initialEdgeHeight;

    setEdgeHeightCounter((currentHeights) => {
      const currentHeight = currentHeights[_key] || initialEdgeHeight;
      nextHeight = currentHeight + incrementStepValue;

      return {
        ...currentHeights,
        [_key]: nextHeight,
      };
    });

    return nextHeight;
  };

  const removeEdge = (source: string, target: string): void => {
    const _key = `${source}_${target}`;

    setEdgeHeightCounter((currentHeights) => {
      const currentHeight = currentHeights[_key];
      if (!currentHeight || currentHeight === initialEdgeHeight) {
        return currentHeights;
      }

      const newHeight = currentHeight - incrementStepValue;

      return {
        ...currentHeights,
        [_key]: newHeight,
      };
    });
  };

  return [getNextHeight, removeEdge];
};

export default getEdgeHeightManager;
