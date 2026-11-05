"use client";

import { useEffect, useRef, useState } from "react";
import type { Rectangle, Circle, Square, Tool } from "../../types/canvas";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("Rectangle");

  const [shapes, setShapes] = useState<Rectangle[]>([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  const [currentShape, setCurrentShape] = useState<Rectangle | Circle | Square | null>(null);

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
    if (tool !== "Rectangle") return;
    const { x, y } = getMousePosition(e);
    setStartPoint({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getMousePosition(e);
    setCurrentShape({
      id: crypto.randomUUID(),
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
    }
    setIsDrawing(false);
    setCurrentShape(null);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    shapes.forEach((shape) => {
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    });

    if (currentShape) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;

      ctx.strokeRect(
        currentShape.x,
        currentShape.y,
        currentShape.width,
        currentShape.height
      );
    }
  };

  const canvas = canvasRef.current;

  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx);
  }

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="block bg-white cursor-crosshair"
    ></canvas>
  );
}
