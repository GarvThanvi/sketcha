"use client";

import { useEffect, useRef, useState } from "react";
import type { Shape, Tool } from "../../types/canvas";
import Toolbar from "./Toolbar";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("Rectangle");

  const [shapes, setShapes] = useState<Shape[]>([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  const [currentShape, setCurrentShape] = useState<Shape | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  //starts drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "selection") return;
    const { x, y } = getMousePosition(e);
    setStartPoint({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getMousePosition(e);

    const width = Math.abs(x - startPoint.x);
    const height = Math.abs(y - startPoint.y);
    const left = Math.min(startPoint.x, x);
    const top = Math.min(startPoint.y, y);
    const id = crypto.randomUUID();

    if (tool === "Rectangle") {
      setCurrentShape({
        type: "Rectangle",
        id,
        x: left,
        y: top,
        width,
        height,
      });
    } else if (tool === "Square") {
      // Side follows the larger drag dimension. When dragging up or left,
      // shift the corner so the square stays attached to the cursor.
      const side = Math.max(width, height);
      setCurrentShape({
        type: "Square",
        id,
        x: x < startPoint.x ? startPoint.x - side : startPoint.x,
        y: y < startPoint.y ? startPoint.y - side : startPoint.y,
        side,
      });
    } else {
      // Circle fits inside the drag box: center it, and use the smaller dimension.
      const radius = Math.min(width, height) / 2;
      setCurrentShape({
        type: "Circle",
        id,
        x: left + width / 2,
        y: top + height / 2,
        radius,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    // Ignore a click without a drag, and degenerate shapes.
    const hasArea =
      currentShape !== null &&
      (currentShape.type === "Circle"
        ? currentShape.radius > 0
        : currentShape.type === "Square"
          ? currentShape.side > 0
          : currentShape.width > 0 && currentShape.height > 0);

    if (currentShape && hasArea) {
      setShapes((prev) => [...prev, currentShape]);
    }
    setIsDrawing(false);
    setCurrentShape(null);
  };

  const drawShape = (
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    color: string
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (shape.type === "Rectangle") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "Square") {
      ctx.strokeRect(shape.x, shape.y, shape.side, shape.side);
    } else {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    shapes.forEach((shape) => {
      drawShape(ctx, shape, "#1e293b");
    });

    if (currentShape) {
      drawShape(ctx, currentShape, "#3b82f6");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    draw(ctx);
  }, [shapes, currentShape])

  return (
    <>
      <Toolbar tool={tool} onSelectTool={setTool} />
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="block bg-white cursor-crosshair"
        style={{ cursor: "crosshair" }}
      ></canvas>
    </>
  );
}
