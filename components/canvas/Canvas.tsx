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

  const [isTyping, setIsTyping] = useState(false);

  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  const [textValue, setTextValue] = useState("");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isTyping) {
      textAreaRef.current?.focus();
    }
  }, [isTyping]);

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

    if (tool == "Text") {
      setTextPosition({ x, y });
      setTextValue("");
      setIsTyping(true);
      return;
    }

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
      const side = Math.max(width, height);
      setCurrentShape({
        type: "Square",
        id,
        x: x < startPoint.x ? startPoint.x - side : startPoint.x,
        y: y < startPoint.y ? startPoint.y - side : startPoint.y,
        side,
      });
    } else if (tool === "Circle") {
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

  const commitText = () => {
    const text = textValue.trim();
    if (text) {
      const newShape: Shape = {
        id: crypto.randomUUID(),
        x: textPosition.x,
        y: textPosition.y,
        text,
        type: "Text",
        fontSize: 20,
        fontFamily: "Arial",
        color: "#1e293b",
      };

      setShapes((prev) => [...prev, newShape]);
    }
    setIsTyping(false);
    setTextValue("");
  };

  const cancelText = () => {
    setIsTyping(false);
    setTextValue("");
  };

  const handleSelectTool = (nextTool: Tool) => {
    setTool(nextTool);
    // Abandon any in-progress gesture so it cannot finish as a different shape.
    setIsDrawing(false);
    setIsTyping(false);
    setCurrentShape(null);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    const hasArea =
      currentShape !== null &&
      (currentShape.type === "Circle"
        ? currentShape.radius > 0
        : currentShape.type === "Square"
          ? currentShape.side > 0
          : currentShape.type === "Rectangle"
            ? currentShape.width > 0 && currentShape.height > 0
            : false);

    if (currentShape && hasArea) {
      setShapes((prev) => [...prev, currentShape]);
    }
    setIsDrawing(false);
    setCurrentShape(null);
  };

  const drawShape = (
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    color: string,
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (shape.type === "Rectangle") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "Square") {
      ctx.strokeRect(shape.x, shape.y, shape.side, shape.side);
    } else if (shape.type === "Circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === "Text") {
      ctx.fillStyle = shape.color;
      ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
      ctx.textBaseline = "top";

      const lines = shape.text.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(line, shape.x, shape.y + index * shape.fontSize * 2);
      });
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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx);
  }, [shapes, currentShape, dimensions]);

  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden">
        <Toolbar tool={tool} onSelectTool={handleSelectTool} />
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

        {isTyping && (
          <textarea
            ref={textAreaRef}
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitText();
              }

              if (e.key === "Escape") {
                cancelText();
              }
            }}
            style={{
              position: "absolute",
              left: textPosition.x,
              top: textPosition.y,
              zIndex: 20,
              fontSize: 20,
              fontFamily: "Arial",
              color: "#1e293b",
              background: "transparent",
              minWidth: 200,
              minHeight: 30,
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              resize: "none",
            }}
            rows={1}
            placeholder="Type something..."
          />
        )}
      </div>
    </>
  );
}
