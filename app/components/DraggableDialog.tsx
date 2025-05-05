"use client";

import { useRef, useState, useEffect } from "react";

interface DraggableResizableDialogProps {
  children: React.ReactNode; 
    draggable?: boolean;
}

export default function DraggableResizableDialog({children , draggable }: DraggableResizableDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 300 });

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, e.clientX - dragOffset.x),
      y: Math.max(0, e.clientY - dragOffset.y),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Resize
  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const doDrag = (moveEvent: MouseEvent) => {
      setSize({
        width: Math.max(300, startWidth + moveEvent.clientX - startX),
        height: Math.max(200, startHeight + moveEvent.clientY - startY),
      });
    };

    const stopDrag = () => {
      window.removeEventListener("mousemove", doDrag);
      window.removeEventListener("mouseup", stopDrag);
    };

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  return (
    <div>
      <button
        onClick={openDialog}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Open Dialog
      </button>

      <dialog ref={dialogRef} className="backdrop:bg-black/30 border-none p-0">
        <div
          ref={wrapperRef}
          className="bg-white border rounded shadow-lg fixed"
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            minWidth: 300,
            minHeight: 200,
            zIndex: 50,
          }}
        >
          {/* Header (Draggable) */}
          <div
            className="bg-blue-600 text-white p-2 cursor-move rounded-t"
            onMouseDown={draggable ? handleMouseDown : undefined}
          >
            Drag Me
          </div>

          {/* Content */}
          <div className="p-4 overflow-auto h-full">
            <p>This is a draggable and resizable dialog.</p>
            <button
              onClick={closeDialog}
              className="mt-4 px-4 py-1 bg-red-500 text-white rounded"
            >
              Close
            </button>
            {children}
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={handleResize}
            className="w-4 h-4 bg-gray-400 absolute right-1 bottom-1 cursor-nwse-resize"
            style={{ zIndex: 100 }}
          />
        </div>
      </dialog>
    </div>
  );
}
