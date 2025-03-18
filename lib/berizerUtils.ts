import { getSmoothStepPath } from "@xyflow/react";

interface Point {
    x: number;
    y: number;
  }
  
  interface SquarishPathResult {
    /** The SVG path string with lines + arc corners at B and C. */
    bezierPath: string;
    /** Midpoint of the top edge between B and C (before rounding). */
    midX: number;
    midY: number;
  }
  
  /**
   * Create a boxy, 3-segment path (A->B->C->D) going **right-to-left**,
   * with rounded corners at B and C. 
   *
   * A = (startX, startY)
   * B = top "up-left" corner region
   * C = top "further left"
   * D = (endX, endY), endX < startX, endY = startY
   *
   * The shape is:
   *    A
   *      \
   *       B --- C
   *            \
   *             D
   *
   * @param startX        Rightmost x of the start
   * @param startY        y of the start
   * @param endX          Leftmost x of the end (endX < startX)
   * @param endY          y of the end (must equal startY)
   * @param height        How far "up" from baseline the top edges go
   * @param cornerRadius  Arc radius for rounding the two top corners
   *
   * @returns The SVG path string + midpoint of B->C
   */
  export function createRightToLeftSwoosh(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    height: number,
    cornerRadius: number
  ): SquarishPathResult {
    if (startY !== endY) {
      throw new Error("startY and endY must be the same (horizontal baseline).");
    }
    if (endX >= startX) {
      throw new Error("endX should be strictly less than startX for a right-to-left shape.");
    }
  
    // A = start
    const A: Point = { x: startX, y: startY };
  
    // B = right-bottom
    const B: Point = {
      x: startX + (height / 4),
      y: startY,
    };
  
    // C = "right-top"
    const C: Point = {
      x: startX + (height/4),
      y: startY - height,
    };
  
    // D = "left-top"
    const D: Point = { 
        x: endX - (height/4), 
        y: endY - height
    };

    // E = "left-bottom"
    const E: Point = {
        x: endX - (height/4),
        y: endY
    }

    // F = "end"
    const F: Point = {
        x: endX,
        y: endY
    }

  
    // Helper to compute the "corner start" and "corner end" for rounding at P2
    function roundCorner(p1: Point, p2: Point, p3: Point, r: number) {
      // Vector p1->p2
      const v12 = { x: p2.x - p1.x, y: p2.y - p1.y };
      const len12 = Math.hypot(v12.x, v12.y);
      const v12n = { x: v12.x / len12, y: v12.y / len12 }; // normalized
  
      // Vector p2->p3
      const v23 = { x: p3.x - p2.x, y: p3.y - p2.y };
      const len23 = Math.hypot(v23.x, v23.y);
      const v23n = { x: v23.x / len23, y: v23.y / len23 };
  
      // cornerStart = p2 - v12n * r
      const cornerStart: Point = {
        x: p2.x - v12n.x * r,
        y: p2.y - v12n.y * r,
      };
  
      // cornerEnd = p2 + v23n * r
      const cornerEnd: Point = {
        x: p2.x + v23n.x * r,
        y: p2.y + v23n.y * r,
      };
  
      return { cornerStart, cornerEnd };
    }
  
    // Round corner at B
    const { cornerStart: Bstart, cornerEnd: Bend } = roundCorner(A, B, C, cornerRadius);
  
    // Round corner at C
    const { cornerStart: Cstart, cornerEnd: Cend } = roundCorner(B, C, D, cornerRadius);
  
    // Round corner at D
    const { cornerStart: Dstart, cornerEnd: Dend } = roundCorner(C, D, E, cornerRadius);

    // Round corner at E
    const { cornerStart: Estart, cornerEnd: Eend } = roundCorner(D, E, F, cornerRadius);


    // Now build the path:
    // A -> B -> C -> D -> E -> F

    //
    // We guess the final flags as "0 0 1" for each corner. If that arcs the wrong way,
    // you can flip the last flag to "0" or "1".
    const pathCommands = [
        // Move to point A
        `M ${A.x},${A.y}`,
      
        // Line to the start of the rounded corner at B
        `L ${Bstart.x},${Bstart.y}`,
      
        // Arc around corner B (sweep-flag set to 0 for outward bend)
        `A ${cornerRadius},${cornerRadius} 0 0 0 ${Bend.x},${Bend.y}`,
      
        // Line to the start of the rounded corner at C
        `L ${Cstart.x},${Cstart.y}`,
      
        // Arc around corner C (sweep-flag set to 0 for outward bend)
        `A ${cornerRadius},${cornerRadius} 0 0 0 ${Cend.x},${Cend.y}`,
      
        // Line to the start of the rounded corner at D
        `L ${Dstart.x},${Dstart.y}`,
      
        // Arc around corner D (sweep-flag set to 0 for outward bend)
        `A ${cornerRadius},${cornerRadius} 0 0 0 ${Dend.x},${Dend.y}`,
      
        // Line to the start of the rounded corner at E
        `L ${Estart.x},${Estart.y}`,
      
        // Arc around corner E (sweep-flag set to 0 for outward bend)
        `A ${cornerRadius},${cornerRadius} 0 0 0 ${Eend.x},${Eend.y}`,
      
        // Line back to point F (same as A)
        `L ${F.x},${F.y}`,
      
        // Close the path
        'Z',
      ];
  
    const bezierPath = pathCommands.join(" ");
  
    // Midpoint of the top segment B->C (before rounding)
    const midX = (startX + endX) / 2;
    const midY = startY - height;
  
    return { bezierPath, midX, midY };
}
  